const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { TOKEN_EXPIRY_TIME } = require('../constants/tokenExpiryTime');
require('dotenv').config();

exports.signup = async (req, res) => {
  console.log(TOKEN_EXPIRY_TIME);
  console.log(req.body.email);
  try {
    const userExists = await User.findOne({ email: req.body.email });
    console.log('Userrr:', userExists);

    if (userExists) {
      return res.status(403).json({ error: `Email is Taken!` });
    }
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY_TIME,
    });
    //persist token with expiry date

    //return response with user details and token
    const { _id, firstName } = savedUser;
    return res.json({ token, user: { _id, firstName } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.signin = (req, res) => {
  //find user
  const { email, password } = req.body;
  console.log('1st param - ', email, ' 2- ', password);
  User.findOne({ email }, (err, user) => {
    if (err || !user)
      return res.status(401).json({
        error: 'No user with this Email Exists',
      });

    console.log('reached');
    //if User is not  found
    if (!user.authenticate(password)) {
      console.log('reached 2');
      return res.status(401).json({
        error: 'Wrong Password',
      });
    }

    console.log('reached 3');
    //else if User is found
    //generate Token with user id and secret
    // const secret=;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY_TIME,
    });
    //persist token with expiry date

    //return response with user details and token
    const { _id, firstName } = user;
    return res.json({ token, user: { _id, firstName } });
  });
};

exports.signout = (req, res) => {
  return res.json({ message: 'Signed Out!' });
};

exports.requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  getToken: function fromHeaderOrQuerystring(req) {
    console.log(req.headers);
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },
});
