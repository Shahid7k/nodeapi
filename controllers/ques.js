const Ques = require('../models/ques');
const User = require('../models/user');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

exports.ask = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  try{
    form.parse(req, async(err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Image couldn't be uploaded!" });
      }
      console.log("FIELDS : ",fields)
      let ques = new Ques(fields);
      req.profile.hashedPassword = undefined;
      req.profile.salt = undefined;
      ques.postedBy = req.profile;
      if (files.photo) {
        (ques.photo.data = fs.readFileSync(files.photo.path)),
        (ques.photo.contentType = files.photo.type);
      }
      const savedQues = await ques.save();
      res.json(savedQues);
    });
  }catch(error){
    res.status(500).json({ error: error.message });
  }

};

// exports.getQues = async (req, res) => {
//     const currentPage = req.query.page || 1;
//     const perPage = 8;
//     let totalItems;

//     const ques = await Ques.find()
//         // countDocuments() gives you total count of ques
//         .countDocuments()
//         .then(count => {
//             totalItems = count;
//             return Ques.find()
// 				.populate('postedBy', '_id firstName')
// 				.sort({ created: -1 })
// 				.skip((currentPage - 1) * perPage)
// 				.limit(perPage)
// 				.select("title photo tags answers created updated")
// 			})
//         .then(ques => {
//             res.status(200).json(ques);
//         })
//         .catch(err => console.log(err));
// };

exports.getQA = (req, res) => {
  const ques = Ques.find()
    .populate('postedBy', 'firstName')
    .sort({ created: -1 })
    .select('title body photo satisfied tags created  answers updated')
    .then(ques => {
      res.status(200).json({ ques });
    })
    .catch(err => console.log(err));
};

exports.quesCount = (req, res) => {
  const ques = Ques.find()
    .select('_id')
    .then(ques => res.status(200).json({length:ques.length }))
    .catch(err => console.log(err));
};

exports.getQuesByUser = (req, res) => {
  console.log('REQ_PROFILE_ID:', req.profile._id);
  Ques.find({ postedBy: req.profile._id })
    .populate('postedBy', '_id firstName')
    .select('_id title tags body satisfied created answers updated')
    .sort({ created: -1 })
    .exec((err, ques) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      return res.json(ques);
    });
};

exports.deleteQues = (req, res) => {
  let ques = req.ques;
  ques.remove((err, ques) => {
    if (err || !ques) return res.json({ error: err });
    // const msg="Deleted the ques!"+ques;
    res.json({ message: 'Deleted ques!' });
  });
};

exports.updateQues = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Photo could not be uploaded',
      });
    }
    // save post
    let ques = req.ques;
    ques = _.extend(ques, fields);
    ques.updated = Date.now();
    console.log('FILES PHOTO-', files.photo);
    if (files.photo) {
      ques.photo.data = fs.readFileSync(files.photo.path);
      ques.photo.contentType = files.photo.type;
    }

    ques.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(ques);
    });
  });
};

exports.quesPic = (req, res, next) => {
  if (req.ques.photo.data) {
    res.set('Content-Type', req.ques.photo.contentType);
    return res.send(req.ques.photo.data);
  }
  next();
};

exports.singleQues = (req, res) => {
  // console.log("PPPPPPPPPPOOOOOOOOOOOOSSSSSSSSSSSSSSTTTTTTTTTTTTTTTTTTTTTTT---------",req.post)
  return res.json(req.ques);
};

exports.answer = (req, res) => {
  let answer = req.body.answer;
  console.log("answer : ",answer.answer)
  answer.text=answer.answer;
  answer.postedBy = req.body.userId;
  Ques.findByIdAndUpdate(
    req.body.quesId,
    { $push: { answers: answer } },
    { new: true }
  )
    .populate('answers.postedBy', '_id firstName')
    .populate('postedBy', '_id firstName')
    .sort({ created: -1 })
    .exec((err, result) => {
      if (err) return res.status(400).json({ error: err });
      else {
        console.log('Response - ', result);
        return res.json(result);
      }
    });
};

// exports.answer=(req,res)=>{
//     console.log("BODY:",req.body)
//     console.log("ques:",req.body.quesId," user:",req.body.userId," text:",req.body.text)
//     Ques.findById(req.body.quesId)
//     .then(ques=>{

//         const newAns={
//             text:req.body.text,
//             created:Date.now(),
//             postedBy:User.findById(req.body.userId).exec((err,result)=>{
//                 if(err) {
//                     console.log("POSTEDBY ERROR",err)
//                     res.json({err})
//                 }
//                 else{
//                     console.log("POSTEDBY",result)
//                     res.json({result})
//                 }
//             }).catch(err=>console.log(err))
//         }
//         ques.answers.unshift(newAns)

//         ques.save().then(ques=>res.json(ques))
//     })
//     .catch(err=>{
//         console.log("ANSWER ERROR-",err)
//         return res.status(400).json({msg:"Such question doesn't exist"})
//     })
// }

exports.deleteAns = (req, res) => {
  let answer = req.body.answer;
  answer.postedBy = req.body.quesId;
  Ques.findByIdAndUpdate(
    req.body.quesId,
    { $pull: { answers: { _id: answer._id } } },
    { new: true }
  )
    .populate('answers.postedBy', '_id firstName')
    .populate('postedBy', '_id firstName')
    .exec((err, result) => {
      if (err) return res.status(400).json({ error: err });
      else res.json(result);
    });
};

exports.quesById = (req, res, next, id) => {
  Ques.findById(id)
    .populate('postedBy', '_id firstName')
    .populate('answers.postedBy', '_id firstName')
    .select('_id title body satisfied tags created answers photo updated')
    .exec((err, ques) => {
      console.log('ERR & quesTT:', err, ' --- ', ques);
      if (err || !ques) {
        return res.status(400).json({
          error: err,
        });
      }
      req.ques = ques;
      next();
    });
};

exports.isPoster = (req, res, next) => {
  let _isPoster = req.ques && req.auth && req.ques.postedBy._id == req.auth._id;
  console.log('req ques ====== ', req.ques);
  console.log('req.ques.postedBy._id : ', req.ques.postedBy._id);
  console.log('-------------------');
  console.log('req.auth._id : ', req.auth._id);

  if (!_isPoster) return res.json({ error: 'User not authorized' });
  next();
};
