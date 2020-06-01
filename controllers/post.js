const Post = require('../models/post');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

exports.createPost = async (req, res) => {
  const blogData = req.body;
  const userId = req.params.userId;

  console.log('Blogdata and userId', blogData, userId);

  try {
    const post = new Post({ ...blogData, postedBy: userId });

    const savedPost = await post.save();

    res.json(savedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  // const currentPage = req.query.page || 1;
  // const perPage = 8;
  // let totalItems;

  const posts = await Post.find({}).select('-content').sort({ created: -1 });

  // console.log(res);
  // console.log(posts);

  res.json(posts);

  // const posts = await Post.find()
  //   // countDocuments() gives you total count of posts
  //   .countDocuments()
  //   .then(count => {
  //     totalItems = count;
  //     return Post.find()
  //       .populate('postedBy', '_id userName')
  //       .sort({ created: -1 })
  //       .skip((currentPage - 1) * perPage)
  //       .limit(perPage)
  //       .select('title photo about created updated');
  //   })
  //   .then(posts => {
  //     res.status(200).json(posts);
  //   })
  //   .catch(err => console.log(err));
};

exports.postsCount = (req, res) => {
  const post = Post.find()
    .select('_id')
    .then(posts => res.status(200).json({ length: posts.length }))
    .catch(err => console.log(err));
};

// exports.getPostsByUser = (req, res)=>{
// 	Post.find({postedBy:req.profile._id})
// 	.populate("postedBy","_id userName")
// 	.sort({created:-1})
// 	.exec((err, posts)=>{
// 		if(err) return res.json({error:err})
// 		res.json(posts)
// 	})
// }

exports.getPostsByUser = async (req, res) => {
  const posts = await Post.find({ postedBy: req.params.userId })
    .select('-content')
    .sort({ created: -1 });

  // console.log('posts', posts);

  res.json(posts);

  // console.log('REQ_PROFILE_ID:', req.profile._id);
  // Post.find({ postedBy: req.profile._id })
  //   .populate('postedBy', '_id userName')
  //   .select('_id title about body created likes comments updated')
  //   .sort({ created: -1 })
  //   .exec((err, posts) => {
  //     if (err) {
  //       return res.status(400).json({
  //         error: err,
  //       });
  //     }
  //     return res.json(posts);
  //   });
};

exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate('postedBy', '_id firstName')
    .populate('comments.postedBy', '_id firstName')
    .select('_id title content description created likes comments updated')
    .exec((err, post) => {
      console.log('ERR & POSTTT: ', err, ' --- ', post);
      if (err || !post) {
        return res.status(400).json({
          error: err,
        });
      }
      req.post = post;
      next();
    });
};

exports.isPoster = (req, res, next) => {
  let _isPoster = req.post && req.user && req.post.postedBy._id == req.user._id;
  // console.log('req post = ', req.post);
  // console.log('-------------------');
  // console.log('req.user: ', req.user);
  // console.log('-------------------');
  // console.log('req post ====== ', req.post);
  // console.log('req.post.postedBy._id : ', req.post.postedBy._id);
  // console.log('-------------------');
  console.log('req.user._id : ', req.user._id);

  if (!_isPoster) return res.json({ error: 'User not authorized' });
  next();
};

exports.deletePost = (req, res, next) => {
  const conditions = { _id: req.params.postId };

  const message = 'Post Deleted';

  Post.deleteOne(conditions)
    .then(() => res.status(200).json(message))
    .catch(err => next(err));
};

exports.updatePost = (req, res, next) => {
  const conditions = { _id: req.params.postId };

  console.log('Post Id', req.params.postId);
  console.log('Edit Post', req.body);
  Post.findOneAndUpdate(conditions, req.body)
    .then(doc => {
      if (!doc) {
        return res.status(404).end();
      }
      return res.status(200).json(doc);
    })
    .catch(err => next(err));
};

exports.blogPic = (req, res, next) => {
  if (req.post.photo.data) {
    res.set('Content-Type', req.post.photo.contentType);
    return res.send(req.post.photo.data);
  }
  next();
};

exports.singlePost = (req, res) => {
  // console.log("PPPPPPPPPPOOOOOOOOOOOOSSSSSSSSSSSSSSTTTTTTTTTTTTTTTTTTTTTTT---------",req.post)
  return res.json(req.post);
};

exports.like = (req, res, next) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  )
    .populate('postedBy', '_id firstName')
    .then(result => res.status(200).json(result))
    .catch(err => next(err));
};

exports.unlike = (req, res, next) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  )
    .populate('postedBy', '_id firstName')
    .then(result => res.status(200).json(result))
    .catch(err => next(err));
};

exports.comment = (req, res, next) => {
  let comment = req.body;
  comment.postedBy = req.body.userId;
  comment.text = req.body.comment;

  Post.findByIdAndUpdate(
    req.body.blogId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate('comments.postedBy', '_id firstName')
    .populate('postedBy', '_id firstName')
    .sort({ created: -1 })
    .then(result => res.status(200).json(result))
    .catch(err => next(err));
};

exports.uncomment = (req, res, next) => {
  let comment = req.body.comment;
  comment.postedBy = req.body.userId;
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: { _id: comment._id } } },
    { new: true }
  )
    .populate('comments.postedBy', '_id firstName')
    .populate('postedBy', '_id firstName')
    .then(result => res.status(200).json(result))
    .catch(err => next(err));
};
