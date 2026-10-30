const mongoose=require('mongoose');
module.exports=mongoose.model('Config',new mongoose.Schema({
  commissionPct:{type:Number,default:10},
  cashbackPct:{type:Number,default:1},
  referralBonus:{type:Number,default:50}
},{timestamps:true}));
