const User = require('../models/user');
const _ = require('lodash');
const fs = require('fs');
const formidable = require('formidable');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

exports.userById = (req, res, next, id) => {
  User.findById(ObjectId(req.params.userId)).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    req.profile = user; // adds profile object in req with user info
    next();
  });
};

exports.hasAuthorization = (req, res, next) => {
  const hasAuth = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!hasAuth) {
    return res.status(403).json({
      error: 'No Authorization to do that!',
    });
  }
};

exports.allUsers = (req, res) => {
  User.find((err, users) => {
    if (err) return res.json({ error: err });
    res.json({ users });
  })
    .select(
      'firstName lastName email gender profession country city phoneNo created updated'
    )
    .sort({ firstName: 1 });
};
exports.countUsers = (req, res) => {
  User.find((err, users) => {
    if (err) return res.json({ error: err });
    res.json({ length: users.length });
  }).select(' _id ');
};

exports.getUser = (req, res) => {
  req.profile.hashedPassword = undefined;
  req.profile.salt = undefined;

  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  const conditions = { _id: req.params.userId };

  User.findOneAndUpdate(conditions, req.body)
    .then(doc => {
      if (!doc) {
        return res.status(404).end();
      }
      return res.status(200).json(doc);
    })
    .catch(err => next(err));
};

exports.deleteUser = (req, res) => {
  let user = req.profile;
  user.remove((err, user) => {
    if (err) {
      return res.json({ error: err });
    }
    res.json({ message: 'User Account Deleted!' });
  });
};

exports.userPic = (req, res, next) => {
  if (req.profile.photo.data) {
    res.set('Content-Type', req.profile.photo.contentType);
    return res.send(req.profile.photo.data);
  }
  next();
};

exports.addFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { following: req.body.followId } },
    (err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      next();
    }
  );
};
exports.addFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    { $push: { followers: req.body.userId } },
    { new: true }
  )
    .populate('following', '_id firstName lastName')
    .populate('followers', '_id firstName lastName')
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      result.hashedPassword = undefined;
      result.salt = undefined;
      res.json(result);
    });
};

// remove follow unfollow
exports.removeFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { following: req.body.unfollowId } },
    (err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      next();
    }
  );
};

exports.removeFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    { $pull: { followers: req.body.userId } },
    { new: true }
  )
    .populate('following', '_id firstName lastName')
    .populate('followers', '_id firstName lastName')
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      result.hashedPassword = undefined;
      result.salt = undefined;
      res.json(result);
    });
};
