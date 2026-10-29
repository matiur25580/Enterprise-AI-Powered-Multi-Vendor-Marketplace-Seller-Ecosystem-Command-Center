const r=require('express').Router(); const Product=require('../models/Product'); const Order=require('../models/Order'); const {protect,allow}=require('../middleware/auth');
r.get('/products',async(req,res)=>res.json(await Product.find().limit(50)));
r.post('/products',protect,allow('seller','admin'),async(req,res)=>{ const p=await Product.create({...req.body,sellerId:req.user.id}); res.json({msg:'Product added successfully!',p}); });
r.delete('/products/:id',protect,allow('seller','admin'),async(req,res)=>{ await Product.findByIdAndDelete(req.params.id); res.json({msg:'Product deleted successfully!'}); });
r.post('/orders',protect,async(req,res)=>{ const {items,sellerId}=req.body; const total=items.reduce((s,i)=>s+i.price*i.qty,0);
  const fraudFlag=items.reduce((s,i)=>s+i.qty,0)>=10; const commission=+(total*0.1).toFixed(2);
  for(const it of items){ await Product.findOneAndUpdate({name:it.name},{$inc:{stock:-it.qty}}); }
  const o=await Order.create({buyerId:req.user.id,sellerId,items,total,commission,fraudFlag}); res.json({msg:'Order placed successfully!',o}); });
r.get('/orders',protect,async(req,res)=>{ const q=req.user.role==='buyer'?{buyerId:req.user.id}:req.user.role==='seller'?{sellerId:req.user.id}:{}; res.json(await Order.find(q).sort({createdAt:-1}).limit(50)); });
r.patch('/orders/:id',protect,allow('logistics','admin','seller'),async(req,res)=>{ await Order.findByIdAndUpdate(req.params.id,{status:req.body.status}); res.json({msg:'Order status updated to '+req.body.status}); });
r.get('/finance',protect,allow('finance','admin'),async(req,res)=>{ const os=await Order.find(); const gmv=os.reduce((s,o)=>s+o.total,0); const com=os.reduce((s,o)=>s+o.commission,0); res.json({gmv,commission:com,orders:os.length,fraud:os.filter(o=>o.fraudFlag).length}); });
r.get('/seed',async(req,res)=>{ if(await Product.countDocuments()>0) return res.json({msg:'already seeded'});
  const demo=[['Wireless Headphone',2500,'Electronics'],['Cotton Panjabi',1800,'Fashion'],['Smart Watch',4200,'Electronics'],['Leather Wallet',950,'Fashion'],['Rice Cooker',3100,'Home'],['Running Shoes',2800,'Fashion']];
  await Product.insertMany(demo.map(d=>({name:d[0],price:d[1],category:d[2],stock:50}))); res.json({msg:'Seeded 6 products!'}); });
module.exports=r;
