import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contractConfig';

function getContract(signerOrProvider) {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function fetchAllTenders(signerOrProvider) {
    const contract = getContract(signerOrProvider);

    const count = await contract.tenderCount();
    const total = Number(count);
    const tenders = [];

    for (let i = 1; i <= total; i++) {
        const t = await contract.tenders(i);
        const bidCount = await contract.getBidsCount(i);
        tenders.push({
            id: Number(t.id),
            creator: t.creator,
            title: t.title,
            description: t.description,
            ipfsHash: t.ipfsHash,
            deadline: Number(t.deadline),
            revealDeadline: Number(t.revealDeadline),
            minBid: Number(t.minBid),
            status: Number(t.status),
            createdAt: Number(t.createdAt),
            bidders: Number(bidCount),
        });
    }

    return tenders;
}

export async function fetchTender(signerOrProvider, id) {
    const contract = getContract(signerOrProvider);

    const t = await contract.tenders(id);
    const bidCount = await contract.getBidsCount(id);

    return {
        id: Number(t.id),
        creator: t.creator,
        title: t.title,
        description: t.description,
        ipfsHash: t.ipfsHash,
        deadline: Number(t.deadline),
        revealDeadline: Number(t.revealDeadline),
        minBid: Number(t.minBid),
        status: Number(t.status),
        createdAt: Number(t.createdAt),
        bidders: Number(bidCount),
    };
}

export async function createTender(signer, title, description, ipfsHash, biddingDurationSec, revealDurationSec, minBid) {
    const contract = getContract(signer);

    const tx = await contract.createTender(
        title,
        description,
        ipfsHash,
        biddingDurationSec,
        revealDurationSec,
        minBid
    );
    const receipt = await tx.wait();
    return { success: true, hash: tx.hash, receipt };
}

export async function submitBid(signer, tenderId, commitmentHash) {
    const contract = getContract(signer);

    const tx = await contract.submitBid(tenderId, commitmentHash);
    const receipt = await tx.wait();
    return { success: true, hash: tx.hash, receipt };
}

export async function revealBid(signer, tenderId, amount, secret) {
    const contract = getContract(signer);

    const tx = await contract.revealBid(tenderId, amount, secret);
    const receipt = await tx.wait();
    return { success: true, hash: tx.hash, receipt };
}

export async function closeTender(signer, tenderId) {
    const contract = getContract(signer);

    const tx = await contract.closeTender(tenderId);
    const receipt = await tx.wait();
    return { success: true, hash: tx.hash, receipt };
}

export async function cancelTender(signer, tenderId) {
    const contract = getContract(signer);

    const tx = await contract.cancelTender(tenderId);
    const receipt = await tx.wait();
    return { success: true, hash: tx.hash, receipt };
}

export async function getWinner(signerOrProvider, tenderId) {
    const contract = getContract(signerOrProvider);

    const w = await contract.winners(tenderId);
    return {
        bidder: w.bidder,
        amount: Number(w.amount),
        selectedAt: Number(w.selectedAt),
    };
}

