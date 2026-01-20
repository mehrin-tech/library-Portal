const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const { UnauthorizedError, ForbiddenError, NotFoundError } = require('./error')
const JWT_SECRET='yoursecretkey'
const user={id:'ADMIN001',username:'admin123',password:bcrypt.hashSync('12345',10),name:'admin',role:'admin'}

function signToken(user){
    return jwt.sign({id:user.id,username:user.username,name:user.name,role:'admin'},
        JWT_SECRET,
        {expiresIn:'1hr'}
    )
}

function requireAuth(req,res,next){
    const token=req.cookies?.token
    if(!token) return next(new UnauthorizedError('Not authorised'))
        try{
    const payload=jwt.verify(token,JWT_SECRET)
    if(payload.role !=='admin') return next(new ForbiddenError('Access denied'))
        req.user=payload
    next()
}catch(err){
    return next(err)
}
}


function preventLogin(req,res,next){
    const token=req.cookies?.token
    if(!token)  return next()
        try{
    const payload=jwt.verify(token,JWT_SECRET)
    if(payload.role==='admin'){
 req.user=payload
       
    return res.redirect(`/admin/dashboard`)
    }else{
    return next(new ForbiddenError('Access Denied'))

    }
    }catch(err){
       next()
    }

}
module.exports={requireAuth,signToken,user,UnauthorizedError,ForbiddenError,preventLogin}