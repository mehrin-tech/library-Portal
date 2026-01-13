
const {AppError}=require('../Utils/error')
const errorHandler=(err,req,res,next)=>{
   
   
    if(err instanceof AppError){
    return res.status(err.statusCode).render('error',{
        status:err.statusCode,
        message:err.message
    })
    }
    res.status(500).render('error',{
        status:500,
        message:err.message || 'Internal server error'
    })
}
module.exports={errorHandler}