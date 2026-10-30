const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
  fullName:{type:String,required:true},
  email:{type:String,required:true},
  contact:{type:String,required:true},
  dob:{type:String,required:true},
  role:{type:String,required:true},
  password:{type:String,required:true},
  uniqueId:{type:String,unique:true},
  isVerified:{type:Boolean,default:false}
},{timestamps:true});
userSchema.index({email:1,role:1},{unique:true});
module.exports=mongoose.model('User',userSchema);
