const express=require('express')
const path=require('path')
const router=express.Router()

const fs=require('fs').promises



const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });


const {requireAuth,preventLogin}=require('../Utils/adminMiddleware');
const { getCategoryList, getCategoryForm, postAdd, getEditCategory, postUpdate, deleteCategory, getSubCategory, subCategoryForm, addSubCategory, editSub, updateSub, deleteSub } = require('../Controllers/categoryController');
const filePath=path.join(__dirname,'../data/category.json')
const subPath=path.join(__dirname,'../data/subCategory.json')


//categorylist
router.get('/categoryList',requireAuth,getCategoryList)
//show the add category form
router.get('/add',requireAuth,getCategoryForm)
//add category
router.post('/add',requireAuth,upload.single('image'),postAdd)
//edit category
router.get('/edit/:id',requireAuth,getEditCategory)
//update category
router.post('/edit/:id',requireAuth,postUpdate)
//delete category
router.get('/delete/:id',requireAuth,deleteCategory)
//get sub category
router.get('/view/:id',requireAuth,getSubCategory)
//show  subcategory  form
router.get('/:id/sub/add',requireAuth,subCategoryForm)
//add subcategory
router.post('/:id/sub/add',upload.single('image'),requireAuth,addSubCategory)
//edit subcategory
router.get('/edit-subcategory/:catId/:subId',requireAuth,editSub);




//update subcategory
router.post('/edit-subcategory/:catId/:subId',requireAuth,updateSub)

//delte subcategory
router.get('/:catId/sub/delete/:subId',requireAuth,deleteSub)

module.exports=router
