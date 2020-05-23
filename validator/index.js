
exports.createPostValidator = (req,res,next)=>{
	req.body("title","Write a title").notEmpty()
	req.body("title","Title length between 4-150").isLength({
		min:4,max:150
	});
	req.body("body","Write a Body").notEmpty();
	req.body("body","Body length between 10-2000").isLength({
		min:10,max:2000
	});
	const errors=req.validationErrors()
	if(errors){
		const firstErr=errors.map((err)=>{
			err.msg
		})[0];
		return res.status(400).json({error:firstErr})
	}
	next();
};

exports.userSignUpValidator=(req,res,next)=>{
	//for Name:
	body("name","Name is req").notEmpty();

	//Email
	body("emailId","Must be between 4-32 chars").matches(/.+\@.+\..+/)
	.withMessage("Mail must contain @")
	.isLength({min:4,max:32})
	//password
	body("emailId","Must be between 4-32 chars").matches(/\d/)
	.withMessage("must contain number")
	.isLength({min:6,max:32}).withMessage("Length must be 6 atleast")
	//errors
	const errors=req.validationErrors()
	if(errors){
		const firstErr=errors.map((err)=>{
			err.msg
		})[0];
		return res.status(400).json({error:firstErr})
	}
	next();
};
