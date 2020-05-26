const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'Title Required!',
    minlength: 4,
    maxlength: 150,
  },
  content: {
    type: String,
    required: 'Content Required!',
    minlength: 10,
    maxlength: 10000,
  },
  description: {
    type: String,
    required: 'Description Required!',
    minlength: 5,
    maxlength: 150,
  },
  postedBy: {
    type: ObjectId,
    ref: 'User',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  likes: [
    {
      type: ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      text: String,
      created: { type: Date, default: Date.now },
      postedBy: { type: ObjectId, ref: 'User' },
    },
  ],
});

module.exports = mongoose.model('Post', postSchema);
