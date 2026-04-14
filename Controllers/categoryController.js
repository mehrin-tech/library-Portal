import path from 'path'
import Category from '../models/Category.js'
import SubCategory from '../models/subCategory.js'
import { ConflictError, NotFoundError } from '../Utils/error.js'





const getCategoryList=async(req,res,next)=>{
    try{
        const page=Number(req.query.page)||1
        const limit=3
        const skip=(page-1)*limit

    
    const totalCategories=await Category.countDocuments()
    const totalPages=Math.ceil(totalCategories/limit)

   

    const categories=await Category.find()
    .skip(skip)
    .limit(limit)
    console.log(categories)
    res.render('admin/category/categories',{
        categories,
        totalPages,
        currentPage:page
    })
}catch(err){
next(err)
}
}
const getCategoryForm=(req,res)=>{
  
    res.render('admin/category/addCategories')
}
const postAdd=async(req,res,next)=>{
    try{
    const {category}=req.body

    if(!category ){
        return next(new ConflictError('category is required'))
    }

  
     const exist=await Category.findOne({
        category:category.trim()
     })
    if(exist){
        return next(new ConflictError('already exist'))
    }


    await Category.create({
        category:category.trim(),
        
        image:req.file?req.file.filename:null
    })
   
  
    res.redirect('/admin/category/categoryList')
}catch(err){
    next(err)
}
}
const getEditCategory=async(req,res,next)=>{
  
    const category=await Category.findById(req.params.id)

    if(!category){
        return next(new NotFoundError('not found category'))
    }
    
     res.render('admin/category/editCategories',{category})
}
const postUpdate=async(req,res,next)=>{
        const {category}=req.body

    const exist=await Category.findOne({
        category:category.trim(),
        _id:{$ne:req.params.id}
    })
    if(exist){
        return next(new ConflictError('already exists'))
    }
  await Category.findByIdAndUpdate(req.params.id,{
    category:category.trim(),
   
  })
    res.redirect('/admin/category/categoryList')
}

const deleteCategory=async(req,res,next)=>{
  
   await Category.findByIdAndDelete(req.params.id)
    res.redirect('/admin/category/categoryList')
}

const getSubCategory=async(req,res,next)=>{
    try{
       const categoryId=req.params.id

       const page = Number(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    const category=await Category.findById(categoryId)

    if(!category){
        return next(new NotFoundError('not found category'))
    }
    
   
    const subDoc=await SubCategory.findOne({categoryId})
    const allSubs=subDoc?subDoc.subcategories:[]
  
    const totalPages = Math.ceil(allSubs.length / limit);
    const paginatedSubs = allSubs.slice(skip, skip + limit);

    res.render('admin/category/viewsubCategory',{
        category,
        sub:paginatedSubs,
        currentPage:page,
        totalPages
    })
}catch(err){
    next(err)
}
}
const subCategoryForm=async(req,res,next)=>{
    
  const category=await Category.findById(req.params.id)

  if(!category){
    return next(new NotFoundError('not found category'))
  }
      res.render('admin/category/addSub', { category });

}
const addSubCategory=async(req,res,next)=>{
    try{
    const categoryId=req.params.id
    const {subCategory,author,bookTitle,description}=req.body
    
    let subDoc=await SubCategory.findOne({categoryId})

    if(!subDoc){
        subDoc=new SubCategory({
            categoryId,
            subcategories:[]
        })
    }


subDoc.subcategories.push({

     subCategory,
     author,
    bookTitle,
    description,
   
    image:req.files?.image?.[0]?.filename|| null,
    pdf:req.files?.pdf?.[0]?.filename || null
}) 

    
    await subDoc.save()

    res.redirect(`/admin/category/view/${categoryId}`);

}catch(err){
    next(err)
}
}

const editSub= async (req, res,next) => {
   const {catId,subId}=req.params

    const category = await Category.findById(catId)
    const subDoc = await SubCategory.findOne({categoryId:catId})
     if (!category || !subDoc){
        return next(new NotFoundError('not found category'))
     }
    const subCategory = subDoc.subcategories.id(subId)
    if(!subCategory){
        return next(new NotFoundError('not found subcategory'))
    }
   

    res.render("admin/category/editSub", { category, subCategory,subId});
}
const updateSub=async(req,res,next)=>{
   const {catId,subId}=req.params

    const subDoc=await SubCategory.findOne({categoryId:catId})
    if(!subDoc){
        return next(new NotFoundError('not found subList'))
    }

    const book=subDoc.subcategories.id(subId)

    if(!book){
        return next(new NotFoundError('not found subcategory'))
    }

  

  

  book.author=req.body.author
  book.bookTitle=req.body.bookTitle
  book.description=req.body.description

  if(req.files?.pdf?.length){
    book.pdf=req.files.pdf[0].filename
  }
        await subDoc.save()
    res.redirect(`/admin/category/view/${catId}`)


}

const deleteSub=async(req,res,next)=>{
 const {catId,subId}=req.params
    const subDoc=await SubCategory.findOne({categoryId:catId})
    if(!subDoc){
        return next(new NotFoundError('not found err'))
    }
   subDoc.subcategories.id(subId).deleteOne()
    await subDoc.save()
     res.redirect(`/admin/category/view/${catId}`);
}
//get book details
const getBookDetails=async(req,res,next)=>{
  const {catId,subId}=req.params

    const category=await Category.findById(catId)
    const subDoc=await SubCategory.findOne({categoryId:catId})

    const book=subDoc.subcategories.id(subId)

    res.render('admin/category/bookDetails',{
        category,
        book
    })
}
export{
    getCategoryList,
    getCategoryForm,
    postAdd,
    getEditCategory,
    postUpdate,
    deleteCategory,
    getSubCategory,
    subCategoryForm,
    addSubCategory,
    editSub,
    updateSub,
    deleteSub,
    getBookDetails
    
}