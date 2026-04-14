import mongoose from 'mongoose'
const issuedBookSchema=new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    book:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Book",
        required:true
    },
    issueDate:{
        type:Date,
        required:true
    },
    expectedReturnDate:{
        type:Date,
        required:true
    },
    actualReturnDate:{
        type:Date
    },
    lateDays:{
 type:Number,
 default:0
    },
    status:{
        type:String,
        enum:["issued","returned"],
        default:"issued"
    },
    returnRequested:{
        type:Boolean,
        default:false
    },
    fine:{
        type:Number,
        default:0
    },
    finePaid:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export default mongoose.model("IssuedBook",issuedBookSchema)