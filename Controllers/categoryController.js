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

const getCategoryList=async(req,res)=>{
    const categories=await readData()
    res.render('admin/category/categories',{categories})
}
const getCategoryForm=async(req,res)=>{
  
    res.render('admin/category/addCategories')
}
const postAdd=async(req,res,next)=>{
    const {id,category,author}=req.body
    const categories=await readData()

    const newCategory={
        id:categories.length>0?categories[categories.length-1].id+1:1,
       
        category,
        author,
        image:req.file?req.file.filename:null
    }
    const exist=categories.some(cate=>cate.category.toLowerCase()===category.toLowerCase())
    if(exist){
        return next(new ConflictError('already exist'))
    }
    categories.push(newCategory)
    await writeData(categories)
    res.redirect('/admin/category/categoryList')
}
const getEditCategory=async(req,res)=>{
    const categoryId=parseInt(req.params.id)
    const categories=await readData()
    const category=categories.find(cate=>cate.id===categoryId)

    if(!category){
        return next(new NotFoundError('not found category'))
    }
    
     res.render('admin/category/editCategories',{category})
}
const postUpdate=async(req,res,next)=>{
    const categories=await readData()
    const categoryId=parseInt(req.params.id)
    const category=categories.find(cate=>cate.id===categoryId)

    if(!category){
        return next(new NotFoundError('not found category'))
    }
    category.category=req.body.category
    await writeData(categories)
    res.redirect('/admin/category/categoryList')
}

const deleteCategory=async(req,res)=>{
    const categoryId=parseInt(req.params.id)
    const categories=await readData()
    const category=categories.filter(c=>c.id!==categoryId)
    await writeData(category)
    res.redirect('/admin/category/categoryList')
}

const getSubCategory=async(req,res,next)=>{
    const categories=await readData()
    const categoryId=parseInt(req.params.id)
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
const addSubCategory=async(req,res)=>{
    const categoryId=parseInt(req.params.id)
    const {id,subcategory,bookTitle,description}=req.body
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
    subcategory,
    bookTitle,
    description,
    image:req.file?req.file.filename:null
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
    const subCategory = subList?.subcategories?.[subId];

    if (!category || !subList || !subCategory)
        return next(new NotFoundError('not found category'))

    res.render("admin/category/editSub", { category, subCategory, subId });
}
const updateSub=async(req,res,next)=>{
   const catId=parseInt(req.params.catId)
   const subId=parseInt(req.params.subId)
    const subCate=await readSub()

  
    const subList=subCate.find(s=>s.categoryId===catId)
    if(!subList) return next(new NotFoundError('not found subList'))
    
    subList.subcategories[subId].subcategory=req.body.subcategory
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
    subList.subcategories.splice(subId,1)
    await writeSub(subData)
     res.redirect(`/admin/category/view/${catId}`);
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
    deleteSub
}