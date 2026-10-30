const mongoose=require('mongoose');
module.exports=mongoose.model('Payout',new mongoose.Schema({
  sellerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  amount:Number, period:String, status:{type:String,default:'paid'}
},{timestamps:true}));
