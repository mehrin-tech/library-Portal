const express=require('express')
const path=require('path')
const router=express.Router()
const fs=require('fs').promises
const multer=require('multer')

const {  loginForm, loggedForm, dashboard, getBooksList, addBookForm, addBook, viewBook, editBook, updateBook, deleteBook,  StdList,  profileStd, issuedBook, postIssuedBook, issuedList, returnBook,getChatList,getChat,logout,getOnelineReaders, markFinePaid } = require('../Controllers/adminController')

const filePath=path.join(__dirname,'../data/books.json')
const userPath=path.join(__dirname,'../data/users.json')
const issuePath=path.join(__dirname,'../data/issuedBook.json')
const {requireAuth,preventLogin}=require('../Utils/adminMiddleware')
//====================multer file upload mddlwr=========================
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function(req,file,cb){
      
    cb(null,`${Date.now()}-${file.originalname}`);
    }
})

const upload=multer({storage})
//===============routes in admin========================//
router.get('/login',preventLogin,loginForm)
router.post('/login',loggedForm)
router.get('/chatList',getChatList)
router.get('/adminChat/:studentId',requireAuth,getChat)
router.get('/dashboard',requireAuth, dashboard);
router.get('/booksList',requireAuth,getBooksList)
router.get('/addBook',requireAuth,addBookForm)
router.post('/addBook',requireAuth,upload.single('image'),addBook)

router.get('/viewDetails/:id',requireAuth,viewBook)
router.get('/edit/:id',requireAuth,editBook)
router.post('/update/:id',requireAuth,upload.single('image'),updateBook)
router.get('/delete/:id',requireAuth,deleteBook)

//router.get('/addstd',requireAuth,addStdForm)
//router.post('/addstd',requireAuth,upload.single('image'),addStd)
router.get('/studentsList',requireAuth,StdList)
//router.get('/editStd/:id',requireAuth,editStd)
//router.post('/updateStd/:id',requireAuth,upload.single('image'),updatedStd)
//router.get('/deleteStd/:id',requireAuth,deleteStd)
router.get('/student/:id',requireAuth,profileStd)

router.get('/issue-book',requireAuth,issuedBook)
router.post('/issue-book',requireAuth,postIssuedBook)
router.get('/issued-list',requireAuth,issuedList)
router.post('/return-book/:id',requireAuth,returnBook)
router.get('/logout',logout)

router.get('/online-readers',getOnelineReaders)
router.get('/mark-fine-paid',markFinePaid)
module.exports=router
