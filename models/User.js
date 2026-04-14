import mongoose from 'mongoose'
const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true

    },
    lastName:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
   password:{
    type:String,
    required:true
   },
   department:{
    type:String,
    default:'Not Assigned'
   },
   semester:{
    type:String,
    default:'-'
   },
  
   status:{
    type:String,
    enum:["Active","Inactive"],
    default:"Active"
   },
   image:{
    type:String,
    default:''
   }
   
},{timestamps:true})

export default mongoose.model("User",userSchema)