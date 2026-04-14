import {Router} from 'express'
import multer from "multer"
const router=Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });


import {requireAuth,preventLogin} from '../Utils/adminMiddleware.js'
import { getCategoryList, getCategoryForm, postAdd, getEditCategory, postUpdate, deleteCategory, getSubCategory, subCategoryForm, addSubCategory, editSub, updateSub, deleteSub ,getBookDetails} from '../Controllers/categoryController.js'



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
router.post('/:id/sub/add',requireAuth,upload.fields([
  {name:'image',maxCount:1},
  {name:'pdf',maxCount:1}
]),addSubCategory)
//edit subcategory
router.get('/:catId/sub/:subId/edit',requireAuth,editSub);
//update subcategory
router.post('/edit-subcategory/:catId/:subId',requireAuth,
  upload.fields([
    {name:'image',maxCount:1},
    {name:'pdf',maxCount:1}

  ]),updateSub)
//delte subcategory
router.get('/:catId/sub/:subId/delete',requireAuth,deleteSub)

router.get('/:catId/book/:subId',requireAuth,getBookDetails)



export default  router
