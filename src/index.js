const express=require("express")
require("./db/mongoose")
const bcrypt=require("bcryptjs")
const userRouter=require("./routers/user")
const taskRouter=require("./routers/tasks")
const tasks=require("./models/tasks")
const app=express()
const port=process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.listen(port,()=>{
    console.log("connected to port"+ port)
})
/*const fun= async (password) =>{
    const hashedPass=await bcrypt.hash(password,8)
    console.log(hashedPass)
    const ismatch=await bcrypt.compare("123rahul",hashedPass)
    console.log(ismatch)
}
fun("123rahul")*/