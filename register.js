require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let userSchema  = new mongoose.Schema({
    
    fullname:{type:String,required:true,minlength:3,maxlength:20},
    email:{type:String,required:true},
    password:{type:String,required:true,minlength:6,maxlength:100},
    course:{type:String,required:true},
    address:{type:String,required:true},
    tokens:[{
        token:{type:String,required:true}
    }]
})
// generating token 
userSchema.methods.generateAuthToken  = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
    
        this.tokens = this.tokens.concat({token:token});
        await this.save()
        return token;
        
    } catch (error) {
        
    }
} 


const reg = mongoose.model('students',userSchema)
module.exports = reg;