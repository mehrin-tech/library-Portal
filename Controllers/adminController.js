import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import Admin from '../models/Admin.js'
import Book from '../models/Book.js'
import User from '../models/User.js'
import IssuedBook from '../models/IssuedBook.js'
import ReadOnline from '../models/ReadOnline.js'
import PrivateChat from '../models/PrivateChat.js'


import {NotFoundError,ConflictError,InternalServerError,ForbiddenError,UnauthorizedError} from '../Utils/error.js'
import {signToken} from '../Utils/adminMiddleware.js'


///================calculateFine function=========//
function calculateFine(dueDate,actualReturnDate){
    const due=new Date(dueDate)
    const returned=new Date(actualReturnDate)

    if(returned>due){
        const diffTime=returned-due
        const lateDays=Math.ceil(diffTime/(1000*60*60*24))

        return lateDays*10;//10rupee per day
    }
    return 0
}

///================login=================//
const loginForm=(req,res)=>{
    res.render('admin/login')
}
const loggedForm=async(req,res,next)=>{
    try{
        console.log('req body',req.body)
    const username= req.body.username?.trim()
    const password = req.body.password?.trim()
     console.log('USERNAME:', username)
    console.log('PASSWORD:', password)
  const admin=await Admin.findOne({username})
  console.log('ADMIN FROM DB:', admin)
  if(!admin){
    return next(new UnauthorizedError('Invalid admin credentials'))
  }

   //compare password
   const isMatch=await bcrypt.compare(password,admin.password)
    console.log('BCRYPT MATCH RESULT:', isMatch)
   if(!isMatch){
    return next(new UnauthorizedError("Invalid admin credentials"))
   }
   const token=signToken(admin)
  res.cookie('token',token,{
    httpOnly:true,
    secure:false,
    sameSite:'lax',
    maxAge:20*60*1000
   })
   console.log('LOGIN USERNAME:', username)
console.log('LOGIN PASSWORD:', password)
console.log('DB PASSWORD:', admin.password)
   res.redirect('/admin/dashboard')
   }catch(err){
   next(err)
   }
}  
const getChatList=async(req,res,next)=>{
    try{
    const page=Number(req.query.page)||1
    const limit=3
    const skip=(page-1)*limit
    
   

    const totalUsers=await User.countDocuments()

    const totalPages=Math.ceil(totalUsers/limit)

  const users=await User.find()
  .skip(skip)
  .limit(limit)
    res.render('admin/chatList',{
        users,
        currentPage:page,
        totalPages
    })
}catch(err){
    next(err)
}
}
const getChat=async(req,res,next)=>{
try{
     if (!req.user) {
      return next(new UnauthorizedError('Admin login required'))
    }

const adminId=req.user.id.toString()
const studentId=req.params.studentId
// if(!studentId){
//     return next(new NotFoundError('student id missing'))
// }

if(!mongoose.Types.ObjectId.isValid(studentId)){
    return next(new NotFoundError('invalid student id'))

}

const student= await User.findById(studentId)

  if (!student) {
      return next(new NotFoundError("student not found"));
    }


res.render("admin/adminChat",{
    adminId,
    studentId,
    studentName:student.username
})
}catch(err){
next(err)
}
}
//====dashboard in admin side==========
const dashboard=async (req, res,next) => {
    try{

  const totalBooks =await Book.countDocuments()
  const totalStudents =await User.countDocuments()

  const issuedBooks = await IssuedBook.find({status:"issued"})
  .populate("student")
  .populate("book")
  const issuedCount = issuedBooks.length
  const pendingReturns=issuedCount

  const onlineReadersCount=await ReadOnline.countDocuments({
    isActive:true
  })
 

  //department -wise logic===//
  const deptCount={}

  issuedBooks.forEach(issue=>{
   const dept=issue.student?.department
if(dept){
    deptCount[dept]=(deptCount[dept] || 0)+1
}
  })

    
  const deptLabels=Object.keys(deptCount)
  const deptValues=Object.values(deptCount)

  //fine statistics
  const finePaidCount=await IssuedBook.countDocuments({
    fine:{$gt:0 },
    finePaid:false
  })
  const fineUnpaidCount=await IssuedBook.countDocuments({
    fine:{$gt:0},
    finePaid:false
  })
  res.render('admin/dashboard', {
    totalBooks,
    totalStudents,
    issuedCount,
    deptLabels,
    deptValues,
    pendingReturns,
    onlineReadersCount,
    finePaidCount,
    fineUnpaidCount,
   // recentIssued: issuedBooks.slice(-5).reverse()
  });
}catch(err){

}
}
//==============bookslist=====
const getBooksList=async(req,res,next)=>{
    try{
        const page=Number(req.query.page)|| 1;
        const limit=4
        const skip=(page-1)*limit

 
//total count
    const totalBooks=await Book.countDocuments()
    const totalPages=Math.ceil(totalBooks/limit)


    //paginated books
    const books=await Book.find()
    .skip(skip)
    .limit(limit)
    
    const users=await User.find()

   

    res.render('admin/booksList',{
        books,
        users,
        currentPage:page,
        totalPages,
        limit
    })
    }catch(err){
        next(err)
    }
}
const addBookForm=(req,res)=>{
    res.render('admin/addBook')
}
const addBook=async(req,res,next)=>{
    try{
const {bookname,author,isbn,quantity,date}=req.body

const image = req.file ? '/uploads/' + req.file.filename : '/images/atomichabits.jpg';

//check is isbn arleady exists
const bookExists=await Book.findOne({isbn})
if(bookExists){
    return next(new ConflictError('already existed'))
}

await Book.create({
    title:bookname,
    author,
    isbn,
    publishedDate:date,
    image,
    totalCopies:Number(quantity),
    availableCopies:Number(quantity)
})


res.redirect('/admin/booksList')


}catch(err){
next(err)
}
}
const viewBook=async(req,res,next)=>{
    try{
   
    const bookId=req.params.id
    const book=await Book.findById(bookId)
    if(!book){
        return next(new NotFoundError('not found book'))
    }
  res.render('admin/viewDetails',{b:book})
}catch(err){
next(err)
}
}
const editBook=async(req,res,next)=>{
    try{
    const bookId=req.params.id

   const book=await Book.findById(bookId)

   
    if(!book){
        return next(new NotFoundError('books not found'))
    }
    res.render('admin/editBook',{books:book})
}catch(err){
    next(err)
}
}
const updateBook=async(req,res,next)=>{
    try{
    
    const bookId=req.params.id
    const book=await Book.findById(bookId)

    if(!book){
        return next(new NotFoundError('not found book'))
    }
    //update values
    book.bookname=req.body.title
    book.author=req.body.author
    book.isbn  = req.body.isbn;
    book.availableCopies=Number(req.body.availableCopies)
    book.totalCopies=Number(req.body.availableCopies);
    book.publishedDate= req.body.publishedDate;

    if(req.file){
        book.image='/uploads/'+req.file.filename

    }
    await book.save()
    res.redirect('/admin/booksList')
}catch(err){
next(err)
}
}
const deleteBook=async(req,res,next)=>{
    try{
    const bookId=req.params.id
    const deleted=await Book.findByIdAndDelete(bookId)
    if(!deleted){
        return next(new NotFoundError('book not found'))
    }
    
     res.redirect('/admin/booksList')
}catch(err){
next(err)
}
}

const StdList=async(req,res,next)=>{
try{
    const page=Number(req.query.page) || 1;
    const limit=4
    const skip=(page-1)*limit


    
    const users=await User.find()
    .skip(skip)
    .limit(limit)
   

    const totalStudents=await User.countDocuments()
    const totalPages=Math.ceil(totalStudents/limit)

    res.render('admin/studentsList',{
        users,
        currentPage:page,
        totalPages,
        limit
    })
}catch(err){
next(err)
}
}

const profileStd=async(req,res,next)=>{
    try{
    const userId=req.params.id
   

    const student=await User.findById(userId)

    if(!student){

    return next(new NotFoundError('student not found'))
    }
        res.render('admin/profileStd',{student})
}catch(err){
next(err)
}
}
//==============issued in admin side==============
const issuedBook=async(req,res,next)=>{
    try{
const books=await Book.find({availableCopies:{$gt:0}})
const students=await User.find({status:"Active"})
    
    res.render('admin/issue-book',{
        books,
        students,
       
       
    })
    }catch(err){
        next(err)
    }
}
const postIssuedBook=async(req,res,next)=>{
    try{
    const {studentId,bookId,returnDate}=req.body
    const book=await Book.findById(bookId)
    
    if(!book || book.availableCopies<=0){
        return next(new NotFoundError('not found book'))

    }
    const alreadyIssued=await IssuedBook.findOne({
        student:studentId,
        book:bookId,
        status:"issued"
    })

    if(alreadyIssued){
        return next(new ConflictError('book already Issued to this student'))
    }
    await IssuedBook.create({
        student:studentId,
        book:bookId,
        issueDate:new Date(),
        expectedReturnDate:returnDate,
        status:"issued",
         fine:0,
        finePaid:false
    })
    book.availableCopies-=1
    await book.save()

    res.redirect('/admin/issued-list')
    }catch(err){
        next(err)
    }
}
const issuedList=async(req,res,next)=>{
    try{
     const page=Number(req.query.page)||1;
        const limit=4
        const skip=(page-1)*limit
  

    const totalIssued=await IssuedBook.countDocuments()
    const totalPages=Math.ceil(totalIssued/limit)

      const issued=await IssuedBook.find()
    .populate("student")
    .populate("book")
    .skip(skip)
    .limit(limit)
    .sort({createdAt:-1})

    res.render('admin/issued-list',{
        issued,
        totalPages,
        currentPage:page
    })
}catch(err){
    next(err)
}
}
///==================return================
const returnBook=async(req,res,next)=>{
try{
    const issuedId=req.params.id

    const issue=await IssuedBook.findById(issuedId)
    if(!issue){
        return next(new NotFoundError('issued record not found'))
    }
 //actual return date
 const today=new Date()
 const dueDate=new Date(issue.expectedReturnDate)
 let lateDays=0
 if(today >dueDate){
    const diffTime = today - dueDate
      lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
 }
 issue.actualReturnDate=today
 issue.lateDays=lateDays
  issue.fine=lateDays*10
   issue.finePaid=false;
 issue.status='returned';


 await issue.save()
 
//increase available copies
const book=await Book.findById(issue.book)  
  if(book){
    book.availableCopies+=1
    await book.save()
    }
 //calclte fine
//  const fineAmount=calculateFine(issue.expectedReturnDate,
//     today
// )



    


   
    res.redirect('/admin/issued-list')
}catch(err){
    next(err)
}
}

const markFinePaid=async(req,res,next)=>{
    try{
  const issuedId= req.params.id

  const issue=await IssuedBook.findById(issuedId)

  if(!issue){
    return next(new NotFoundError('issue is not found'))
  }
  issue.finePaid=true
  await issue.save()

  res.redirect('/admin/issued-list')
    }catch(err){
    next(err)
    }
}

//============getOnline reader===========//
const getOnelineReaders=async(req,res,next)=>{
    try{
  //only active readers
  const activeReaders=await ReadOnline.find({isActive:true})
  .populate("student")
//   .populate("book")
//admin kaanikkan readable data create cheyyunnu
  const readers=activeReaders.map(read=>({
     studentname:read.student?.username || "unknown",
     department:read.student?.department || "-",
     bookName:read.bookName || "unknown",
     startTime:read.startTime
  
  }))
  res.render('admin/onlineReaders',{readers})
    }catch(err){
next(err)
    }
}
//=============================//
const logout=(req,res,next)=>{
    res.clearCookie('token')
    res.redirect('/admin/login')
}
export{
    loginForm,
    loggedForm,
    dashboard,
    getBooksList,
    addBookForm,
    addBook,
    viewBook,
    editBook,
    updateBook,
    deleteBook,
  
    StdList,
    
    profileStd,
    issuedBook,
    postIssuedBook,
    issuedList,
    returnBook,
    getChatList,
    getChat,
    logout,
    markFinePaid,
    getOnelineReaders



}