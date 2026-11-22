const ROLE_STATUSES = {
  seller: ['processing', 'shipped'],
  logistics: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
  admin: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
};

function isOrderStatusAllowed(role, status) {
  return Boolean(ROLE_STATUSES[role]?.includes(status));
}

module.exports = { isOrderStatusAllowed };
