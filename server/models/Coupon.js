const mongoose=require('mongoose');
module.exports=mongoose.model('Coupon',new mongoose.Schema({
  code:{type:String,unique:true,uppercase:true},
  percent:{type:Number,min:1,max:90}, minOrder:{type:Number,default:0},
  sellerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
  active:{type:Boolean,default:true}
},{timestamps:true}));
