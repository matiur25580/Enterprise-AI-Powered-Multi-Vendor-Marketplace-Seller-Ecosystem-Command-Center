const mongoose=require('mongoose');
module.exports=mongoose.model('Deal',new mongoose.Schema({
  productId:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  productName:String, sellerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  percent:Number, dealPrice:Number, endsAt:Date, active:{type:Boolean,default:true}
},{timestamps:true}));
