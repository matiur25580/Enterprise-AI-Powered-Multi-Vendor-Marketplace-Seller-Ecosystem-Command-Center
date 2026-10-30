const mongoose=require('mongoose');
module.exports=mongoose.model('Notification',new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  title:String, body:String, read:{type:Boolean,default:false}
},{timestamps:true}));
