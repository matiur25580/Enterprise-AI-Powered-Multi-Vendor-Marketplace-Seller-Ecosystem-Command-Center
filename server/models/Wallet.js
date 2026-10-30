const mongoose=require('mongoose');
module.exports=mongoose.model('Wallet',new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true},
  balance:{type:Number,default:0},
  txns:[{type:{type:String,enum:['earn','spend']},amount:Number,note:String,at:{type:Date,default:Date.now}}]
},{timestamps:true}));
