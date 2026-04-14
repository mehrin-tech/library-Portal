import {Router} from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import {  loginForm, loggedForm, dashboard, getBooksList, addBookForm, addBook, viewBook, editBook, updateBook, deleteBook,  StdList,  profileStd, issuedBook, postIssuedBook, issuedList, returnBook,getChatList,getChat,logout,getOnelineReaders, markFinePaid } from '../Controllers/adminController.js'

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)

const router=Router()
import {requireAuth,preventLogin} from '../Utils/adminMiddleware.js'
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
router.get('/chatList',requireAuth,getChatList)
router.get('/adminChat/:studentId',requireAuth,getChat)
router.get('/dashboard',requireAuth, dashboard);
router.get('/booksList',requireAuth,getBooksList)
router.get('/addBook',requireAuth,addBookForm)
router.post('/addBook',requireAuth,upload.single('image'),addBook)

router.get('/viewDetails/:id',requireAuth,viewBook)
router.get('/edit/:id',requireAuth,editBook)
router.post('/update/:id',requireAuth,upload.single('image'),updateBook)
router.get('/delete/:id',requireAuth,deleteBook)


router.get('/studentsList',requireAuth,StdList)

router.get('/student/:id',requireAuth,profileStd)

router.get('/issue-book',requireAuth,issuedBook)
router.post('/issue-book',requireAuth,postIssuedBook)
router.get('/issued-list',requireAuth,issuedList)
router.post('/return-book/:id',requireAuth,returnBook)
router.get('/logout',logout)

router.get('/online-readers',requireAuth,getOnelineReaders)
router.get('/mark-fine-paid',requireAuth,markFinePaid)
export default router
