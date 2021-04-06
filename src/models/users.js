const mongoose=require("mongoose")
const bsrypt=require("bcryptjs")
const validator=require("validator")
const jwt=require("jsonwebtoken")
const task=require("./tasks")
const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength :7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("password should not contain 'password'")
            }
        }
    },
    avatars:{
        type:Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
})
userSchema.virtual("tasks",{
    ref:"Task",
    localField:"_id",
    foreignField:"owner"
})
userSchema.methods.toJSON=function(){
    const userObject=this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatars
    return userObject
}
userSchema.methods.generateToken=async function(){
    const token=jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
    this.tokens=this.tokens.concat({token})
    await this.save()
    return token
}
userSchema.statics.findByLoginIn=async(email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error("invalid details")
    }
    const ismatch=await bsrypt.compare(password,user.password)
    if(!ismatch){
        throw new Error("invalid details")
    }
    return user
}
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bsrypt.hash(this.password,8)
    }
    next()
})
userSchema.pre("remove",async function (next){
    await task.deleteMany({owner :this._id})
    next()
})
const User = mongoose.model("User",userSchema)
module.exports=User