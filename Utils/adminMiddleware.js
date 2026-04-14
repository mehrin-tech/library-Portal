import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UnauthorizedError, ForbiddenError, NotFoundError } from './error.js'
const JWT_SECRET='yoursecretkey'


//============sign Token==================
function signToken(admin){
    return jwt.sign(
        {id:admin._id,
            username:admin.username,
            role:'admin'
        },
        JWT_SECRET,
        {expiresIn:'1h'}
    )
}

//========================require Auth===========
function requireAuth(req,res,next){
    const token=req.cookies?.token
    if(!token) return next(new UnauthorizedError('Not authorised'))
        try{
    const payload=jwt.verify(token,JWT_SECRET)
    if(payload.role !=='admin'){
        return next(new ForbiddenError('Access denied'))
    }
        req.user=payload
    
    next()
}catch(err){
     next(err)
}
}

//=====================prevent login===============
function preventLogin(req,res,next){
    const token=req.cookies?.token
    if(!token)  return next()
        try{
    const payload=jwt.verify(token,JWT_SECRET)
    if(payload.role==='admin'){
 req.user=payload
       
    return res.redirect(`/admin/dashboard`)
    }else{
    if(payload.role!=='admin'){
        return next(new ForbiddenError('Access denied '))
    }

    }
    }catch(err){
       next()
    }

}
export{requireAuth,signToken,UnauthorizedError,ForbiddenError,preventLogin}