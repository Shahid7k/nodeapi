const User= require('../models/user');
const jwt=require('jsonwebtoken')
const expressJwt=require('express-jwt')
require('dotenv').config()


exports.signup = async (req,res) =>{
    console.log(req.body.emailId);
    const userExists= await (await User.findOne({"emailId":req.body.emailId}))
    console.log("Userrr:",userExists);

    if(userExists){
         return res.status(403).json({error:"Email is Taken! $(userExists) "});
    }
    const newUser = await new User(req.body)
    await newUser.save()
    res.status(200).json({message:"User Signed Up Successfully"})
};

exports.signin= (req,res) => {
    //find user
    const {emailId, password}=req.body
    console.log("1st param - ",emailId, " 2- ",password)
    User.findOne({emailId},(err,user)=>{
        if(err|| !user) return res.status(401).json({
            error:"No user with this Email Exists"
        });
    
        console.log("reached")
        //if User is not  found
        if(! user.authenticate(password)){
            console.log("reached 2")
            return res.status(401).json({
                "error":"Wrong Password"
            })
        }

        console.log("reached 3");
        //else if User is found
        //generate Token with user id and secret
        // const secret=;
        const token = jwt.sign({_id:user._id }, process.env.JWT_SECRET)
        //persist token with expiry date
        res.cookie("t",{expire:new Date()+9989})

        //return response with user details and token
        const {_id,userName,emailId}=user
        return res.json({token,user:{_id, emailId, userName}})
    })

};

exports.signout= (req,res) =>{
    res.clearCookie("t")
    return res.json({message:"Signed Out!"})
};

exports.requireSignIn = expressJwt({
    secret:process.env.JWT_SECRET,
    userProperty:'auth'

});