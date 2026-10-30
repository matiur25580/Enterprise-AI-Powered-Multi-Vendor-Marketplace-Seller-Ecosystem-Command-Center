const mongoose=require('mongoose');
module.exports=mongoose.model('Announcement',new mongoose.Schema({
  title:String, body:String, active:{type:Boolean,default:true}
},{timestamps:true}));
