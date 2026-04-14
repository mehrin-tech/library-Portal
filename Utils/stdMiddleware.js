import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { UnauthorizedError, ForbiddenError } from './error.js'
const JWT_SECRET='yoursecretkey'


function tokenCreate(student){
    return jwt.sign({id:student._id.toString(),
        username:student.username,
        role:'student'},
        JWT_SECRET,
        {expiresIn:'1hr'}
    )
}
function requireStdAuth(req,res,next){
    const token=req.cookies?.token
   
    if(!token) return next(new UnauthorizedError('student not authorized'))
    
        try{
            const payload=jwt.verify(token,JWT_SECRET)
           // console.log('payload:',payload)
            if(payload.role!== 'student') return next(new ForbiddenError('Access denied'))
                
            req.student = {
      id: payload.id,
      username: payload.username,
      role: payload.role
    }
                    // req.student=payload
                
            next()
                
        
        }catch(err){
            next(err)
        }
}



function preventStdLogin(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    //req.student = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // User.findById(payload.studentId).then(student=>{
    //      req.student = student ||null
    // })
   if(payload.role==='student'){
    return res.redirect(`/User/dashboard/${payload.id}`)
   }else{
    return next(new ForbiddenError('Acess denied'))
   }
  
  } catch (err) {
    //req.student = null;
     next();
  }

 
}

function attachStd(req,res,next){
  const token=req.cookies?.token

  if(!token){
    req.student=null;
    return next()
  }

   try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.role === "student") {
      req.student = {
        id: payload.id,
        username: payload.username,
        role: payload.role
      };
    } else {
      req.student = null;
    }

  } catch (err) {
    req.student = null;
  }

  next();
}

   


export{tokenCreate,requireStdAuth,preventStdLogin,attachStd}