const User = require('../models/user')
const _ = require('lodash')
const fs = require('fs')
const formidable=require('formidable')
const mongoose=require('mongoose')
const {ObjectId}=mongoose.Types

exports.userById =  (req, res, next, id ) => {
    console.log("IDDD=",id)
    console.log("IIIID-",req.params.userId)
    console.log("typeOF -",ObjectId(id))
     User.findById(ObjectId(req.params.userId))
    .exec((err, user) => {
        if (err || !user) {
            console.log("error and user -",err," && ",user)
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user; // adds profile object in req with user info
        next();
    });
}

exports.hasAuthorization = (req,res,next) =>{
    const hasAuth=req.profile && req.auth && req.profile._id == req.auth._id;
    if(!hasAuth){
        return res.status(403).json({
            error:"No Authorization to do that!"
        });
    }
}

exports.allUsers= ( req, res) =>{
    User.find((err,users)=>{
        if(err) return res.json({error:err})
        res.json({users})
    }).select("userName emailId gender profession country city phoneNo created updated")
    .sort({userName:1})
}

exports.getUser = (req, res) =>{
    req.profile.hashedPassword=undefined
    req.profile.salt=undefined
    console.log("getUser ",req.profile)
    return res.json(req.profile)
}

// exports.updateUser = (req, res,next ) =>{
//     let user=req.profile
//     user = _.extend(user, req.body) // extends or mutates the source object
//     user.updated=Date.now()
//     user.save((err)=>{
//         if(err) return res.json({error:"You are not authorized to make changes here"})
//         user.hashedPassword=undefined;
//         user.salt=undefined;
        
//         res.json({user})
//     })

// }

exports.updateUser = (req,res,next)=>{
    let form = new formidable.IncomingForm()
    form.keepExtensions=true
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.json({error:"Photo couldn't be uploaded"})
        }
        let user=req.profile
        user=_.extend(user,fields)
        user.updated=Date.now()
        if(files.photo){
            user.photo.data=fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }
        user.save((err,result)=>{
            if(err) return res.json({error:err})
            user.hashedPassword=undefined
            user.salt=undefined
            res.json(user)
        });
    });
}


exports.deleteUser= (req, res) =>{
    let user=req.profile;
    user.remove((err,user)=> {
        if(err) {
            console.log("Error in deleting: ",err)
            return res.json({error:err})
        }
        res.json({message : "User Account Deleted!"})
    })
}

exports.userPic = (req,res,next)=>{
    if(req.profile.photo.data){
        res.set("Content-Type",req.profile.photo.contentType)
        return res.send(req.profile.photo.data)

    }
    next()
}
exports.addFollowing = (req, res, next) => {
    User.findByIdAndUpdate(req.body.userId, { $push: { following: req.body.followId } }, (err, result) => {
        if (err) {
            return res.status(400).json({ error: err });
        }
        next();
    });
};
exports.addFollower = (req, res) => {
    User.findByIdAndUpdate(req.body.followId, { $push: { followers: req.body.userId } }, { new: true })
        .populate('following', '_id userName')
        .populate('followers', '_id userName')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            result.hashedPassword = undefined;
            result.salt = undefined;
            res.json(result);
        });
};

// remove follow unfollow
exports.removeFollowing = (req, res, next) => {
    User.findByIdAndUpdate(req.body.userId, { $pull: { following: req.body.unfollowId } }, (err, result) => {
        if (err) {
            return res.status(400).json({ error: err });
        }
        next();
    });
};

exports.removeFollower = (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, { $pull: { followers: req.body.userId } }, { new: true })
        .populate('following', '_id userName')
        .populate('followers', '_id userName')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            result.hashedPassword = undefined;
            result.salt = undefined;
            res.json(result);
        });
};
