const express=require("express")
const router=new express.Router()
const users=require("../models/users")
const auth=require("../middleware/auth")
const { Mongoose } = require("mongoose")
const multer=require("multer")
const sharp=require("sharp")
const {sendWelcomeEmail}=require("../email/account")
const {deleatingEmail}=require("../email/account")
router.post("/users",async (req,res)=>{
    const user=new users(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token=await user.generateToken()
        res.status(201).send({token,user})
    }
    catch(e){
        res.status(400).send(e)
    }
})
router.post("/users/login", async(req,res)=>{
    try{
        const user=await users.findByLoginIn(req.body.email,req.body.password)
        const token=await user.generateToken()
        res.send({token,user})
    }
    catch(e){
        console.log("yes")
        res.status(400).send(e)
    }
})
router.post("/users/logout",auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.send(e)
    }
})
router.post("/users/logoutall",auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})
router.get("/users/me",auth, async (req,res)=>{
    res.send(req.user)
})
router.patch("/users/me",auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const updateAllowed=["name","age","email","password"]
    const isValid=updates.every((update)=>updateAllowed.includes(update))
    if(!isValid){
        return res.status(404).send({error:"invalid property"})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})
router.delete("/users/me",auth,async (req,res)=>{
    try{
        deleatingEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.status(200).send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})
const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(res,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("file should be a image"))
        }
        cb(undefined,true)
    }
})
router.post("/users/me/avatar",auth,upload.single("avatar"),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatars=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})
router.delete("/users/me/avatar",auth,async(req,res)=>{
    req.user.avatars=undefined
    await req.user.save()
    res.send()
})
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await users.findById(req.params.id)

        if (!user || !user.avatars) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatars)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router