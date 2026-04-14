import path from 'path'
import Category from '../models/Category.js'
import SubCategory from '../models/subCategory.js'
import ReadOnline from '../models/ReadOnline.js'
import { ConflictError, NotFoundError } from '../Utils/error.js'













//=============================//
const getCategoryList=async(req,res,next)=>{
    try{
        const page=Number(req.query.page)||1
        const limit=4
        const skip=(page-1)*limit

        const totalCategories=await Category.countDocuments()
        const totalPages=Math.ceil(totalCategories/limit)


    const categories=await Category.find()
    .skip(skip)
    .limit(limit)
    res.render('User/category/categoryList',{
        categories,
        totalPages,
        currentPage:page,
    userId:req.student.id
})
}catch(err){
    next(err)
}
}
const getSubCategory=async(req,res,next)=>{
    try{
    const categoryId=req.params.id

     const page = parseInt(req.query.page) || 1
    const limit = 3
    const skip = (page - 1) * limit

    const category=await Category.findById(categoryId)

    if(!category){
        return next(new NotFoundError('not found error'))
    }
    

    const subDoc=await SubCategory.findOne({categoryId})
        const totalBooks = subDoc ? subDoc.subcategories.length : 0
   const subCategoryList = subDoc 
        ? subDoc.subcategories.slice(skip, skip + limit)
        : []
    const totalPages = Math.ceil(totalBooks / limit)
    res.render('User/category/viewSubCategory',{
        category,
        sub:subCategoryList,
        userId:req.student.id,
        currentPage:page,
        totalPages
    })
}catch(err){
    next(err)
}
}
const getBookDetails=async(req,res,next)=>{
    try{
    const studentId=req.student.id
    const {catId,subId}=req.params

   console.log('reqstd',req.student)
   console.log('req std',req.student._id)

    const category=await Category.findById(catId)
    const subDoc=await SubCategory.findOne({categoryId:catId})

    const book=subDoc.subcategories.id(subId)
    if(!book){
        return next(new NotFoundError('book not found'))
    }

    await startOnlineReading(studentId,subId,book.bookTitle)//start onlinereading
    res.render('User/category/bookDetails',{
        category,
        book
    })
}catch(err){
    next(err)
}
}


//===========onlinestudent reads start===========//
const startOnlineReading=async(studentId,bookId,bookTitle)=>{
    const alreadyActive=await ReadOnline.findOne({
    student: studentId,
   bookId: bookId,
    isActive:true
 })
    if(!alreadyActive){
       await ReadOnline.create({
        student:studentId,
       bookId: bookId,
       bookName:bookTitle,
       isActive:true,
       startTime:new Date()
       })
    }
}





const stopOnlineReading=async(req,res,next)=>{
    try{
        const studentId=req.student._idid
        const bookId=req.params.bookId
     

    const reading=await ReadOnline.findOne({
        studentId,
        bookId,
        isActive:true
    })
    if(reading){
        reading.isActive=false
        reading.endTime=new Date()

       await reading.save()
    }
       res.status(200).end()
     
}catch(err){
    next(err)
}
}
export{
    getCategoryList,
    getSubCategory,
    getBookDetails,
    startOnlineReading,
    stopOnlineReading
}