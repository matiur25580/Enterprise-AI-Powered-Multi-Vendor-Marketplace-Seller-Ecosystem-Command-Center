// Creates the audit fields that identify who confirmed a refund settlement and when it was recorded.
function buildRefundSettlement(reference, actorId, now = new Date()) {
  if (typeof reference !== 'string' || reference.trim().length < 4 || reference.trim().length > 120) {
    throw new Error('A settlement reference between 4 and 120 characters is required.');
  }
  if (typeof actorId !== 'string' || !actorId.trim()) throw new Error('A valid finance actor is required.');
  return {
    refundSettlementReference: reference.trim(),
    refundSettledBy: actorId,
    refundSettledAt: now,
  };
}
module.exports = { buildRefundSettlement };
