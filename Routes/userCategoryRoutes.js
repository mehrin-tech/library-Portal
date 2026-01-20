const express=require('express')
const path=require('path')
const router=express.Router()

const fs=require('fs').promises
const {requireStdAuth}=require('../Utils/stdMiddleware')
const {getCategoryList,getSubCategory, getBookDetails,startOnlineReading,stopOnlineReading}=require('../Controllers/userCategoryController')


router.get('/categoryList',requireStdAuth,getCategoryList)
router.get('/view/:id',requireStdAuth,getSubCategory)
router.get('/:catId/book/:subId',requireStdAuth,getBookDetails)
module.exports=router