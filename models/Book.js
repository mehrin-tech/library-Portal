import mongoose from 'mongoose'
const bookSchema=new mongoose.Schema({
    title:{
      type:  String,
      required:true
    },
    author:{
       type: String,
       required:true
    },
   publishedDate:{
    type:Date
   },
   image:{
    type:String
   },
   isbn:{
    type:String,
    unique:true,
    required:true
   },
   totalCopies:{
    type:Number,
    required:true
   },
   availableCopies:{
    type:Number,
    required:true
   }
},{timestamps:true})

export default mongoose.model("Book",bookSchema)
