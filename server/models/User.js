const mongoose = require('mongoose');
const u = new mongoose.Schema({ fullName:{type:String,required:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, contact:{type:String,required:true}, dob:{type:String,required:true}, role:{type:String,enum:['buyer','seller','logistics','finance','admin'],required:true}, uniqueId:{type:String,unique:true}, password:{type:String,required:true}, isVerified:{type:Boolean,default:false} }, {timestamps:true});
module.exports = mongoose.model('User', u);
