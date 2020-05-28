// const mongoose =require('mongoose')
const authController = require('../controllers/auth');
const {
  allUsers,
  userPic,
  userById,
  getUser,
  updateUser,
  deleteUser,
  addFollower,
  addFollowing,
  removeFollower,
  removeFollowing,
} = require('../controllers/user');
const express = require('express');
const router = express.Router();

router.get('/allusers', allUsers);
router.get('/user/:userId', getUser);
router.put('/user/:userId', authController.requireSignIn, updateUser);
router.delete('/user/:userId', authController.requireSignIn, deleteUser);
router.get('/user/photo/:userId', userPic);

router.put(
  'user/follow',
  authController.requireSignIn,
  addFollowing,
  addFollower
);
router.put(
  'user/unfollow',
  authController.requireSignIn,
  removeFollowing,
  removeFollower
);

router.param('userId', userById);
module.exports = router;
