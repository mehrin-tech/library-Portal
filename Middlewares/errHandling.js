
import {AppError} from '../Utils/error.js'
const errorHandler=(err,req,res,next)=>{
   console.error(err)
   
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
export{errorHandler}