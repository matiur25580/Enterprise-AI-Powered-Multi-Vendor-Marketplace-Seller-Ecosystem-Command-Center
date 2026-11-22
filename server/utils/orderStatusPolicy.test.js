const test=require('node:test');
const assert=require('node:assert/strict');
const {isOrderStatusAllowed}=require('./orderStatusPolicy');

test('seller cannot mark an order delivered or cancelled',()=>{
  assert.equal(isOrderStatusAllowed('seller','processing'),true);
  assert.equal(isOrderStatusAllowed('seller','shipped'),true);
  assert.equal(isOrderStatusAllowed('seller','delivered'),false);
  assert.equal(isOrderStatusAllowed('seller','cancelled'),false);
});

test('logistics and admin can record delivery and cancellation',()=>{
  for(const role of ['logistics','admin']){
    assert.equal(isOrderStatusAllowed(role,'delivered'),true);
    assert.equal(isOrderStatusAllowed(role,'cancelled'),true);
  }
});

test('unknown roles and invalid statuses are rejected',()=>{
  assert.equal(isOrderStatusAllowed('buyer','delivered'),false);
  assert.equal(isOrderStatusAllowed('finance','shipped'),false);
  assert.equal(isOrderStatusAllowed('seller','unknown'),false);
});
