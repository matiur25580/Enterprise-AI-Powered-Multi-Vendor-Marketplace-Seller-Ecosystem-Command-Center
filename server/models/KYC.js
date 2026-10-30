const mongoose=require('mongoose');
module.exports=mongoose.model('KYC',new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true},
  shopName:String, shopDesc:String,
  kycStatus:{type:String,enum:['pending','verified','rejected'],default:'pending'}
},{timestamps:true}));
