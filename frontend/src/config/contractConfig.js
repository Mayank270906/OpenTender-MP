import ABI from './OpenTenderABI.json';

export const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const CONTRACT_ABI = ABI;
