const path=require('path')
const fs=require('fs').promises
const filePath=path.join(__dirname,'../data/category.json')
const subPath=path.join(__dirname,'../data/subCategory.json')
const { ConflictError, NotFoundError }=require('../Utils/error')



async function readData(){
    try{
        const data=await fs.readFile(filePath,'utf-8')
        return data?JSON.parse(data):[]
    }catch(err){
console.error('error reading file:',err)
    }
}


async function writeData(category) {
    try{
await fs.writeFile(filePath,JSON.stringify(category,null,2))
}catch(err){
    console.error('error  writing file:',err)
}
}

async function readSub(){
       try{
        const data=await fs.readFile(subPath,'utf-8')
        return data?JSON.parse(data):[]
    }catch(err){
console.error('error reading file:',err)
return []
    }
}

async function writeSub(subCategory) {
    try{
await fs.writeFile(subPath,JSON.stringify(subCategory,null,2))
}catch(err){
    console.error('error  writing file:',err)
}
}




//===========================//

const getCategoryList=async(req,res,next)=>{
    try{
        const page=Number(req.query.page)||1
        const limit=3
    const categories=await readData()
    const totalCategories=categories.length
    const totalPages=Math.ceil(totalCategories/limit)

    const startIndex=(page-1)*limit
    const endIndex=startIndex+limit

    const paginated=categories.slice(startIndex,endIndex)
    res.render('admin/category/categories',{
        categories:paginated,
        totalPages,
        currentPage:page
    })
}catch(err){

}
}
const getCategoryForm=(req,res)=>{
  
    res.render('admin/category/addCategories')
}
const postAdd=async(req,res,next)=>{
    const {category,author}=req.body

    if(!category || !category.trim()){
        return next(new ConflictError('category is required'))
    }

    if(!author ||!author.trim()){
        return next(new ConflictError('author is required'))
    }
    const categories=await readData()


     const exist=categories.some(cate=>cate.category.trim().toLowerCase()===category.trim().toLowerCase())
    if(exist){
        return next(new ConflictError('already exist'))
    }


    const newCategory={
        id:categories.length?categories[categories.length-1].id+1:1,
       
        category:category.trim(),
        author:author.trim(),
        image:req.file?req.file.filename:null
    }
   
    categories.push(newCategory)
    await writeData(categories)
    res.redirect('/admin/category/categoryList')
}
const getEditCategory=async(req,res,next)=>{
    const categoryId=parseInt(req.params.id)
    const categories=await readData()
    const category=categories.find(cate=>cate.id===categoryId)

    if(!category){
        return next(new NotFoundError('not found category'))
    }
    
     res.render('admin/category/editCategories',{category})
}
const postUpdate=async(req,res,next)=>{
        const categoryId=parseInt(req.params.id)

    const categories=await readData()
    const category=categories.find(cate=>cate.id===categoryId)

    if(!category){
        return next(new NotFoundError('not found category'))
    }

    const exist=categories.some(c=>c.id!==categoryId &&
        c.category.trim().toLowerCase()===
        req.body.category.trim().toLowerCase()
    )
    if(exist){
        return next(new ConflictError('already exists'))
    }
    category.category=req.body.category
    await writeData(categories)
    res.redirect('/admin/category/categoryList')
}

const deleteCategory=async(req,res,next)=>{
    const categoryId=parseInt(req.params.id)
    const categories=await readData()
    const exist=categories.some(c=>c.id===categoryId)
    if(!exist){
        return next(new NotFoundError('not found category'))
    }
    const category=categories.filter(c=>c.id!==categoryId)
    await writeData(category)
    res.redirect('/admin/category/categoryList')
}

const getSubCategory=async(req,res,next)=>{
       const categoryId=parseInt(req.params.id)

    const categories=await readData()
    const category=categories.find(c=>c.id===categoryId)

    if(!category){
        return next(new NotFoundError('not found category'))
    }
    const subCategory=await readSub() 
   
    const sub=subCategory.find(s=>s.categoryId===categoryId)
    const subCategoryList=sub?sub.subcategories:[]
  
    res.render('admin/category/viewsubCategory',{
        category,
        sub:subCategoryList
    })
}
const subCategoryForm=async(req,res,next)=>{
    const categories=await readData()
    const  categoryId=parseInt(req.params.id)
  const category=categories.find(c=>c.id===categoryId)

  if(!category){
    return next(new NotFoundError('not found category'))
  }
      res.render('admin/category/addSub', { category });

}
const addSubCategory=async(req,res,next)=>{
    const categoryId=parseInt(req.params.id)
    const {subCategory,author,bookTitle,description}=req.body
    const subData=await readSub()

let exist=subData.find(s=>s.categoryId===categoryId)

if(!exist){
     
        exist = {
            categoryId,
            subcategories: []
        };
        subData.push(exist);
    }
const lastSub=exist.subcategories[exist.subcategories.length-1]
  const newSub={
    id:lastSub?lastSub.id+1:1,
    subCategory,
author,
    bookTitle,
    description,
   
    image:req.files?.image?.[0]?.filename|| null,
    pdf:req.files?.pdf?.[0]?.filename || null
  }
    exist.subcategories.push(newSub);

    
    await writeSub(subData);

    res.redirect(`/admin/category/view/${categoryId}`);

}

const editSub= async (req, res,next) => {
    const catId = parseInt(req.params.catId);
    const subId=parseInt(req.params.subId)
  
    const categories = await readData();
    const subData = await readSub();

    const category = categories.find(c => c.id == catId);
    const subList = subData.find(s => s.categoryId == catId);
     if (!category || !subList){
        return next(new NotFoundError('not found category'))
     }
    const subCategory = subList.subcategories.find(s=>s.id===subId);
    if(!subCategory){
        return next(new NotFoundError('not found subcategory'))
    }
   

    res.render("admin/category/editSub", { category, subCategory,subId});
}
const updateSub=async(req,res,next)=>{
   const catId=parseInt(req.params.catId)
   const subId=parseInt(req.params.subId)
    const subCate=await readSub()

  
    const subList=subCate.find(s=>s.categoryId===catId)
    if(!subList){
        return next(new NotFoundError('not found subList'))
    }

    const index=subList.subcategories.findIndex(s=>s.id===subId)

    if(index===-1){
        return next(new NotFoundError('not found subcategory'))
    }

  

  const book=subList.subcategories[index]

  book.author=req.body.author
  book.bookTitle=req.body.bookTitle
  book.description=req.body.description

  if(req.files?.pdf?.length){
    book.pdf=req.files.pdf[0].filename
  }
    
    //subList.subcategories[subId].subcategory=req.body.subcategory
    await writeSub(subCate)
    res.redirect(`/admin/category/view/${catId}`)


}

const deleteSub=async(req,res,next)=>{
    const catId=parseInt(req.params.catId)
    const subId=parseInt(req.params.subId)

    const subData=await readSub()
    const subList=subData.find(s=>s.categoryId===catId)
    if(!subList){
        return next(new NotFoundError('not found err'))
    }
    const index=subList.subcategories.findIndex(s=>s.id===subId)
    if(index===-1){
        return next(new NotFoundError('not found subcategory'))
    }
    subList.subcategories.splice(index,1)
    await writeSub(subData)
     res.redirect(`/admin/category/view/${catId}`);
}
//get book details
const getBookDetails=async(req,res,next)=>{
    const catId=parseInt(req.params.catId)
    const subId=parseInt(req.params.subId)

    const categories=await readData()
    const subData=await readSub()

    const category=categories.find(c=>c.id===catId)
    const subList=subData.find(s=>s.categoryId===catId)

    const book=subList.subcategories.find(s=>s.id===subId)

    res.render('admin/category/bookDetails',{
        category,
        book
    })
}
module.exports={
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