const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const quesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'Title Required!',
    minlength: 4,
    maxlength: 150,
  },
  body: {
    type: String,
    required: 'Body Required!!',
    minlength: 10,
    maxlength: 2000,
  },
  tags: {
    type: String,
    required: 'Tags Required!!',
    minlength: 3,
    maxlength: 150,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  postedBy: {
    type: ObjectId,
    ref: 'User',
  },
  satisfied: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  answers: [
    {
      text: String,
      created: { type: Date, default: Date.now },
      postedBy: { type: ObjectId, ref: 'User' },
      name: String,
      // likes:[{
      //     type:ObjectId,ref:"User"
      // }]
    },
  ],
});

module.exports = mongoose.model('Ques', quesSchema);
