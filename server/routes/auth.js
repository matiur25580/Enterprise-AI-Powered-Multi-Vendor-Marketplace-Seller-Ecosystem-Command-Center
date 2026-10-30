const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/User');
const Otp=require('../models/Otp');
const sendEmail=require('../utils/sendEmail');
const r=express.Router();

const otpHtml=(o)=>`<div style="font-family:sans-serif"><h2>Marketplace Verification</h2><p>Your 6-digit OTP (valid 5 minutes):</p><h1 style="letter-spacing:8px">${o}</h1></div>`;

function makeUid(role,fullName,dob){
  const X=((role||'x')[0]||'X').toUpperCase();
  const parts=(fullName||'').trim().split(/\s+/);
  const Y=((parts[0]||'X')[0]||'X').toUpperCase();
  const Z=((parts[1]||'X')[0]||'X').toUpperCase();
  return `${X}${Y}${Z}${dob}`;
}

const newOtp=async(email,purpose,role)=>{
  const otp=Math.floor(100000+Math.random()*900000).toString();
  await Otp.deleteMany({email,purpose,role});
  await Otp.create({email,otp,purpose,role});
  sendEmail(email,purpose==='register'?'Verify your Marketplace account':'Password Reset OTP',otpHtml(otp)).catch(e=>console.log('mail err',e.message));
  return otp;
};

r.post('/register', async (req,res)=>{
  try{
    const {fullName,email,contact,dob,role,password}=req.body;
    if(!/^[0-9]{8}$/.test(dob||'')) return res.status(400).json({msg:'DOB must be 8 digits (DDMMYYYY)'});
    const ex=await User.findOne({email,role});
    if(ex&&ex.isVerified) return res.status(400).json({msg:'This email already registered for this role'});
    if(ex&&!ex.isVerified){ await newOtp(email,'register',role); return res.json({msg:'Account already exists but not verified. New OTP sent to email',resend:true}); }
    const uid=makeUid(role,fullName,dob);
    await User.create({fullName,email,contact,dob,role,password:await bcrypt.hash(password,10),uniqueId:uid,isVerified:false});
    await newOtp(email,'register',role);
    res.json({msg:'Registered! OTP sent to email',uniqueId:uid});
  }catch(e){ res.status(400).json({msg:e.message}); }
});

r.post('/verify-register', async (req,res)=>{
  try{
    const {email,otp,role}=req.body;
    const q={email,otp,purpose:'register'}; if(role) q.role=role;
    const rec=await Otp.findOne(q);
    if(!rec) return res.status(400).json({msg:'Invalid or expired OTP'});
    const u=await User.findOne({email,role:rec.role});
    if(!u) return res.status(400).json({msg:'User not found'});
    u.isVerified=true; await u.save();
    await Otp.deleteMany({email,purpose:'register',role:rec.role});
    res.json({msg:'Account verified successfully!',uniqueId:u.uniqueId,email:u.email,role:u.role,fullName:u.fullName});
  }catch(e){ res.status(400).json({msg:e.message}); }
});

r.post('/resend-verification', async (req,res)=>{
  try{
    const {email,role}=req.body;
    const q={email}; if(role) q.role=role;
    const u=await User.findOne(q);
    if(!u) return res.status(400).json({msg:"This email doesn't exist, plz register first"});
    if(u.isVerified) return res.status(400).json({msg:'Already verified, please login'});
    await newOtp(email,'register',u.role);
    res.json({msg:'New OTP sent to email'});
  }catch(e){ res.status(400).json({msg:e.message}); }
});

r.post('/login', async (req,res)=>{
  try{
    const {email,password,role}=req.body;
    const q=(email||"").trim();
    const u=await User.findOne({role,$or:[{email:q},{uniqueId:q.toUpperCase()}]});
    if(!u) return res.status(400).json({msg:"No account found with this Email / Unique ID for this role"});
    if(!u.isVerified) return res.status(400).json({msg:'Please verify OTP first'});
    const ok=await bcrypt.compare(password,u.password);
    if(!ok) return res.status(400).json({msg:'Invalid credentials'});
    const token=jwt.sign({id:u._id,role:u.role},process.env.JWT_SECRET,{expiresIn:'7d'});
    res.json({msg:'Login successful',token,user:{fullName:u.fullName,email:u.email,role:u.role,uniqueId:u.uniqueId}});
  }catch(e){ res.status(400).json({msg:e.message}); }
});

async function forgotHandler(req,res){
  try{
    const {email,role}=req.body;
    const q={email}; if(role) q.role=role;
    const u=await User.findOne(q);
    if(!u) return res.status(400).json({msg:"This email doesn't exist, plz register first"});
    await newOtp(email,'reset',u.role);
    res.json({msg:'OTP sent to email'});
  }catch(e){ res.status(400).json({msg:e.message}); }
}
r.post('/forgot-password', forgotHandler);
r.post('/send-otp', forgotHandler);

r.post('/reset-password', async (req,res)=>{
  try{
    const {email,otp,newPassword,role}=req.body;
    const q={email,otp,purpose:'reset'}; if(role) q.role=role;
    const rec=await Otp.findOne(q);
    if(!rec) return res.status(400).json({msg:'Invalid or expired OTP'});
    const u=await User.findOne({email,role:rec.role});
    if(!u) return res.status(400).json({msg:'User not found'});
    if(await bcrypt.compare(newPassword,u.password)) return res.status(400).json({msg:'This is your current password. Please enter a different password'});
    u.password=await bcrypt.hash(newPassword,10); await u.save();
    await Otp.deleteMany({email,purpose:'reset',role:rec.role});
    res.json({msg:'Password reset successful!'});
  }catch(e){ res.status(400).json({msg:e.message}); }
});

module.exports=r;
