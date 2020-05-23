const mongoose =require('mongoose')
const {ObjectId } = mongoose.Schema

const postSchema=new mongoose.Schema({
	title:{
		type:String,
		required:"Title REQ!",
		minlength:4,
		maxlength:150
	},
	body:{
		type:String,
		required:"Body REQ!!",
		minlength:10,
		maxlength:2000
	},
	about:{
		type:String,
		required:"About REQ!!",
		minlength:5,
		maxlength:75
	},
	photo:{
		data:Buffer,
		contentType:String
	},
	postedBy: {
		type: ObjectId,
		ref: "User"
	},
	created:{
		type:Date,
		default:Date.now
	},
	updated:Date,
	likes:[{
		type:ObjectId,ref:"User"
	}],
	comments:[{
		text:String,
		created:{type:Date,default:Date.now},
		postedBy:{type:ObjectId,ref:"User"}
	}]
	

});



module.exports = mongoose.model("Post",postSchema);