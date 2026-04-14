// import mongoose from 'mongoose'
// import path from'path'
import Book from '../models/Book.js'
import User from '../models/User.js'
import IssuedBook from '../models/IssuedBook.js'
//import ReadOnline from '../models/ReadOnline.js'
import Admin from '../models/Admin.js'
// const PrivateChat=require('../models/PrivateChat')
import {NotFoundError,UnauthorizedError,ConflictError,InternalServerError,ForbiddenError,BadRequestError} from '../Utils/error.js'
import {sendContactEmail} from '../Utils/emaillService.js'
import { tokenCreate,preventStdLogin} from '../Utils/stdMiddleware.js'


//================================//
const signupUser=async(req,res,next)=>{
   
    try{
  const {firstname,lastname,email,password,department,semester,status,image}=req.body

  const exists=await User.findOne({email})
  if(exists){
    return next(new ConflictError('already Existed'))
  }

  await User.create({
  
    firstName:firstname,
    lastName:lastname,
    username:firstname+lastname,
    email,
     password,
   
   department:department?.trim(),
    semester:semester?.trim(),
    status:'Active',
    image:req.file?req.file.filename:''


    })
  res.redirect('/User/login')
   }catch(err){
next(err)
   }
}
const loginForm=async(req,res)=>{
    res.render('User/login')
}
const loggedForm=async(req,res,next)=>{
    try{
    
    
    const {email,password}=req.body
    const student=await User.findOne({email})
     
    if(!student){
        return next(new NotFoundError('student not found'))
    }

    if(student.password!==password){
        return next(new UnauthorizedError('Invalid credentials'))
    }
    
    const token=tokenCreate(student)
    res.cookie('token',token,{
        httpOnly:true,
        secure:false,
        sameSite:'lax',
        maxAge:20*60*1000
    })
        return res.redirect(`/User/dashboard/${student._id}`)
    
}catch(err){
    next(err)
}
}
const getChat=async(req,res,next)=>{
    try{
console.log('req.studnt',req.student)
        if(!req.student){
             return next(new UnauthorizedError('Login required'))
        }
    const studentId=req.student.id.toString()
    const admin=await Admin.findOne()
 

     if(!admin){
              return next(new NotFoundError('Admin not found'))

     }

   res.render('User/stdChat',{
    studentId,
    adminId:admin._id.toString(),
    adminName:admin.username || 'Admin'

   })
}catch(err){
    next(err)
}
}
const getUsedBooks=async(req,res,next)=>{
    try{
    const page=Number(req.query.page)||1;
    const limit=3
    const skip=(page-1)*limit

    const userId=req.student.id//jet payld id ->mongoDB_id

    const totalItems=await IssuedBook.countDocuments({//totl count for pagination
        student:userId
    })
    const totalPages=Math.ceil(totalItems/limit)
    
// get paginated issued books
    const usedBooks=await IssuedBook.find({
        student:userId
    })
    .populate('book')//replce readData()
    .skip(skip)
    .limit(limit)
    .sort({createdAt:-1})




    res.render('User/usedTotalBooks',{
        usedBooks,
        userId,
        currentPage:page,
        totalPages
    })
}catch(err){
    next(err)
}
}
const getDashboard=async(req,res,next)=>{
    try{
        const page=Number(req.query.page) ||1
        const limit=2
        const skip=(page-1)*limit

   const userId=req.student.id//from jwt
   //get logged in std
   const student=await User.findById(userId)
   if(!student) return next(new NotFoundError(' student not found '))


    //books pagination
   const totalBooks=await Book.countDocuments()
    const totalPages=Math.ceil(totalBooks/limit)

const books=await Book.find()
.skip(skip)
.limit(limit)

    

    const issuedCount=await IssuedBook.countDocuments({
        student:userId,
        status:"issued"
    })

    //totalUsed books
    const totalUsedBooks=await IssuedBook.countDocuments({
        student:userId
    })
    //studnt fine calculate 
    // const myFines=issued.filter(i=>i.studentId===userId &&
    //     i.fine>0 &&
    //     i.finePaid===false
    // );
    const myFines=await IssuedBook.find({
        student:userId,
        fine:{$gt:0},
        finePaid:false
    })
    const totalFine=myFines.reduce((sum,i)=>sum+i.fine,0)

     const now=new Date()
     const date=now.toLocaleDateString()
     const time=now.toLocaleTimeString()
     
console.log('total fine:',totalFine)
     
    res.render('User/dashboard',{
        username:student.username,
        email:student.email,
        department:student.department,
        semester:student.semester,
        image:student.image,
        password:"1234",
        date,
        time,
        totalBooks,
        books,
        currentPage:page,
        totalPages,
        userId:student._id,
        status:student.status,
        issuedCount,
        totalUsedBooks,
        totalFine
        
    })
}catch(err){
    next(err)
}
}
const getProfile=async(req,res,next)=>{
    try{
   if (!req.student) {
    return next(new UnauthorizedError('login required'))
  }
 
    const userId=req.student.id

    const student=await User.findById(userId)
  if(!student){
        return next(new NotFoundError(' student not found err'))
    }
    res.render('User/profile',{student,userId:student._id})
}catch(err){
    next(err)
}
}
const editStd=async(req,res,next)=>{
    try{
    const userId=req.student.id
    
    const user=await User.findById(userId)

    if(!user) return next(new NotFoundError('student not found'))
        res.render('User/editProfile',{user})
}catch(err){
    next(err)
}
}
const updated=async(req,res,next)=>{
    try{
    const userId=req.student.id
    
   const user=await User.findById(userId)
if(!user){
return next(new NotFoundError('student not found'))
}
let image=user.image
if(req.file){
image=req.file.filename
}
 
    user.username=req.body.username,
    user.email=req.body.email,
    user.department=req.body.department,
    user.semester=req.body.semester,
    user.status=req.body.status,
    user.image=image
  
  await user.save()
  res.redirect(`/User/dashboard/${user._id}`)

}catch(err){
    next(err)
}
}

const viewBooks=async(req,res,next)=>{
    try{
    
    const bookId=req.params.id//DB obj id
    const userId=req.student.id //from jwt (loggd userid)
    const book=await Book.findById(bookId) //find book frm Db

    if(!book){
        return next(new NotFoundError('books not found'))
    }
    res.render('User/viewBook',{b:book,userId})
}catch(err){
    next(err)
}
}
const issued=async(req,res,next)=>{
    try{
        const page=Number(req.query.page)||1;
        const limit=3
        const skip=(page-1)*limit


    const studentId=req.student.id

   
  
 const totalItems=await IssuedBook.countDocuments({
   student: studentId
 })

 if(totalItems ===0){
    return res.render('User/issued-books',{
        issued:[],
        userId:studentId,
        currentPage:page,
        totalPages:0
    })
 }

  const totalPages=Math.ceil(totalItems/limit);

  const issuedBooks=await IssuedBook.find({
    student:studentId
  })
 .populate('book')
 .skip(skip)
 .limit(limit)
 .sort({createdAt:-1})

    res.render('User/issued-books',{
        issued:issuedBooks,
        userId:studentId,
        currentPage:page,
        totalPages
    })
}catch(err){
    next(err)
}
}
const returnRqst=async(req,res,next)=>{
    try{
    const issuedId=req.params.id
    const studentId=req.student.id
   
    //issued book findd
    const issue=await IssuedBook.findById(issuedId)
    if(!issue){
        return next(new NotFoundError('issued book not found'))
    }
  //safety check this book is same on this std?
  if(issue.student.toString()!==studentId){
     return next(new ForbiddenError('not allowed'))
  }

   // 3️⃣ Prevent duplicate request
    if (issue.returnRequested) {
      return next(new ConflictError('Return already requested'))
    }
    issue.returnRequested=true
    await issue.save()

    res.redirect(`/User/issued/${studentId}`)
}catch(err){
    next(err)
}
}

//====pay fine====//
const payFine=async(req,res,next)=>{
    try{
        const studentId=req.student.id;
       

       //update all unpaid fines at onec
       await IssuedBook.updateMany(
        {student:studentId,
            fine:{$gt:0},
            finePaid:false
        },
        {
            $set:{finePaid:true}
        }
       )
        
        res.redirect(`/User/dashboard/${studentId}`)
    }catch(err){
  next(err)
    }
}

//===================Contact us-send email=============/

// const sendContactMessage=async(req,res,next)=>{
//     try{
//        const fullname=req.body.fullname?.trim()
//         const email=req.body.email?.trim()
//          const message=req.body.message?.trim()

//         if(!fullname || !email || !message){
// return next(new BadRequestError('all fields are required'))
//         }

//         await sendContactEmail(fullname,email,message);

//         res.redirect('/?contact=success')
//     }catch(err){
//    console.error('contact email error:',err)
//    next(new InternalServerError('email sending failed'))
//     }
// }

const sendContactMessage = async (req, res, next) => {
  try {
    const fullname = req.body.fullname?.trim();
    const email = req.body.email?.trim();
    const message = req.body.message?.trim();

    if (!fullname || !email || !message) {
      return next(new BadRequestError('all fields are required'));
    }

    await sendContactEmail(fullname, email, message);

    res.redirect('/?contact=success');

  } catch (err) {
    console.error("🔥 REAL ERROR:", err);   // 👈 MUST SEE THIS
    res.send(err.message);                 // 👈 TEMP: show error in browser
  }
};

//===========logout====//
const logout=async(req,res)=>{
    res.clearCookie('token')
    res.redirect('/User/login')
}

export{
    signupUser,
loginForm,
loggedForm,
getChat,
getProfile,
getUsedBooks,
getDashboard,
editStd,
updated,
viewBooks,
issued,
returnRqst,
payFine,
sendContactMessage,
logout

}