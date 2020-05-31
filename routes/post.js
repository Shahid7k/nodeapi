const mongoose = require('mongoose');
const postController = require('../controllers/post');
const express = require('express');
const router = express.Router();
const { userById } = require('../controllers/user');
const { requireSignIn } = require('../controllers/auth');
// const validator=require('../validator/index')

router.get('/posts', postController.getPosts);
router.get('/countPosts', postController.postsCount);
router.put('/post/like', requireSignIn, postController.like);
router.put('/post/unlike', requireSignIn, postController.unlike);
router.put('/post/comment', requireSignIn, postController.comment);
router.put('/post/uncomment', requireSignIn, postController.uncomment);

router.post('/post/new/:userId', requireSignIn, postController.createPost);
router.get('/posts/by/:userId', requireSignIn, postController.getPostsByUser);

router.get('/post/:postId', postController.singlePost);

router.delete(
  '/post/:postId',
  requireSignIn,
  postController.isPoster,
  postController.deletePost
);

router.put(
  '/post/:postId',
  requireSignIn,
  // postController.isPoster,
  postController.updatePost
);
router.get('/blog/photo/:postId', postController.blogPic);

router.param('userId', userById);
router.param('postId', postController.postById);
module.exports = router;
