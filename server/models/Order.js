const mongoose=require('mongoose');
module.exports=mongoose.model('Order',new mongoose.Schema({
  buyerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  sellerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  items:[{name:String,price:Number,qty:Number}],
  total:Number, commission:Number,
  status:{type:String,enum:['placed','shipped','delivered','cancelled'],default:'placed'},
  fraudFlag:{type:Boolean,default:false},
  trackingId:String, warehouse:{type:String,default:'WH-Dhaka'}
},{timestamps:true}));
