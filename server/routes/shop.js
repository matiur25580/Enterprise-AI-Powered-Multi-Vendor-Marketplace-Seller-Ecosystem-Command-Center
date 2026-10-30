const r=require('express').Router();
const Product=require('../models/Product'), Order=require('../models/Order'),
      User=require('../models/User'), Payout=require('../models/Payout'),
      Review=require('../models/Review'), Coupon=require('../models/Coupon'), Notification=require('../models/Notification'), Deal=require('../models/Deal'), Announcement=require('../models/Announcement'), Wallet=require('../models/Wallet'), Return=require('../models/Return'), KYC=require('../models/KYC'), Config=require('../models/Config'), Referral=require('../models/Referral'), Wishlist=require('../models/Wishlist');
const {protect,allow}=require('../middleware/auth');
const notify=async(userId,title,body)=>{ if(!userId) return; try{ await Notification.create({userId,title,body}); }catch(e){} };
const sendMail=require('../utils/email');
const mail=async(uid,subject,html)=>{ try{ const u=await User.findById(uid).select('email fullName'); if(u&&u.email) await sendMail(u.email,subject,html.replace('{{name}}',u.fullName||'there')); }catch(e){} };
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
// ===== auto-repair routes =====
r.get('/notifications',protect,async(req,res)=>{ try{ res.json(await Notification.find({userId:req.user.id}).sort({createdAt:-1}).limit(30)); }catch(e){ res.status(500).json({msg:'Server error'}); } });
r.patch('/notifications/read-all',protect,async(req,res)=>{ await Notification.updateMany({userId:req.user.id},{read:true}); res.json({msg:'ok'}); });
r.post('/deals',protect,allow('seller','admin'),async(req,res)=>{ const p=await Product.findById(req.body.productId); if(!p) return res.status(404).json({msg:'Product not found'});
  if(req.user.role==='seller'&&String(p.sellerId)!==req.user.id) return res.status(403).json({msg:'Not your product'});
  const percent=+req.body.percent||0; const dealPrice=+(p.price*(1-percent/100)).toFixed(2);
  const d=await Deal.create({productId:p._id,productName:p.name,sellerId:req.user.role==='seller'?req.user.id:(req.body.sellerId||req.user.id),percent,dealPrice,endsAt:req.body.endsAt});
  try{ const _w=await Wishlist.find({productId:p._id}).select('userId');
    for(const _x of _w){ if(String(_x.userId)!==String(req.user.id)) notify(_x.userId,'\u26a1 Price drop!','"'+p.name+' in your wishlist is now '+percent+'% OFF!'); } }catch(_e){}
  res.json({msg:'Flash deal created!',d}); });
r.get('/deals/active',async(req,res)=>{ res.json(await Deal.find({active:true,endsAt:{$gt:new Date()}}).sort({endsAt:1}).limit(20)); });
r.get('/deals/mine',protect,allow('seller','admin'),async(req,res)=>{ const q=req.user.role==='admin'?{}:{sellerId:req.user.id}; res.json(await Deal.find(q).sort({createdAt:-1})); });
r.delete('/deals/:id',protect,allow('seller','admin'),async(req,res)=>{ const d=await Deal.findById(req.params.id); if(!d) return res.status(404).json({msg:'Not found'});
  if(req.user.role==='seller'&&String(d.sellerId)!==req.user.id) return res.status(403).json({msg:'Not allowed'});
  await d.deleteOne(); res.json({msg:'Deal deleted'}); });
r.get('/announcements/active',async(req,res)=>{ res.json(await Announcement.find({active:true}).sort({createdAt:-1}).limit(3)); });
r.get('/announcements/all',protect,allow('admin'),async(req,res)=>{ res.json(await Announcement.find().sort({createdAt:-1})); });
r.post('/announcements',protect,allow('admin'),async(req,res)=>{ const a=await Announcement.create(req.body); res.json({msg:'Announcement published!',a}); });
r.delete('/announcements/:id',protect,allow('admin'),async(req,res)=>{ await Announcement.findByIdAndDelete(req.params.id); res.json({msg:'Deleted'}); });
r.get('/recommendations',protect,async(req,res)=>{ const myOrders=await Order.find({buyerId:req.user.id,status:{$ne:'cancelled'}});
  const boughtNames=new Set(); myOrders.forEach(o=>o.items.forEach(i=>boughtNames.add(i.name)));
  const prods=await Product.find().limit(100); const nameCat={}; prods.forEach(p=>nameCat[p.name]=p.category);
  const catScore={}; myOrders.forEach(o=>o.items.forEach(i=>{ const c=nameCat[i.name]; if(c) catScore[c]=(catScore[c]||0)+i.qty; }));
  const allOrders=await Order.find({status:{$ne:'cancelled'}}).limit(300); const pop={};
  allOrders.forEach(o=>o.items.forEach(i=>pop[i.name]=(pop[i.name]||0)+i.qty));
  const scored=prods.filter(p=>!boughtNames.has(p.name)).map(p=>({p,score:(catScore[p.category]||0)*2+(pop[p.name]||0)}));
  scored.sort((a,b)=>b.score-a.score); res.json(scored.slice(0,8).map(x=>x.p)); });
r.get('/bought-together/:name',async(req,res)=>{ const name=decodeURIComponent(req.params.name);
  const os=await Order.find({'items.name':name}).limit(100); const freq={};
  os.forEach(o=>o.items.forEach(i=>{ if(i.name!==name) freq[i.name]=(freq[i.name]||0)+1; }));
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);
  res.json(await Product.find({name:{$in:top}})); });
r.get('/product-stats',async(req,res)=>{ const os=await Order.find({status:{$ne:'cancelled'}}).limit(500); const m={};
  os.forEach(o=>o.items.forEach(i=>m[i.name]=(m[i.name]||0)+i.qty)); res.json(m); });
r.get('/admin/activity',protect,allow('admin'),async(req,res)=>{ const [us,ps,os,rs]=await Promise.all([
  User.find().sort({createdAt:-1}).limit(5).select('fullName role createdAt'),Product.find().sort({createdAt:-1}).limit(5).select('name createdAt'),
  Order.find().sort({createdAt:-1}).limit(5).select('trackingId total status createdAt'),Review.find().sort({createdAt:-1}).limit(5).select('productName rating createdAt')]);
  const feed=[...us.map(u=>({icon:'\u{1F464}',text:u.fullName+' registered as '+u.role,at:u.createdAt})),
    ...ps.map(p=>({icon:'\u{1F4E6}',text:'Product "'+p.name+'" added',at:p.createdAt})),
    ...os.map(o=>({icon:'\u{1F9FE}',text:'Order '+o.trackingId+' \u2014 \u09f3'+o.total+' ('+o.status+')',at:o.createdAt})),
    ...rs.map(x=>({icon:'\u2B50',text:x.rating+'\u2605 review on "'+x.productName+'"',at:x.createdAt}))];
  feed.sort((a,b)=>new Date(b.at)-new Date(a.at)); res.json(feed.slice(0,20)); });
r.patch('/products/:id/feature',protect,allow('admin'),async(req,res)=>{ const p=await Product.findById(req.params.id);
  if(!p) return res.status(404).json({msg:'Not found'}); p.featured=!p.featured; await p.save();
  res.json({msg:p.featured?'Marked as featured':'Removed from featured'}); });
r.get('/wallet',protect,async(req,res)=>{ let w=await Wallet.findOne({userId:req.user.id}); if(!w) w={balance:0,txns:[]}; res.json(w); });
r.post('/returns',protect,async(req,res)=>{ const o=await Order.findById(req.body.orderId);
  if(!o||String(o.buyerId)!==req.user.id) return res.status(403).json({msg:'Not allowed'});
  if(o.status!=='delivered') return res.status(400).json({msg:'Only delivered orders can be returned'});
  const ex=await Return.findOne({orderId:o._id}); if(ex) return res.status(400).json({msg:'Return already requested'});
  const rt=await Return.create({orderId:o._id,trackingId:o.trackingId,buyerId:o.buyerId,sellerId:o.sellerId,reason:req.body.reason});
  if(o.sellerId) notify(o.sellerId,'\u21A9\uFE0F Return requested',o.trackingId+' \u2014 '+req.body.reason);
  res.json({msg:'Return request submitted!',rt}); });
r.get('/returns',protect,async(req,res)=>{ const q=req.user.role==='buyer'?{buyerId:req.user.id}:req.user.role==='seller'?{sellerId:req.user.id}:{};
  res.json(await Return.find(q).sort({createdAt:-1}).limit(100)); });
r.patch('/returns/:id',protect,allow('seller','admin'),async(req,res)=>{ const rt=await Return.findById(req.params.id); if(!rt) return res.status(404).json({msg:'Not found'});
  rt.status=req.body.status; await rt.save();
  if(req.body.status==='approved'){ await Order.findByIdAndUpdate(rt.orderId,{refundStatus:'pending'}); notify(rt.buyerId,'\u21A9\uFE0F Return approved','Refund for '+rt.trackingId+' will be processed'); }
  else notify(rt.buyerId,'\u21A9\uFE0F Return update','Return for '+rt.trackingId+': '+req.body.status);
  res.json({msg:'Return '+req.body.status}); });
r.get('/kyc',protect,async(req,res)=>{ res.json(await KYC.findOne({userId:req.user.id})||{}); });
r.post('/kyc',protect,async(req,res)=>{ const k=await KYC.findOneAndUpdate({userId:req.user.id},
  {userId:req.user.id,shopName:req.body.shopName,shopDesc:req.body.shopDesc,kycStatus:'pending'},{upsert:true,new:true});
  res.json({msg:'Shop submitted for verification!',k}); });
r.get('/admin/kyc',protect,allow('admin'),async(req,res)=>{ res.json(await KYC.find().sort({createdAt:-1}).limit(100)); });
r.patch('/admin/kyc/:id',protect,allow('admin'),async(req,res)=>{ const k=await KYC.findByIdAndUpdate(req.params.id,{kycStatus:req.body.status},{new:true});
  notify(k.userId,req.body.status==='verified'?'\u2705 Shop verified!':'\u274C KYC update','Your shop KYC status: '+req.body.status);
  res.json({msg:'KYC '+req.body.status}); });
r.get('/seller-badges',async(req,res)=>{ const ks=await KYC.find({kycStatus:'verified'}).select('userId');
  const m={}; ks.forEach(k=>m[String(k.userId)]='verified'); res.json(m); });
r.get('/sellers/:id',async(req,res)=>{ const seller=await User.findById(req.params.id).select('fullName email createdAt');
  if(!seller) return res.status(404).json({msg:'Not found'});
  const products=await Product.find({sellerId:req.params.id});
  const revs=await Review.find({productId:{$in:products.map(p=>p._id)}});
  const orders=await Order.find({sellerId:req.params.id,status:{$ne:'cancelled'}});
  res.json({seller,products,rating:revs.length?+(revs.reduce((a,b)=>a+b.rating,0)/revs.length).toFixed(1):0,reviews:revs.length,sales:orders.length}); });
r.get('/loyalty',protect,async(req,res)=>{ const os=await Order.find({buyerId:req.user.id,status:'delivered'});
  const spent=os.reduce((a,o)=>a+ +o.total,0);
  const t=spent>=50000?{name:'Gold',rate:2,icon:'\u{1F947}'}:spent>=10000?{name:'Silver',rate:1.5,icon:'\u{1F948}'}:{name:'Bronze',rate:1,icon:'\u{1F949}'};
  res.json({spent:+spent.toFixed(2),tier:t.name,rate:t.rate,icon:t.icon}); });
r.get('/config',async(req,res)=>{ let c=await Config.findOne(); if(!c) c=await Config.create({}); res.json(c); });
r.patch('/admin/config',protect,allow('admin'),async(req,res)=>{ const c=await Config.findOneAndUpdate({},
  {commissionPct:+req.body.commissionPct||10,cashbackPct:+req.body.cashbackPct||1,referralBonus:+req.body.referralBonus||50},
  {upsert:true,new:true}); res.json({msg:'Settings saved!',c}); });
r.get('/referral/mine',protect,async(req,res)=>{ let m=await Referral.findOne({userId:req.user.id});
  if(!m){ m=await Referral.create({userId:req.user.id,code:'REF'+Math.random().toString(36).slice(2,8).toUpperCase()}); }
  const used=await Referral.countDocuments({referredBy:req.user.id});
  const cfg=await Config.findOne(); res.json({code:m.code,referredBy:m.referredBy,used,bonus:cfg?cfg.referralBonus:50}); });
r.post('/referral/apply',protect,async(req,res)=>{ const code=(req.body.code||'').trim().toUpperCase();
  const ref=await Referral.findOne({code}); if(!ref) return res.status(400).json({msg:'Invalid referral code'});
  if(String(ref.userId)===req.user.id) return res.status(400).json({msg:'Cannot use your own code'});
  let mine=await Referral.findOne({userId:req.user.id});
  if(!mine) mine=await Referral.create({userId:req.user.id,code:'REF'+Math.random().toString(36).slice(2,8).toUpperCase()});
  if(mine.referredBy) return res.status(400).json({msg:'Already used a referral code'});
  const cfg=await Config.findOne(); const bonus=cfg?+cfg.referralBonus:50;
  const credit=async(uid)=>{ let w=await Wallet.findOne({userId:uid}); if(!w) w=await Wallet.create({userId:uid,balance:0,txns:[]});
    w.balance=+(w.balance+bonus).toFixed(2); w.txns.push({type:'earn',amount:bonus,note:'Referral bonus'}); await w.save(); };
  await credit(req.user.id); await credit(ref.userId);
  mine.referredBy=ref.userId; await mine.save();
  notify(ref.userId,'\u{1F381} Referral bonus!','Someone used your code \u2014 \u09f3'+bonus+' added to your wallet');
  res.json({msg:'\u{1F389} \u09f3'+bonus+' bonus added to both wallets!'}); });
module.exports=r;
