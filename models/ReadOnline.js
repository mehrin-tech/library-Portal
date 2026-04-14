import mongoose from 'mongoose'

const onlineSchema=new mongoose.Schema({
    
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
       
    },
    bookName:{
        type:String,
        required:true
    },
    startTime:{
        type:Date,
        required:true,
        default:Date.now
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

export default mongoose.model("ReadOnline",onlineSchema)