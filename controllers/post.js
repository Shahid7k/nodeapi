const Post= require('../models/post');
const formidable=require('formidable')
const fs = require('fs')
const _ = require('lodash')
const mongoose=require('mongoose')
const {ObjectId} = mongoose.Types

exports.createPost=(req,res)=>{
	let form=new formidable.IncomingForm()
	form.keepExtensions=true
	form.parse(req, (err,fields,files)=>{
		if(err){
			return res.status(400).json({error:"Image couldn't be uploaded!"})
		}
		let post = new Post(fields) 
		req.profile.hashedPassword=undefined;
		req.profile.salt=undefined;
		post.postedBy = req.profile
		if(files.photo){
			post.photo.data= fs.readFileSync(files.photo.path),
			post.photo.contentType= files.photo.type
		}
		post.save((err,result)=>{
			if(err) return res.json({error:err})
			res.json(result)
		})
	})
	
};
// exports.getPosts=(req,res)=>{
// 	const post= Post.find()
// 	.populate("postedBy","userName")
// 	.sort({created:-1})
// 	.select("title body photo about created likes comments updated")
// 	.then((post1)=>{
// 		res.status(200).json({post1})
// 	})
// 	.catch(err=>console.log(err));
// };
exports.getPosts = async (req, res) => {
    const currentPage = req.query.page || 1;
    const perPage = 8;
    let totalItems;

    const posts = await Post.find()
        // countDocuments() gives you total count of posts
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
				.populate('postedBy', '_id userName')
				.sort({ created: -1 })
				.skip((currentPage - 1) * perPage)
				.limit(perPage)
				.select("title photo about created updated")
			})
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => console.log(err));
};


exports.postsCount=(req,res)=>{
	const post = Post.find()
	.select("_id")
	.then((posts)=> res.status(200).json({posts}))
	.catch(err=>console.log(err))
}
// exports.getPostsByUser = (req, res)=>{
// 	Post.find({postedBy:req.profile._id})
// 	.populate("postedBy","_id userName")
// 	.sort({created:-1})
// 	.exec((err, posts)=>{
// 		if(err) return res.json({error:err})
// 		res.json(posts)
// 	})
// }
exports.getPostsByUser = (req, res) => {
	console.log("REQ_PROFILE_ID:",req.profile._id)
	Post.find({ postedBy: req.profile._id })
        .populate('postedBy', "_id userName")
        .select('_id title about body created likes comments updated')
        .sort({created:-1})
        .exec((err, posts) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            return res.json(posts);
        });
};

exports.postById = (req, res, next, id) => {
    Post.findById(id)
		.populate('postedBy', '_id userName')
        .populate('comments.postedBy', '_id userName')
        .select('_id title body about created likes comments photo updated')
        .exec((err, post) => {
			console.log("ERR & POSTTT:",err," --- ",post)
            if (err || !post) {
                return res.status(400).json({
                    error: err
                });
            }
            req.post = post;
            next();
        });
};

exports.isPoster = (req, res, next)=>{
	let _isPoster=req.post && req.auth && req.post.postedBy._id==req.auth._id;
	console.log("req post = ",req.post);
	console.log("-------------------");
	console.log("req.auth: ",req.auth);
	console.log("-------------------");
	console.log("req post ====== ",req.post);
	console.log("req.post.postedBy._id : ",req.post.postedBy._id);
	console.log("-------------------");
	console.log("req.auth._id : ",req.auth._id);
	
	if(!_isPoster) return res.json({error:"User not authorized"})
	next();
}

exports.deletePost = (req, res) =>{
	let post = req.post ;
	post.remove((err, post)=>{
		if(err || !post) return res.json({error:err})
		// const msg="Deleted the post!"+post;
		res.json({message:"Deleted Post!"})
	})
}

exports.updatePost = (req, res, next) =>{
	let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // save post
        let post = req.post;
        post = _.extend(post, fields);
        post.updated = Date.now();

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        post.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(post);
        });
    });
}

exports.blogPic = (req,res,next)=>{
    if(req.post.photo.data){
        res.set("Content-Type",req.post.photo.contentType)
        return res.send(req.post.photo.data)

    }
    next()
}
exports.singlePost=(req,res)=>{
	// console.log("PPPPPPPPPPOOOOOOOOOOOOSSSSSSSSSSSSSSTTTTTTTTTTTTTTTTTTTTTTT---------",req.post)
	return res.json(req.post)
}

exports.like=(req,res)=>{
	Post.findByIdAndUpdate(req.body.postId,{$push:{likes:req.body.userId}},{new:true})
	.exec((err,result)=>{
		if(err) return res.json({error:err})
		else{
			res.json(result)
		}
	})
}
exports.unlike=(req,res)=>{
	Post.findByIdAndUpdate(req.body.postId,{$pull:{likes:req.body.userId}},{new:true})
	.exec((err,result)=>{
		if(err) return res.json({error:err})
		else{
			res.json(result)
		}
	})
}

exports.comment=(req,res)=>{
	let comment=req.body.comment;
	comment.postedBy=req.body.userId;
	Post.findByIdAndUpdate(
		req.body.postId,
		{$push:{comments:comment}},
		{new:true}
	)
	.populate("comments.postedBy","_id userName")
	.populate("postedBy","_id userName")
	.sort({created:-1})
	.exec((err,result)=>{
		if(err) return res.status(400).json({error:err})
		else {
			console.log("COMMENT - ",result)
			return res.json(result)
			
		}
	});
}
exports.uncomment=(req,res)=>{
	let comment=req.body.comment;
	comment.postedBy=req.body.userId;
	Post.findByIdAndUpdate(
		req.body.postId,
		{$pull:{comments:{_id:comment._id}}},
		{new:true}
	)
	.populate("comments.postedBy","_id userName")
	.populate("postedBy","_id userName")
	.exec((err,result)=>{
		if(err) return res.status(400).json({error:err})
		else res.json(result)
	});
}