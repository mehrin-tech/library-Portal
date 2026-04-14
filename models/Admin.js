import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const adminSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})
adminSchema.pre('save',async function(){
    if(!this.isModified('password')) return 
    
        this.password=await bcrypt.hash(this.password,10)
    
})

export default mongoose.model("Admin",adminSchema)