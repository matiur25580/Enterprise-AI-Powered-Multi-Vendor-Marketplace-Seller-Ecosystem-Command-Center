const r=require('express').Router();
const Product=require('../models/Product'), Order=require('../models/Order'),
      User=require('../models/User'), Payout=require('../models/Payout'),
      Review=require('../models/Review'), Coupon=require('../models/Coupon');
const {protect,allow}=require('../middleware/auth');
// products
r.get('/products',async(req,res)=>res.json(await Product.find().sort({createdAt:-1}).limit(100)));
r.get('/products/mine',protect,allow('seller','admin'),async(req,res)=>{ const q=req.user.role==='admin'?{}:{sellerId:req.user.id}; res.json(await Product.find(q).sort({createdAt:-1})); });
r.post('/products',protect,allow('seller','admin'),async(req,res)=>{ const p=await Product.create({...req.body,sellerId:req.user.id}); res.json({msg:'Product added successfully!',p}); });
r.put('/products/:id',protect,allow('seller','admin'),async(req,res)=>{ const p=await Product.findById(req.params.id); if(!p) return res.status(404).json({msg:'Not found'});
  if(req.user.role==='seller'&&String(p.sellerId)!==req.user.id) return res.status(403).json({msg:'Not your product'});
  Object.assign(p,req.body); await p.save(); res.json({msg:'Product updated successfully!',p}); });
r.delete('/products/:id',protect,allow('seller','admin'),async(req,res)=>{ const p=await Product.findById(req.params.id); if(!p) return res.status(404).json({msg:'Not found'});
  if(req.user.role==='seller'&&String(p.sellerId)!==req.user.id) return res.status(403).json({msg:'Not your product'});
  await p.deleteOne(); res.json({msg:'Product deleted successfully!'}); });
// orders
r.post('/orders',protect,async(req,res)=>{ const {items,sellerId,warehouse,couponCode}=req.body;
  const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0);
  let discount=0,appliedCode=null;
  if(couponCode){ const cp=await Coupon.findOne({code:String(couponCode).toUpperCase(),active:true});
    if(cp&&subtotal>=cp.minOrder&&(!cp.sellerId||String(cp.sellerId)===String(sellerId))){ discount=+((subtotal*cp.percent)/100).toFixed(2); appliedCode=cp.code; } }
  const total=+(subtotal-discount).toFixed(2);
  const fraudFlag=items.reduce((s,i)=>s+i.qty,0)>=10; const commission=+(total*0.1).toFixed(2);
  const trackingId='TRK'+Date.now().toString(36).toUpperCase();
  for(const it of items){ await Product.findOneAndUpdate({name:it.name},{$inc:{stock:-it.qty}}); }
  const o=await Order.create({buyerId:req.user.id,sellerId,items,subtotal,discount,couponCode:appliedCode,total,commission,fraudFlag,trackingId,warehouse:warehouse||'WH-Dhaka',refundStatus:'none'});
  res.json({msg:'Order placed successfully!'+(appliedCode?' Coupon '+appliedCode+' applied!':''),o}); });
r.get('/orders',protect,async(req,res)=>{ const q=req.user.role==='buyer'?{buyerId:req.user.id}:req.user.role==='seller'?{sellerId:req.user.id}:{}; res.json(await Order.find(q).sort({createdAt:-1}).limit(100)); });
r.patch('/orders/:id',protect,allow('logistics','admin','seller'),async(req,res)=>{ const u={status:req.body.status}; if(req.body.deliveryNote) u.deliveryNote=req.body.deliveryNote;
  await Order.findByIdAndUpdate(req.params.id,u); res.json({msg:'Order status updated to '+req.body.status}); });
r.patch('/orders/:id/cancel',protect,async(req,res)=>{ const o=await Order.findById(req.params.id);
  if(!o||String(o.buyerId)!==req.user.id) return res.status(403).json({msg:'Not allowed'});
  if(o.status!=='placed') return res.status(400).json({msg:'Cannot cancel at this stage'});
  o.status='cancelled'; o.refundStatus='pending'; await o.save(); res.json({msg:'Order cancelled. Refund will be processed.'}); });
// logistics
r.get('/logistics/shipments',protect,allow('logistics','admin'),async(req,res)=>res.json(await Order.find({status:{$in:['placed','shipped']}}).populate('buyerId','fullName').sort({createdAt:-1}).limit(100)));
// finance
r.get('/finance',protect,allow('finance','admin'),async(req,res)=>{ const os=await Order.find({status:{$ne:'cancelled'}}); res.json({gmv:os.reduce((s,o)=>s+o.total,0),commission:os.reduce((s,o)=>s+(o.commission||0),0),orders:os.length,fraud:os.filter(o=>o.fraudFlag).length,discount:os.reduce((s,o)=>s+(o.discount||0),0)}); });
r.get('/finance/payouts',protect,allow('finance','admin'),async(req,res)=>{ const orders=await Order.find({status:{$ne:'cancelled'}}).populate('sellerId','fullName email'); const map={};
  orders.forEach(o=>{ const sid=String(o.sellerId?._id||o.sellerId); if(!map[sid]) map[sid]={sellerId:sid,name:o.sellerId?.fullName||'Unknown',email:o.sellerId?.email||'',gross:0,commission:0,orders:0};
    map[sid].gross+=o.total; map[sid].commission+=o.commission||0; map[sid].orders++; });
  const paid=await Payout.find(); const pm={}; paid.forEach(p=>pm[String(p.sellerId)]=(pm[String(p.sellerId)]||0)+p.amount);
  res.json(Object.values(map).map(m=>({...m,net:+(m.gross-m.commission).toFixed(2),paid:pm[m.sellerId]||0,pending:+((m.gross-m.commission)-(pm[m.sellerId]||0)).toFixed(2)}))); });
r.post('/finance/payouts/pay',protect,allow('finance','admin'),async(req,res)=>{ const p=await Payout.create({sellerId:req.body.sellerId,amount:req.body.amount,period:new Date().toISOString().slice(0,7)}); res.json({msg:'Payout recorded successfully!',p}); });
r.get('/finance/refunds',protect,allow('finance','admin'),async(req,res)=>res.json(await Order.find({status:'cancelled'}).populate('buyerId','fullName email').sort({createdAt:-1}).limit(100)));
r.patch('/finance/refunds/:id',protect,allow('finance','admin'),async(req,res)=>{ await Order.findByIdAndUpdate(req.params.id,{refundStatus:'done'}); res.json({msg:'Refund marked as done'}); });
// reviews
r.get('/ratings',async(req,res)=>{ const rs=await Review.aggregate([{$group:{_id:'$productId',avg:{$avg:'$rating'},count:{$sum:1}}}]); const m={}; rs.forEach(x=>m[x._id]={avg:+x.avg.toFixed(1),count:x.count}); res.json(m); });
r.get('/reviews/:productId',async(req,res)=>res.json(await Review.find({productId:req.params.productId}).sort({createdAt:-1}).limit(50)));
r.post('/reviews',protect,async(req,res)=>{ const {productId,rating,comment}=req.body; const prod=await Product.findById(productId); if(!prod) return res.status(404).json({msg:'Product not found'});
  const bought=await Order.findOne({buyerId:req.user.id,status:'delivered','items.name':prod.name});
  if(!bought) return res.status(400).json({msg:'You can review only after delivery'});
  const me=await User.findById(req.user.id);
  const rv=await Review.create({productId,productName:prod.name,buyerId:req.user.id,buyerName:me.fullName,rating,comment});
  res.json({msg:'Review submitted! Thank you.',rv}); });
r.get('/reviews/mine/seller',protect,allow('seller','admin'),async(req,res)=>{ const ps=await Product.find(req.user.role==='admin'?{}:{sellerId:req.user.id}).select('_id'); const ids=ps.map(p=>p._id);
  res.json(await Review.find({productId:{$in:ids}}).sort({createdAt:-1}).limit(100)); });
r.get('/reviews/all/list',protect,allow('admin'),async(req,res)=>res.json(await Review.find().sort({createdAt:-1}).limit(100)));
r.delete('/reviews/:id',protect,async(req,res)=>{ const rv=await Review.findById(req.params.id); if(!rv) return res.status(404).json({msg:'Not found'});
  if(req.user.role!=='admin'){ const prod=await Product.findById(rv.productId); if(!prod||String(prod.sellerId)!==req.user.id) return res.status(403).json({msg:'Not allowed'}); }
  await rv.deleteOne(); res.json({msg:'Review deleted'}); });
// coupons
r.post('/coupons',protect,allow('seller','admin'),async(req,res)=>{ const {code,percent,minOrder}=req.body;
  const c=await Coupon.create({code:String(code).toUpperCase(),percent:+percent,minOrder:+minOrder||0,sellerId:req.user.role==='admin'?null:req.user.id});
  res.json({msg:'Coupon created!',c}); });
r.get('/coupons/mine',protect,allow('seller','admin'),async(req,res)=>{ const q=req.user.role==='admin'?{}:{sellerId:req.user.id}; res.json(await Coupon.find(q).sort({createdAt:-1})); });
r.get('/coupons/active',async(req,res)=>res.json(await Coupon.find({active:true}).select('code percent minOrder sellerId')));
r.get('/coupons/all/list',protect,allow('admin'),async(req,res)=>res.json(await Coupon.find().sort({createdAt:-1})));
r.patch('/coupons/:id/toggle',protect,allow('seller','admin'),async(req,res)=>{ const c=await Coupon.findById(req.params.id); if(!c) return res.status(404).json({msg:'Not found'});
  if(req.user.role==='seller'&&String(c.sellerId)!==req.user.id) return res.status(403).json({msg:'Not allowed'});
  c.active=!c.active; await c.save(); res.json({msg:'Coupon '+(c.active?'activated':'deactivated')}); });
r.delete('/coupons/:id',protect,allow('seller','admin'),async(req,res)=>{ const c=await Coupon.findById(req.params.id); if(!c) return res.status(404).json({msg:'Not found'});
  if(req.user.role==='seller'&&String(c.sellerId)!==req.user.id) return res.status(403).json({msg:'Not allowed'});
  await c.deleteOne(); res.json({msg:'Coupon deleted'}); });
// admin
r.get('/admin/stats',protect,allow('admin'),async(req,res)=>{ const [users,products,orders,reviews,coupons]=await Promise.all([User.find().select('-password'),Product.find(),Order.find(),Review.find(),Coupon.find()]);
  const byRole={}; users.forEach(u=>byRole[u.role]=(byRole[u.role]||0)+1); const byStatus={}; orders.forEach(o=>byStatus[o.status]=(byStatus[o.status]||0)+1);
  res.json({users:users.length,byRole,products:products.length,orders:orders.length,byStatus,reviews:reviews.length,coupons:coupons.length,
    gmv:orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0), commission:orders.reduce((s,o)=>s+(o.commission||0),0), fraud:orders.filter(o=>o.fraudFlag).length}); });
r.get('/admin/users',protect,allow('admin'),async(req,res)=>res.json(await User.find().select('-password').sort({createdAt:-1}).limit(100)));
r.patch('/admin/users/:id',protect,allow('admin'),async(req,res)=>{ const u=await User.findById(req.params.id); if(!u) return res.status(404).json({msg:'Not found'});
  u.isBlocked=!u.isBlocked; await u.save(); res.json({msg:u.isBlocked?'User blocked':'User unblocked'}); });
// seed
r.get('/seed',async(req,res)=>{ if(await Product.countDocuments()>0) return res.json({msg:'already seeded'});
  const demo=[['Wireless Headphone',2500,'Electronics'],['Cotton Panjabi',1800,'Fashion'],['Smart Watch',4200,'Electronics'],['Leather Wallet',950,'Fashion'],['Rice Cooker',3100,'Home'],['Running Shoes',2800,'Fashion']];
  await Product.insertMany(demo.map(d=>({name:d[0],price:d[1],category:d[2],stock:50}))); res.json({msg:'Seeded 6 products!'}); });
module.exports=r;
