const test=require('node:test');
const assert=require('node:assert/strict');
const {publicRegistrationAllowed,normalizeOrderItems,calculatePayoutAmount}=require('./marketplacePolicy');

test('public signup defaults to buyer and rejects privileged roles',()=>{
  assert.equal(publicRegistrationAllowed(undefined),true);
  assert.equal(publicRegistrationAllowed('buyer'),true);
  for(const role of ['seller','admin','finance','logistics']) assert.equal(publicRegistrationAllowed(role),false);
});

test('checkout derives prices and seller from catalog products',()=>{
  const products=[
    {_id:'p1',name:'Keyboard',price:100,stock:5,sellerId:'seller-1',warehouse:'WH-1'},
    {_id:'p2',name:'Mouse',price:50,stock:8,sellerId:'seller-1',warehouse:'WH-1'}
  ];
  const cart=normalizeOrderItems([{productId:'p1',name:'Keyboard',price:1,qty:2},{productId:'p2',name:'Mouse',price:0.01,qty:1}],products);
  assert.equal(cart.subtotal,250);
  assert.equal(cart.sellerId,'seller-1');
  assert.deepEqual(cart.items.map(x=>x.price),[100,50]);
});

test('checkout rejects invalid quantities, missing products and insufficient stock',()=>{
  const products=[{_id:'p1',name:'Keyboard',price:100,stock:1,sellerId:'seller-1'}];
  assert.throws(()=>normalizeOrderItems([{productId:'p1',qty:2}],products),/Insufficient stock/);
  assert.throws(()=>normalizeOrderItems([{productId:'missing',qty:1}],products),/unavailable/);
  assert.throws(()=>normalizeOrderItems([{productId:'p1',qty:0}],products),/quantity/);
});

test('checkout rejects carts that mix sellers',()=>{
  const products=[
    {_id:'p1',name:'Keyboard',price:100,stock:5,sellerId:'seller-1'},
    {_id:'p2',name:'Mouse',price:50,stock:8,sellerId:'seller-2'}
  ];
  assert.throws(()=>normalizeOrderItems([{productId:'p1',qty:1},{productId:'p2',qty:1}],products),/one seller/);
});

test('checkout combines duplicate lines before stock validation',()=>{
  const products=[{_id:'p1',name:'Keyboard',price:100,stock:3,sellerId:'seller-1'}];
  const cart=normalizeOrderItems([{productId:'p1',qty:1},{productId:'p1',qty:2}],products);
  assert.equal(cart.items.length,1);
  assert.equal(cart.items[0].qty,3);
});

test('payout amount is derived from delivered-order net totals, not client input',()=>{
  assert.equal(calculatePayoutAmount([
    {total:1000,commission:100},
    {total:500,commission:50}
  ]),1350);
});

test('payout calculation rejects invalid amounts and never returns a negative net',()=>{
  assert.equal(calculatePayoutAmount([{total:10,commission:20}]),0);
  assert.throws(()=>calculatePayoutAmount([{total:NaN,commission:1}]),/valid non-negative/);
  assert.throws(()=>calculatePayoutAmount([{total:100,commission:-1}]),/valid non-negative/);
});
