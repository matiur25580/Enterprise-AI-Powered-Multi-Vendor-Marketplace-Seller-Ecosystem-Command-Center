// Public sign-up is intentionally limited to buyer accounts; privileged roles need controlled provisioning.
function publicRegistrationAllowed(role) {
  return !role || role === 'buyer';
}

function normalizeOrderItems(requestedItems, products) {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50) {
    throw new Error('Cart must contain between 1 and 50 items.');
  }
  const byId = new Map();
  for (const item of requestedItems) {
    const quantity = Number(item && item.qty);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('Each item must have a valid quantity.');
    }
    let product;
    if (item.productId) product = products.find(p => String(p._id) === String(item.productId));
    else if (typeof item.name === 'string') {
      const matches = products.filter(p => p.name === item.name);
      if (matches.length > 1) throw new Error('Product name is ambiguous; refresh the catalog and try again.');
      product = matches[0];
    }
    if (!product) throw new Error('One or more products are unavailable.');
    const key = String(product._id);
    const existing = byId.get(key);
    if (existing) existing.qty += quantity;
    else byId.set(key, { product, qty: quantity });
  }

  const normalized = [...byId.values()];
  for (const entry of normalized) {
    if (!Number.isFinite(Number(entry.product.price)) || Number(entry.product.price) < 0) {
      throw new Error('A product has an invalid price.');
    }
    if (!Number.isInteger(Number(entry.product.stock)) || Number(entry.product.stock) < entry.qty) {
      throw new Error('Insufficient stock for ' + entry.product.name + '.');
    }
  }
  const sellerIds = new Set(normalized.map(entry => entry.product.sellerId ? String(entry.product.sellerId) : ''));
  if (sellerIds.size > 1) throw new Error('A checkout can contain products from only one seller.');
  const items = normalized.map(({ product, qty }) => ({
    productId: String(product._id),
    name: product.name,
    price: Number(product.price),
    qty
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return { items, subtotal: +subtotal.toFixed(2), sellerId: normalized[0].product.sellerId || null, warehouse: normalized[0].product.warehouse || 'WH-Dhaka' };
}

function calculatePayoutAmount(orders) {
  const net = orders.reduce((sum, order) => {
    const total = Number(order.total);
    const commission = Number(order.commission || 0);
    if (!Number.isFinite(total) || !Number.isFinite(commission) || total < 0 || commission < 0) {
      throw new Error('Order payout values must be valid non-negative amounts.');
    }
    return sum + Math.max(0, total - commission);
  }, 0);
  return +net.toFixed(2);
}

module.exports = { publicRegistrationAllowed, normalizeOrderItems, calculatePayoutAmount };
