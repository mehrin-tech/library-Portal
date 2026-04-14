import mongoose from 'mongoose'

const categorySchema=new mongoose.Schema(
{
    category:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
   
    image:{
        type:String
    }
},{timestamps:true}
)

export default mongoose.model('Category',categorySchema)