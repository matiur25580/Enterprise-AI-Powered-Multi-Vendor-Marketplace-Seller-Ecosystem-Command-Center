const express=require('express'); const cors=require('cors'); const mongoose=require('mongoose'); require('dotenv').config();
const app=express(); app.use(cors()); app.use(express.json());
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('MongoDB Connected')).catch(e=>console.log('DB err',e.message));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/auth', require('./routes/auth'));
app.get('/api/health',(req,res)=>res.json({status:'Marketplace API Running'}));
const PORT=process.env.PORT||5000; app.listen(PORT,()=>console.log('Server on '+PORT));
