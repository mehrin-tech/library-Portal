const path=require('path')
const fs=require('fs').promises
const filePath=path.join(__dirname,'../data/category.json')
const subPath=path.join(__dirname,'../data/subCategory.json')
const { ConflictError, NotFoundError }=require('../Utils/error')
const onlinePath=path.join(__dirname,'../data/onlineReads.json')

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

//================read and write online readers============//
async function readOnline(){
    try{
const data=await fs.readFile(onlinePath,'utf-8')
return data?JSON.parse(data):[]
    }catch(err){
  return []
    }
}

async function writeOnline(reads){
    await fs.writeFile(onlinePath,JSON.stringify(reads,null,2))
}









//=============================//
const getCategoryList=async(req,res,next)=>{
    const categories=await readData()
    res.render('User/category/categoryList',{categories})
}
const getSubCategory=async(req,res,next)=>{
    const categoryId=parseInt(req.params.id)

    const categories=await readData()
    const category=categories.find(c=>c.id===categoryId)

    if(!category){
        return next(new NotFoundError('not found error'))
    }
    const subCategory=await readSub()

    const sub=subCategory.find(s=>s.categoryId===categoryId)
    const subCategoryList=sub?sub.subcategories:[]

    res.render('User/category/viewSubCategory',{
        category,
        sub:subCategoryList
    })
}
const getBookDetails=async(req,res,next)=>{
    try{
    const studentId=req.student.id
    const catId=parseInt(req.params.catId)
    const subId=parseInt(req.params.subId)

    const categories=await readData()
    const subData=await readSub()

    const category=categories.find(c=>c.id===catId)
    const subList=subData.find(s=>s.categoryId===catId)

    const book=subList.subcategories.find(s=>s.id===subId)
    if(!book){
        return next(new NotFoundError('book not found'))
    }

    await startOnlineReading(studentId,book.id)//start onlinereading
    res.render('User/category/bookDetails',{
        category,
        book
    })
}catch(err){
    next(err)
}
}


//===========onlinestudent reads start===========//
const startOnlineReading=async(studentId,bookId)=>{
    try{

 const reads=await readOnline()

 const alreadyActive=reads.find(r=>r.studentId===studentId &&
    r.bookId===bookId &&
    r.isActive)

    if(!alreadyActive){
        reads.push({
            studentId,
            bookId,
            isActive:true,
            startTime:new Date().toISOString()
        })
      
        await writeOnline(reads)
    }
 
    }catch(err){

    }
}





const stopOnlineReading=async(req,res,next)=>{
    try{
        const studentId=req.student.id
        const bookId=parseInt(req.params.bookId)
     const reads=await readOnline()

    const reading=reads.find(r=>r.studentId===studentId &&
        r.bookId===bookId &&
        r.isActive
    )

    if(reading){
        reading.isActive=false
        reading.endTime=new Date().toISOString()

       await writeOnline(reads)
    }
       res.status(200).end()
     
}catch(err){
    next(err)
}
}
module.exports={
    getCategoryList,
    getSubCategory,
    getBookDetails,
    
    stopOnlineReading
}