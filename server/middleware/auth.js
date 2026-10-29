const jwt = require('jsonwebtoken');
exports.protect = (req,res,next)=>{ const h=req.headers.authorization; if(!h||!h.startsWith('Bearer ')) return res.status(401).json({msg:'No token'}); try{ req.user=jwt.verify(h.split(' ')[1],process.env.JWT_SECRET); next(); }catch{ return res.status(401).json({msg:'Invalid token'}); } };
exports.allow = (...roles)=>(req,res,next)=>{ if(!roles.includes(req.user.role)) return res.status(403).json({msg:'Access denied'}); next(); };
