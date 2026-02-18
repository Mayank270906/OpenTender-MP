import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTender } from '../hooks/useContract';
import { showToast } from '../components/Toast';
import { useWallet } from '../context/WalletContext';

export default function CreateTender() {
    const navigate = useNavigate();
    const { signer } = useWallet();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [minBid, setMinBid] = useState('');
    const [biddingDeadline, setBiddingDeadline] = useState('');
    const [revealDeadline, setRevealDeadline] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleCreate(e) {
        e.preventDefault();

        if (!title || !description || !minBid || !biddingDeadline || !revealDeadline) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        const biddingEnd = new Date(biddingDeadline).getTime();
        const revealEnd = new Date(revealDeadline).getTime();
        const nowMs = Date.now();

        if (biddingEnd <= nowMs) {
            showToast('Bidding deadline must be in the future', 'error');
            return;
        }
        if (revealEnd <= biddingEnd) {
            showToast('Reveal deadline must be after bidding deadline', 'error');
            return;
        }

        const biddingDurationSec = Math.floor((biddingEnd - nowMs) / 1000);
        const revealDurationSec = Math.floor((revealEnd - biddingEnd) / 1000);

        try {
            setLoading(true);
            await createTender(
                signer,
                title,
                description,
                ipfsHash || '',
                biddingDurationSec,
                revealDurationSec,
                Number(minBid)
            );
            showToast('Tender created successfully!');
            navigate('/');
        } catch (err) {
            console.error('Create tender failed:', err);
            showToast(err.reason || err.message || 'Transaction failed', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Create New Tender</h1>
                    <p className="page-subtitle">Launch a new blockchain-secured tender</p>
                </div>
            </div>

            <form className="card form-card" onSubmit={handleCreate}>
                <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Road Construction Project"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea
                        className="form-input form-textarea"
                        placeholder="Describe the tender requirements..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">IPFS Document Hash (optional)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Qm..."
                        value={ipfsHash}
                        onChange={e => setIpfsHash(e.target.value)}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Minimum Bid (wei) *</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="1000"
                            value={minBid}
                            onChange={e => setMinBid(e.target.value)}
                            min="1"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Bidding Deadline *</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={biddingDeadline}
                            onChange={e => setBiddingDeadline(e.target.value)}
                        />
                        <span className="form-hint">When bidding closes</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Reveal Deadline *</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={revealDeadline}
                            onChange={e => setRevealDeadline(e.target.value)}
                        />
                        <span className="form-hint">When bid reveals must be completed</span>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <><span className="spinner-sm"></span> Creating...</>
                        ) : (
                            <><span>+</span> Create Tender</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
