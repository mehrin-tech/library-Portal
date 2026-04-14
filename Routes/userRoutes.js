import {Router} from 'express'
import multer from 'multer'
import { signupUser,loginForm, loggedForm, getDashboard, editStd, updated, viewBooks, issued, returnRqst,getChat, getUsedBooks,getProfile,logout, payFine } from '../Controllers/userController.js'
const router=Router()
import {requireStdAuth,preventStdLogin} from '../Utils/stdMiddleware.js'

import {sendContactMessage} from '../Controllers/userController.js'

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
})
const upload=multer({storage})
//=================user route===============
router.get('/login',preventStdLogin,loginForm)
router.post('/login',loggedForm)
router.post('/signup',upload.single('image'),preventStdLogin,signupUser)
router.get('/stdChat',requireStdAuth,getChat)
 
router.get('/usedBooks',requireStdAuth,getUsedBooks)
router.get('/dashboard/:id',requireStdAuth,getDashboard)
router.get('/profile',requireStdAuth,getProfile)
router.get('/edit/:id',requireStdAuth,editStd)
router.post('/update/:id',requireStdAuth,upload.single('image'),updated)
router.get('/viewBooks/:id',requireStdAuth,viewBooks)
router.get('/issued/:id',requireStdAuth,issued)
router.post('/request-return/:id',requireStdAuth,returnRqst)

router.get('/pay-fine',requireStdAuth,payFine)
router.get('/logout',requireStdAuth,logout)


router.post('/contact',sendContactMessage)
export default router