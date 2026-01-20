const path=require('path')
const fs=require('fs').promises
const bcrypt=require('bcrypt')
const filePath=path.join(__dirname,'../data/books.json')
const userPath=path.join(__dirname,'../data/users.json')
const issuePath=path.join(__dirname,'../data/issuedBook.json')
const onlinePath=path.join(__dirname,'../data/onlineReads.json')
const {NotFoundError,ConflictError,InternalServerError,ForbiddenError,UnauthorizedError}=require('../Utils/error')
const  {signToken,user}=require('../Utils/adminMiddleware')
//================read and write  book=============
async function readData(){
    try{
    const data=await fs.readFile(filePath,'utf-8')
    return data? JSON.parse(data) :[]
    }catch(err){
        console.error('error reading file:',err)
        return []
    }
}

async function writeData(books) {
    try{
await fs.writeFile(filePath,JSON.stringify(books,null,2))
}catch(err){
    console.error('error  writing file:',err)
}
}
//==================read and write std================
async function readUser() {
    try{
        const data=await fs.readFile(userPath,'utf-8')
        return data?JSON.parse(data):[]

    }catch(err){
   console.error('readin err:',err)
    }
}
async function writeUser(users) {
    try{
await fs.writeFile(userPath,JSON.stringify(users,null,2))
}catch(err){
    console.error('error  writing file:',err)
}
}
//==================read and write issued============
async function readIssued(){
     try{
        const data=await fs.readFile(issuePath,'utf-8')
        return data?JSON.parse(data):[]

    }catch(err){
   console.error('readin err:',err)
    }

}
async function writeIssued(issuedBook){
        try{
await fs.writeFile(issuePath,JSON.stringify(issuedBook,null,2))
}catch(err){
    console.error('error  writing file:',err)
}
}
//================read and write online readers============//
async function readOnline(){
    try{
const data=await fs.readFile(onlinePath,'utf-8')
return data?JSON.parse(data):[]
    }catch(err){
  return []
    }
}

async function writeOnline(reads){
    await fs.writeFile(onlinePath,JSON.stringify(reads,null,2))
}

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
    const {username,password}=req.body
   if(username!==user.username){
  throw new UnauthorizedError('Invalid admin Credentials')
   }

   const isMatch=await bcrypt.compare(password,user.password)
   if(!isMatch) return next(new UnauthorizedError('Invalid admin credentials'))
   const token=signToken(user)
 
   res.cookie('token',token,{
    httpOnly:true,
    secure:false,
    sameSite:'lax',
    maxAge:20*60*1000
   })
  
   
    return res.redirect('/admin/dashboard')
   }
    
const getChatList=async(req,res,next)=>{
    try{
    const page=Number(req.query.page)||1
    const limit=3
    
    const users=await readUser()

    const totalUsers=users.length
    const totalPages=Math.ceil(totalUsers/limit)

    const startIndex=(page-1)*limit
    const endIndex=startIndex+limit

    const allUsers=users.slice(startIndex,endIndex)
    res.render('admin/chatList',{
        users:allUsers,
        currentPage:page,
        totalPages
    })
}catch(err){
    next(err)
}
}
const getChat=async(req,res,next)=>{
try{
const adminId=req.user.id
const studentId=req.params.studentId
if(!studentId){
    return next(new NotFoundError('student id missing'))
}

const users=await readUser()
const student=users.find(u=>String(u.id)===String(studentId))

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
  const books = await readData();
  const users = await readUser();
  const issued = await readIssued();
  const onlineReads=await readOnline()

  const totalBooks = books.length;
  const totalStudents = users.length;

  const issuedBooks = issued.filter(i => i.status === 'issued');
  const issuedCount = issuedBooks.length;

  const onlineReadersCount=onlineReads.filter(r=>r.isActive).length
  const pendingReturns = issued.filter(
    i => i.status === 'issued'
  ).length;

  //department -wise logic===//
  const deptCount={}

  issuedBooks.forEach(issue=>{
    const student=users.find(u=>u.id===issue.studentId)


    if(student){
    const dept=student.department;
   deptCount[dept]=(deptCount[dept] || 0)+1
    }
  })
  const deptLabels=Object.keys(deptCount)
  const deptValues=Object.values(deptCount)

  //fine statistics
  const finePaidCount=issued.filter(i=>
    i.fine>0 && i.finePaid===true).length

    const fineUnpaidCount=issued.filter(i=>
        i.fine>0 && i.finePaid===false
    ).length
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
    recentIssued: issuedBooks.slice(-5).reverse()
  });
}
//==============bookslist=====
const getBooksList=async(req,res,next)=>{
    try{
        const page=Number(req.query.page)|| 1;
        const limit=4

    const books=await readData()
    const users=await readUser()

    const totalBooks=books.length;
    const totalPages=Math.ceil(totalBooks/limit)

    const startIndex=(page-1)*limit
    const endIndex=startIndex+limit

    const allBooks=books.slice(startIndex,endIndex)

    res.render('admin/booksList',{
        books:allBooks,
        users,
        currentPage:page,
        totalPages
    })
    }catch(err){
        next(err)
    }
}
const addBookForm=(req,res)=>{
    res.render('admin/addBook')
}
const addBook=async(req,res,next)=>{
const {bookname,author,isbn,quantity,date}=req.body

const image = req.file ? '/uploads/' + req.file.filename : '/images/atomichabits.jpg';

const books= await readData()
const bookExists=books.find(book=>book.isbn===isbn)
if(bookExists){
    return next(new ConflictError('already existed'))
}

const newBook={
    id:books.length>0?books[books.length-1].id+1:1,
    bookname,
    author,
    isbn,
    quantity:Number(quantity),
    date,
    image
   
}
books.push(newBook)
await writeData(books)
res.redirect('/admin/booksList')


}
const viewBook=async(req,res,next)=>{
    const books=await readData()
    const bookId=parseInt(req.params.id)
    const b=books.find(b=>b.id===bookId)
    if(!b){
        return next(new NotFoundError('not found book'))
    }
  res.render('admin/viewDetails',{b})
}
const editBook=async(req,res,next)=>{
    const bookId=parseInt(req.params.id)

    let books=await readData()

    books=books.find(b=>b.id===bookId)
    if(!books){
        return next(new NotFoundError('books not found'))
    }
    res.render('admin/editBook',{books})
}
const updateBook=async(req,res,next)=>{
    let books=await readData()
    const bookId=parseInt(req.params.id)
    let book=books.find(b=>b.id===bookId)

    if(!book){
        return next(new NotFoundError('not found book'))
    }
    //update values
    book.bookname=req.body.bookname
    book.author=req.body.author
    book.isbn  = req.body.isbn;
    book.quantity     = req.body.quantity;
    book.date     = req.body.date;

    if(req.file){
        book.image='/uploads/'+req.file.filename

    }
    await writeData(books)
    res.redirect('/admin/booksList')
}
const deleteBook=async(req,res)=>{
    const bookId=parseInt(req.params.id)
    let books=await readData()
    
    books=books.filter(b=>b.id!==bookId)
    await writeData(books)
    
     res.redirect('/admin/booksList')
}

const StdList=async(req,res,next)=>{
try{
    const page=Number(req.query.page) || 1;
    const limit=4

    const users=await readUser()

    const totalStudents=users.length;
    const totalPages=Math.ceil(totalStudents/limit)

    const startIndex=(page-1)*limit
    const endIndex=startIndex+limit

    const pagination=users.slice(startIndex,endIndex)
    res.render('admin/studentsList',{
        users:pagination,
        currentPage:page,
        totalPages
    })
}catch(err){

}
}

const profileStd=async(req,res,next)=>{
    const userId=parseInt(req.params.id)
    const users=await readUser()

    const student=users.find(u=>u.id===userId)

    if(!student) return next(new NotFoundError('student not found'))
        res.render('admin/profileStd',{student})
}
//==============issued in admin side==============
const issuedBook=async(req,res,next)=>{
    try{
       

    const books=await readData()
    const students=await readUser()

    
    res.render('admin/issue-book',{
        books,
        students,
       
       
    })
    }catch(err){
        next(err)
    }
}
const postIssuedBook=async(req,res,next)=>{
    const {studentId,bookId,returnDate}=req.body
    const books=await readData()
    const  issues=await readIssued()
    const book=books.find(b=>b.id===Number(bookId))

    if(!book || book.quantity<=0){
        return next(new NotFoundError('not found book'))

    }

    const newIssue={
        id:Date.now(),
        studentId:Number(studentId),
        bookId:Number(bookId),
        issuedate:new Date().toISOString().split("T")[0],
        returnDate:returnDate,//due date
        actualReturnDate:null,
        status:"issued",
        fine:0,
        finePaid:false

    }
    issues.push(newIssue)
    book.quantity-=1

    await writeIssued(issues)
    await writeData(books)

    res.redirect('/admin/issued-list')

}
const issuedList=async(req,res,next)=>{
    try{
     const page=Number(req.query.page)||1;
        const limit=4
    const issued=await readIssued()
    const books=await readData()
    const students=await readUser()

    const totalIssued=issued.length
    const totalPages=Math.ceil(totalIssued/limit)

    const startIndex=(page-1)*limit
    const endIndex=startIndex+limit;

    const paginatedStd=issued.slice(startIndex,endIndex)

    res.render('admin/issued-list',{
        issued:paginatedStd,
        books,
        students,
        totalPages,
        currentPage:page
    })
}catch(err){
    next(err)
}
}
///==================return================
const returnBook=async(req,res,next)=>{
    const issued=await readIssued()
    const books=await readData()
    const issuedId=Number(req.params.id)

    const issue=issued.find(i=>i.id===issuedId)
    if(!issue){
        return next(new NotFoundError('issued'))
    }
 //actual return date
 const today=new Date().toISOString().split('T')[0]
 issue.actualReturnDate=today
 const fineAmount=calculateFine(issue.returnDate,today)
 issue.fine=fineAmount

 issue.finePaid=false;
 issue.status='returned';
    

    const book=books.find(b=>b.id===issue.bookId)
    if(book){
    book.quantity+=1
    }
    await writeIssued(issued)
    await writeData(books)
    res.redirect('/admin/issued-list')
}

const markFinePaid=async(req,res,next)=>{
    try{
  const issued= await readIssued()

  const issue=issued.find(i=>i.id===Number(req.params.id))

  if(!issue){
    return next(new NotFoundError('issue is not found'))
  }
  issue.finePaid=true
  await writeIssued(issued)

  res.redirect('/admin/issued-list')
    }catch(err){

    }
}

//============getOnline reader===========//
const getOnelineReaders=async(req,res,next)=>{
    try{
  const onlineReads=await readOnline()
  const users=await readUser()
  const books=await readData()

  //only active readers
  const activeReaders=onlineReads.filter(r=>r.isActive)
//admin kaanikkan readable data create cheyyunnu
  const readers=activeReaders.map(read=>{
    const student=users.find(u=>u.id===read.studentId)
    const book=books.find(b=>b.id===read.bookId)

    return{
        studentname:student?student.username:'unknown',
        department:student?student.department:'-',
        bookName:book?book.bookname:'unknown',
        startTime:read.startTime
    }
  })
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
module.exports={
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