const mongoose=require('mongoose');
const schema=new mongoose.Schema({
  sellerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  amount:{type:Number,required:true,min:0},
  period:{type:String,required:true},
  periodKey:{type:String},
  status:{type:String,enum:['pending','paid','failed'],default:'pending'}
},{timestamps:true});
schema.index({periodKey:1},{unique:true,sparse:true});
module.exports=mongoose.model('Payout',schema);
