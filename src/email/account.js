const sgMail=require("@sendgrid/mail")
sgMail.setApiKey(process.env.sendGridAPIKEY)
const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"rajrahulcoolo44o@gmail.com",
        subject:"Welcome to aur website",
        text:`hey ${name} nice to have you on board,we beleive u will enjoy our website`
    })
}
const deleatingEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"rajrahulcoolo44o@gmail.com",
        subject:"Account deleted",
        text:`hey ${name} we regreat for your bad experience with us`
    })
}
module.exports={
    sendWelcomeEmail,
    deleatingEmail
}

