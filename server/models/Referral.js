const mongoose=require('mongoose');
module.exports=mongoose.model('Referral',new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true},
  code:{type:String,unique:true},
  referredBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true}));
