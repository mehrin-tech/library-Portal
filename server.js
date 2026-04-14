import dotenv from 'dotenv'
dotenv.config()

import express from 'express'

import connectDB from './config/db.js'
import http from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { errorHandler } from'./Middlewares/errHandling.js'
import { attachStd } from './Utils/stdMiddleware.js'


import privateChat from './sockets/privateChat.js'

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)

const app= express()
app.disable('x-powered-by')

const server = http.createServer(app)
const io = new Server(server)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
//global middlwares
app.use(helmet({
  contentSecurityPolicy:{
    directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net"
        ],

        scriptSrcAttr: ["'self'", "'unsafe-inline'"],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://fonts.googleapis.com"
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],

        imgSrc: ["'self'", "data:", "https://*"],
      },
  },
  crossOriginEmbedderPolicy:false,
  crossOriginResourcePolicy:false
}))
 app.use(morgan('dev'))
 app.use(compression())
app.use(cors())
//app.use(rateLimit({windowMs:15*60*1000,max:100}))
const limiter=rateLimit({
  windowMs:15*60*1000,
  max:100,
  message:"Too many attempts,please try again later.."
})



app.use(express.json())

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')))

app.use(limiter)


//route files imprt
import userRouter from './Routes/userRoutes.js'
import adminRouter from './Routes/adminRoutes.js'
import categoryRouter from './Routes/categoryRoutes.js'
import userCategoryRouter from './Routes/userCategoryRoutes.js'

//routes
app.use('/User', userRouter)
app.use('/admin', adminRouter)
app.use('/admin/category', categoryRouter)
app.use('/User/category',userCategoryRouter)




app.get('/',attachStd, (req, res) => {
   
  res.render('home',{
    isLoggedIn:!!req.student,
    username:req.student?req.student.username:null
   })
 

})



//socket code
privateChat(io)

//err handerler
app.use(errorHandler)
const PORT=process.env.PORT || 3001

const startServer=async()=>{
  try{
    await connectDB()

    server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)}) 
  }catch(err){
    console.error("server start failed:",err)
    process.exit(1)
  }
}
startServer()
