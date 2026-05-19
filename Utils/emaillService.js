import nodemailer from'nodemailer'

const sendContactEmail=async(fullname,email,message)=>{


const transporter=nodemailer.createTransport({
     host:"smtp.gmail.com",
     port:465,
     secure:true,
    
    
    //service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
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
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
        `
    };

    await transporter.sendMail(mailOptions)
    console.log('mail send successfully')

}
export{sendContactEmail}