const mongoose = require('mongoose');
const o = new mongoose.Schema({ email:{type:String,required:true}, otp:{type:String,required:true}, purpose:{type:String,default:'register'}, createdAt:{type:Date,default:Date.now,expires:300} });
module.exports = mongoose.model('Otp', o);
