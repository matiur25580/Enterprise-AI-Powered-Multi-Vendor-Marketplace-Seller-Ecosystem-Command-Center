const mongoose=require('mongoose');
module.exports=mongoose.model('Return',new mongoose.Schema({
  orderId:{type:mongoose.Schema.Types.ObjectId,ref:'Order'},
  trackingId:String, buyerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  sellerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  reason:String, status:{type:String,enum:['pending','approved','rejected'],default:'pending'}
},{timestamps:true}));
