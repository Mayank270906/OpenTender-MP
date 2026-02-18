import ABI from './OpenTenderABI.json';

export const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9';
export const CONTRACT_ABI = ABI.abi;
