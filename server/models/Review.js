const mongoose=require('mongoose');
module.exports=mongoose.model('Review',new mongoose.Schema({
  productId:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
  productName:String, buyerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  buyerName:String, rating:{type:Number,min:1,max:5}, comment:String
},{timestamps:true}));
