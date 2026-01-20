const nodemailer=require('nodemailer')

const sendContactEmail=async(fullname,email,message)=>{


const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    },
    tls:{
        rejectUnauthorized:false
    }
})

//function to send contct email


    const mailOptions={
        from:`"Library Contact:" <${process.env.EMAIL_USER}>`,
        to:process.env.ADMIN_EMAIL,
        subject:"New Contact Message",
        html:`
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${fullname}</p>
        <p><b>Email:</b> ${message}</p>
        `
    };

    await transporter.sendMail(mailOptions)

}
module.exports={sendContactEmail}