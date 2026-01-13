const path=require('path')
const fs=require('fs').promises
const filePath=path.join(__dirname,'../data/books.json')
const userPath=path.join(__dirname,'../data/users.json')
const issuedPath=path.join(__dirname,'../data/issuedBook.json')
const {NotFoundError,UnauthorizedError,ConflictError,InternalServerError,ForbiddenError}=require('../Utils/error')

const { tokenCreate,preventStdLogin}=require('../Utils/stdMiddleware')
//read data
async function readData(){
    try{
     const data=await fs.readFile(filePath,'utf-8')
     return data?JSON.parse(data):[]
    }catch(err){
     console.error('error reading file:',err)
     return []
    }
}
//write data
async function writeData(books){
    try{
  await fs.writeFile(filePath,JSON.stringify(books,null,2))
    }catch(err){
     console.error('error writing file:',err)
    }

}
async function readUser() {
    try{
        const data=await fs.readFile(userPath,'utf-8')
        return data?JSON.parse(data):[]
    }catch(err){
        console.error('reading user file',err)
    }
}
async function writeUser(users){
    try{
  await fs.writeFile(userPath,JSON.stringify(users,null,2))
    }catch(err){
     console.error('error writing file:',err)
    }

}
async function readIssued() {
      try{
        const data=await fs.readFile(issuedPath,'utf-8')
        return data?JSON.parse(data):[]
    }catch(err){
        console.error('reading user file',err)
    }
    
}
async function writeIssued(issuedBook) {
       try{
  await fs.writeFile(issuedPath,JSON.stringify(issuedBook,null,2))
    }catch(err){
     console.error('error writing file:',err)
    }
}
const signupUser=async(req,res,next)=>{
   
    try{
  const {firstname,lastname,email,number,Dob,password}=req.body
  const users=await readUser()
  //check duplicate email
  const exists=users.find(u=>u.email===email)
  if(exists){
    return next(new ConflictError('already Existed'))
  }

  const newUser={
    id:users.length?users[users.length-1].id+1:1,
    firstname,
    lastname,
    username:firstname+lastname,
    email,
    number,
    Dob,
    password,
    department:'',
    semester:'',
    status:'',
    image:''


  }
  users.push(newUser)
  await writeUser(users)
  res.redirect('/User/login')
   }catch(err){
next(err)
   }
}
const loginForm=async(req,res)=>{
    res.render('User/login')
}
const loggedForm=async(req,res,next)=>{
    
    
    const {email,password}=req.body
    const students=await readUser()
    
     const student=students.find(s=>s.email===email )
     
    if(!student){
        return next(new NotFoundError('student not found'))
    }
    
    const token=tokenCreate(student)
    res.cookie('token',token,{
        httpOnly:true,
        secure:false,
        sameSite:'lax',
        maxAge:20*60*1000
    })
        return res.redirect(`/User/dashboard/${student.id}`)
    
}
const getChat=async(req,res,next)=>{
    const studentId=req.student?.id
    const adminId="ADMIN001"
    const adminName='Admin'
   //const  students=await readUser()

   //const studentsList=students.filter(s=>s.name!==req.student?.name)
   res.render('User/stdChat',{
    studentId,
    adminId,
    adminName

   })
}

const getUsedBooks=async(req,res,next)=>{
    const page=Number(req.query.page)||1;
    const limit=3

    const userId=req.student.id

    const issued=await readIssued()
    const books=await readData()

    const usedBooks=issued.filter(i=>i.studentId===userId)

const totalItems=usedBooks.length
const totalPages=Math.ceil(totalItems/limit)
const startIndex=(page-1)*limit
const endIndex=startIndex+limit

const paginated=usedBooks.slice(startIndex,endIndex)

    res.render('User/usedTotalBooks',{
        usedBooks:paginated,
        books,
        userId,
        currentPage:page,
        totalPages
    })
}
const getDashboard=async(req,res,next)=>{
    try{
        
   const userId=req.student.id
   const students=await readUser()
   const student=students.find(u=>u.id===userId)
   if(!student) return next(new NotFoundError('not found err'))

    const books=await readData()
    const totalBooks=books.length
    const issued=await readIssued()

    const issuedCount=issued.filter(i=>i.studentId===userId && i.status==='issued').length

    const totalUsedBooks=issued.filter(i=>i.studentId===userId).length
     const now=new Date()
     const date=now.toLocaleDateString()
     const time=now.toLocaleTimeString()
     

     
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
        userId:student.id,
        status:student.status,
        issuedCount,
        totalUsedBooks
        
    })
}catch(err){
    next(err)
}
}
const getProfile=async(req,res,next)=>{
   if (!req.student) {
    return next(new UnauthorizedError('login required'))
  }
 
    const userId=req.student.id
    
    
    const students=await readUser()
   
    const student=students.find(s=>s.id===userId)
  
   
    if(!student){
        return next(new NotFoundError('not found err'))
    }
    res.render('User/profile',{student,userId})
}
const editStd=async(req,res,next)=>{
    const userId=parseInt(req.params.id)
    const users=await readUser()
    const user=users.find(r=>r.id===userId)

    if(!user) return next(new NotFoundError('student not found'))
        res.render('User/editProfile',{user})
}
const updated=async(req,res,next)=>{
    try{
    const userId=parseInt(req.params.id)
    const users=await readUser()
   const user=users.findIndex(u=>u.id===userId)
if(user===-1){
return next(new NotFoundError('student not found'))
}
let image=users[user].image
if(req.file){
image=req.file.filename
}
  users[user]={
    ...users[user],
    username:req.body.username,
    email:req.body.email,
    department:req.body.department,
    semester:req.body.semester,
    status:req.body.status,
    image
  }
  await writeUser(users)
  res.redirect(`/User/dashboard/${userId}`)

}catch(err){
    next(err)
}
        
       
}

const viewBooks=async(req,res,next)=>{
    const books=await readData()
    const bookId=parseInt(req.params.id)
    const userId=parseInt(req.params.id)
    const b=books.find(u=>u.id===bookId)

    if(!b){
        return next(new NotFoundError('books not found'))
    }
    res.render('User/viewBook',{b,userId})
}
const issued=async(req,res,next)=>{
    try{
        const page=Number(req.query.page)||1;
        const limit=3
    const studentId=parseInt(req.params.id)

    const issued=await readIssued()
    const books=await readData()
    const myIssued=issued.filter(i=>i.studentId===studentId)//only this std books
  
 const totalItems=myIssued.length;
 const totalPages=Math.ceil(totalItems/limit);
  const startIndex=(page-1)*limit;
  const endIndex=startIndex+limit;

  const paginated=myIssued.slice(startIndex,endIndex)

    res.render('User/issued-books',{
        issued:paginated,
        books,
        userId:studentId,
        currentPage:page,
        totalPages
    })
}catch(err){
    next(err)
}
}
const returnRqst=async(req,res,next)=>{
    const issueId=parseInt(req.params.id)
    const issued=await readIssued()
    const issue=issued.find(i=>i.id===issueId)
    if(!issue){
        return next(new NotFoundError('issued not found'))
    }
    issue.returnRequested=true
    await writeIssued(issued)

    res.redirect(`/User/issued/${issue.studentId}`)
}
const logout=async(req,res)=>{
    res.clearCookie('token')
    res.redirect('/User/login')
}
module.exports={
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
logout

}