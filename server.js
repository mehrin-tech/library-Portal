require('dotenv').config()

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const cookieParser = require('cookie-parser')


const helmet=require('helmet')
const cors=require('cors')
const compression=require('compression')
const morgan=require('morgan')
const rateLimit=require('express-rate-limit')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.set('view engine', 'ejs')
app.set('views','views')
app.set('views', path.join(__dirname, 'views'))
//global middlwares
app.use(helmet({
  contentSecurityPolicy:{
    directives:{
      "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com","https://cdn.jsdelivr.net" ], 
     
        "script-src-attr": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
        "img-src": ["'self'", "data:", "https://*"],
    },
  },
  crossOriginEmbedderPolicy:false,
  crossOriginResourcePolicy:false
}))
 app.use(morgan('dev'))
 app.use(compression())
app.use(cors())
app.use(rateLimit({windowMs:15*60*1000,max:100}))//reqst count track cheyyan


//body +cookie
app.use(express.urlencoded({ extended: true }))//html form data parse chyyn
app.use(express.json())//jsn rqst bdy read chyyn
app.use(cookieParser())//cookies parse chyyn

//static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));//uploded images/files serve chyyn
app.use(express.static(path.join(__dirname, 'public')))//css,js.images serve chyyn




//route files imprt
const userRouter = require('./Routes/userRoutes')
const adminRouter = require('./Routes/adminRoutes')
const categoryRouter = require('./Routes/categoryRoutes')
const userCategoryRouter=require('./Routes/userCategoryRoutes')
//const resourceRouter=require('./Routes/resourceRoutes')
//err hndler mddlwre
const { errorHandler } = require('./Middlewares/errHandling')
const { preventStdLogin } = require('./Utils/stdMiddleware')


//routes
app.use('/User', userRouter)
app.use('/admin', adminRouter)
app.use('/admin/category', categoryRouter)
app.use('/User/category',userCategoryRouter)




app.get('/',preventStdLogin, (req, res) => {
  
  res.render('home',{
    isLoggedIn:!!req.student,
    username:req.student?req.student.username:null
   })
 

})


//create room
function createRoom(a, b) {
  return [String(a), String(b)].sort().join('-')
}

const dmStore = new Map()

io.on('connection', (socket) => {
  console.log('connected:', socket.id)

  //join chat
  socket.on('chat:join', ({ fromUser, toUser, fromRole, toRole }) => {
    //role check
    const isAdminStd =
      (fromRole === 'admin' && toRole === 'student') ||
      (fromRole === 'student' && toRole === 'admin')

    if (!isAdminStd) {
      console.log('Blocked: invalid chat attempt')
      return
    }

    const room = createRoom(fromUser, toUser)
    socket.join(room)


    console.log('joined room:', room)

    //send  old mesgs if exist
    const history = dmStore.get(room) || []
    if (history.length) {
      socket.emit('room:history', history)
    }
  })

  //sendmsg
  socket.on('chat:msg', ({ fromUser, toUser, fromRole, toRole, txt }) => {


    const isAdminStd =
      (fromRole === 'admin' && toRole === 'student') ||
      (fromRole === 'student' && toRole === 'admin');

    if (!isAdminStd) {
      console.log("Blocked message attempt");
      return;
    }

    if (!fromUser || !toUser || !txt) return;

    const room = createRoom(fromUser, toUser)

    const msg = { fromUser, toUser, txt }

    const list = dmStore.get(room) || []

    list.push(msg)
    dmStore.set(room, list)
    console.log('dmstore:', dmStore)
    io.to(room).emit('chat:newMsg', msg)
  })
  socket.on('disconnect', () => {

    console.log('user disconnected:', socket.id)
  })

})




//err handerler
app.use(errorHandler)

server.listen(3001, () => console.log('http://localhost:3001')) 