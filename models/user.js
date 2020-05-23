// import { v1 as uuidv1 } from 'uuid';
const uuidv1 = require('uuid')
const mongoose=require('mongoose')
const crypto=require('crypto')
const {ObjectId} = mongoose.Schema

var validateEmail = function(emailId) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(emailId)
};

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true
    },
    emailId:{
        type:String,
        trim:true,
        required:true
    },
    hashedPassword:{
        type:String,
        required:true,
    },
    gender:String,
    country:String,
    city:String,
    phoneNo:String,
    salt:String,
    created:{
        type:Date,
        default:Date.now
    },
    updated:Date,
    photo:{
        data:Buffer,
        contentType:String,
    },
    about:{
        type:String,
        trim:true
    },
    profession:{
        type:String,
        trim:true
    },
    // following:[{type:ObjectId,ref:"User"}],
    // followers:[{type:ObjectId,ref:"User"}]

});

//vitual field
userSchema.virtual('password')
.set(function(password){
    this._password=password;
    //generate a timestamp using uuid module version 1
    this.salt=uuidv1.v1()
    //encryptPassword
    this.hashedPassword=this.encryptPassword(password)
})
.get(function(){
    return this._password
})


//methods to schema
userSchema.methods={
    authenticate:function(plainText){
        console.log("reached 2")
        return this.encryptPassword(plainText)===this.hashedPassword
    },


    encryptPassword:function(password){
        if(!password)return "";
        try{
            return crypto.createHmac('sha1',this.salt)
                        .update(password)
                        .digest('hex')
        }catch(err){console.log(err)}
    }
}


module.exports=mongoose.model("User", userSchema);