import PrivateChat from '../models/PrivateChat.js'

//create room
function createRoom(a, b) {
  return [String(a), String(b)].sort().join('-')
}

export default function privateChat(io){

    io.on('connection', (socket) => {
  console.log('connected:', socket.id)

  //join chat
  socket.on('chat:join', async({ fromUser, toUser}) => {

    const room = createRoom(fromUser, toUser)
    socket.join(room)


    console.log('joined room:', room)

    //send  old mesgs if exist
    const history = await PrivateChat.find({roomId:room}).sort({createdAt:1})
    
      socket.emit('chat:history', history)
    
  })

   //sendmsg
  socket.on('chat:msg', async({ fromUser, toUser,  txt }) => {
   if (!txt) return;

    const room = createRoom(fromUser, toUser)

    const msg = await PrivateChat.create({
        roomId:room,
        senderId:fromUser,
        receiverId:toUser,
        message:txt
    })

 io.to(room).emit('chat:newMsg', msg)
  })
   socket.on('disconnect', () => {
      console.log('disconnected:', socket.id)
    })
})
}