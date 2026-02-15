let mockBids = {};

export function storeCommitment(tenderId, wallet, hash) {
  if (!mockBids[tenderId]) mockBids[tenderId] = {};
  mockBids[tenderId][wallet] = hash;
}

export function getCommitment(tenderId, wallet) {
  return mockBids[tenderId]?.[wallet] || null;
}
