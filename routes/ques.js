const mongoose = require('mongoose');
const quesController = require('../controllers/ques');
const express = require('express');
const router = express.Router();
const { userById } = require('../controllers/user');
const { requireSignIn } = require('../controllers/auth');

// router.get("/allqa",allqa)

// const validator=require('../validator/index')

router.get('/allqa', quesController.getQA);
router.get('/countqa', quesController.quesCount);

router.put('/qa/answer', requireSignIn, quesController.answer);
router.put('/qa/delAns', requireSignIn, quesController.deleteAns);

router.post('/qa/new/:userId', requireSignIn, quesController.ask);
router.get('/qa/by/:userId', requireSignIn, quesController.getQuesByUser);

router.get('/qa/:quesId', quesController.singleQues);

router.delete(
  '/qa/:quesId',
  requireSignIn,
  quesController.isPoster,
  quesController.deleteQues
);

router.put(
  '/qa/:quesId',
  requireSignIn,
  quesController.isPoster,
  quesController.updateQues
);
router.get('/qa/photo/:quesId', quesController.quesPic);

router.param('userId', userById);
router.param('quesId', quesController.quesById);
module.exports = router;
