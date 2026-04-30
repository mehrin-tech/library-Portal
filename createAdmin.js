import mongoose from "mongoose"
import dotenv from 'dotenv'
import Admin from "./models/Admin.js"
import bcrypt from "bcrypt"

dotenv.config()


const createAdmin=async()=>{
try{
  await mongoose.connect(process.env.MONGO_URI)


  const admin = new Admin({
    username: "admin",
    password:"admin123"
  })

  await admin.save()

  console.log("Admin created successfully")
  process.exit()
}catch(err){
  console.log(err)
  process.exit(1)
}
}

createAdmin()
