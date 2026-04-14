import mongoose from 'mongoose'
const privateChatSchema=new mongoose.Schema(
    {
        roomId:{
            type:String,
            required:true,
            index:true
        },
        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        receiverId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        message:{
            type:String,
            required:true,
            trim:true
        }
    },{timestamps:true}
)

export default mongoose.model('PrivateChat',privateChatSchema)