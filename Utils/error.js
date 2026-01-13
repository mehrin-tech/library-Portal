class AppError extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode=statusCode
    }
}
class NotFoundError extends AppError{
    constructor(message){
        super(message,404)
    }
}
class ForbiddenError extends AppError{
    constructor(message){
        super(message,403)
    
    }

}
class ConflictError extends AppError{
    constructor(message){
        super(message,409)
    }
}
class UnauthorizedError extends AppError{
    constructor(message){
        super(message,401)
    }
}
class InternalServerError extends AppError{
    constructor(message){
        super(message,500)
    }
}
module.exports={AppError,NotFoundError,UnauthorizedError,ForbiddenError,InternalServerError,ConflictError}