const jwt=require('jsonwebtoken')
const { UnauthorizedError, ForbiddenError } = require('./error')
const JWT_SECRET='yoursecretkey'
const student=[{id:0,username:'Hanah',password:'1234',role:'student',name:'Hanah'},
    { id: 1, username: 'amna', password: '1234', role: 'student', name: 'amna' },
{ id: 2, username: 'hasna', password: '1234', role: 'student', name: 'hasna' }
]

function tokenCreate(student){
    return jwt.sign({id:student.id,username:student.username,role:'student'},
        JWT_SECRET,
        {expiresIn:'1hr'}
    )
}
function requireStdAuth(req,res,next){
    const token=req.cookies?.token
    //console.log('token:',token)
    if(!token) return next(new UnauthorizedError('student not authorized'))
    
        try{
            const payload=jwt.verify(token,JWT_SECRET)
           // console.log('payload:',payload)
            if(payload.role!== 'student') return next(new ForbiddenError('Access denied'))
                
         req.student=payload
                //console.log('req.student:',req.student)
            next()
        }catch(err){
            next(err)
        }
}



function preventStdLogin(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    req.student = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.student = payload;
  } catch (err) {
    req.student = null;
  }

  next();
}


   


module.exports={tokenCreate,requireStdAuth,preventStdLogin,student}