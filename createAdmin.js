import mongoose from "mongoose"
import dotenv from 'dotenv'
import Admin from "./models/Admin.js"

dotenv.config()
mongoose.connect(process.env.MONGO_URI)

async function createAdmin() {

  const admin = new Admin({
    username: "admin",
    password: "admin123"
  })

  await admin.save()

  console.log("Admin created successfully")
  process.exit()
}

createAdmin()