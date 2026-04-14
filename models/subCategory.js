import mongoose from 'mongoose'

const subSchema=new mongoose.Schema({
    subCategory:String,
    author:String,
    bookTitle:String,
    description:String,
    image:String,
    pdf:String
})

const subCategorySchema=new mongoose.Schema({
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    subcategories:[subSchema]
})

export default mongoose.model("Subcategory",subCategorySchema)