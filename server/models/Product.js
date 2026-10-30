const mongoose=require('mongoose');
module.exports=mongoose.model('Product',new mongoose.Schema({ sellerId:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, name:String, price:Number, stock:Number, category:String, warehouse:{type:String,default:'WH-Dhaka'}, featured:{type:Boolean,default:false} },{timestamps:true}));
