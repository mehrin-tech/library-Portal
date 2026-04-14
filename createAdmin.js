import mongoose from "mongoose"
import Admin from "./models/Admin.js"

mongoose.connect("mongodb://127.0.0.1:27017/libraryDB")

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