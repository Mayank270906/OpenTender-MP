
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchTender,
    submitBid,
    revealBid,
    closeTender,
    cancelTender,
    getWinner,
    getCompanyProfile,
    rateBidder
} from '../hooks/useContract';
import { generateSecretKey, generateCommitment } from '../utils/crypto';
import { getTimeLeft, formatTimestamp, getStatusLabel, getStatusColor } from '../utils/time';
import { showToast } from '../components/Toast';
import { useWallet } from '../context/WalletContext';
import { CATEGORIES } from '../utils/categories';

export default function TenderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { provider, signer, account } = useWallet();

    const [tender, setTender] = useState(null);
    const [winner, setWinner] = useState(null);
    const [creatorProfile, setCreatorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Bid Form
    const [bidAmount, setBidAmount] = useState('');
    const [generatedKey, setGeneratedKey] = useState(null);

    // Reveal Form
    const [revealAmount, setRevealAmount] = useState('');
    const [revealKey, setRevealKey] = useState('');

    // Rating Form
    const [rating, setRating] = useState(5);

    const [now, setNow] = useState(Date.now());
    const [bidSubmitted, setBidSubmitted] = useState(false);
    const [bidLoading, setBidLoading] = useState(false);
    const [revealLoading, setRevealLoading] = useState(false);



    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (provider) {
            loadTender();
        }
    }, [id, provider]);

    async function loadTender() {
        try {
            setLoading(true);
            const data = await fetchTender(provider, Number(id));
            setTender(data);

            if (data.status === 3) {
                const w = await getWinner(provider, Number(id));
                if (w.selectedAt > 0) setWinner(w);
            }

            try {
                const p = await getCompanyProfile(provider, data.creator);
                if (p && p.name) setCreatorProfile(p);
            } catch (e) {
                console.warn("Could not fetch creator profile", e);
            }
        } catch (err) {
            console.error('Failed to load tender:', err);
            showToast('Failed to load tender', 'error');
        } finally {
            setLoading(false);
        }
    }

    const nowSec = Math.floor(now / 1000);
    const isBiddingOpen = tender && tender.status === 0 && nowSec < tender.deadline;
    const isRevealOpen = tender && tender.status === 0 && nowSec >= tender.deadline && nowSec < tender.revealDeadline;
    const canClose = tender && tender.status === 0 && nowSec >= tender.revealDeadline;
    const isCreator = tender && account && tender.creator.toLowerCase() === account.toLowerCase();

    async function handleSubmitBid() {
        if (!bidAmount || Number(bidAmount) <= 0) {
            showToast('Enter a valid bid amount', 'error');
            return;
        }

        try {
            setBidLoading(true);
            const secret = generateSecretKey();
            const commitment = generateCommitment(bidAmount, secret);

            await submitBid(signer, Number(id), commitment);

            setGeneratedKey(secret);
            setBidSubmitted(true);
            showToast('Bid submitted on-chain!');
            loadTender();
        } catch (err) {
            console.error('Bid failed:', err);
            showToast(err.reason || err.message || 'Bid submission failed', 'error');
        } finally {
            setBidLoading(false);
        }
    }

    async function handleReveal() {
        if (!revealAmount || !revealKey) {
            showToast('Enter both amount and secret key', 'error');
            return;
        }

        try {
            setRevealLoading(true);
            await revealBid(signer, Number(id), Number(revealAmount), revealKey);
            showToast('Bid revealed successfully!');
            loadTender();
        } catch (err) {
            console.error('Reveal failed:', err);
            showToast(err.reason || err.message || 'Reveal failed', 'error');
        } finally {
            setRevealLoading(false);
        }
    }

    async function handleClose() {
        try {
            setActionLoading(true);
            await closeTender(signer, Number(id));
            showToast('Tender finalized!');
            loadTender();
        } catch (err) {
            console.error('Close failed:', err);
            showToast(err.reason || err.message || 'Close failed', 'error');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCancel() {
        try {
            setActionLoading(true);
            await cancelTender(signer, Number(id));
            showToast('Tender canceled');
            loadTender();
        } catch (err) {
            console.error('Cancel failed:', err);
            showToast(err.reason || err.message || 'Cancel failed', 'error');
        } finally {
            setActionLoading(false);
        }
    }

    function copyKey() {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            showToast('Secret key copied!');
        }
    }

    async function handleRate() {
        if (!winner) return;
        try {
            setActionLoading(true);
            await rateBidder(signer, tender.id, rating);
            showToast('Rating submitted successfully!');
        } catch (err) {
            console.error('Rating failed:', err);
            showToast(err.reason || err.message || 'Rating failed', 'error');
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading tender details...</p>
                </div>
            </div>
        );
    }

    if (!tender) {
        return (
            <div className="page">
                <div className="error-state">
                    <p>Tender not found</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <button className="btn btn-ghost back-btn" onClick={() => navigate('/')}>
                ← Back to Tenders
            </button>

            {/* Tender Info */}
            <div className="tender-header">
                <div className="tender-title-row">
                    <span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-600">{CATEGORIES[tender.category] || 'General'}</span>
                    <h1 className="page-title">{tender.title}</h1>
                    <span
                        className="status-badge status-badge-lg"
                        style={{
                            backgroundColor: getStatusColor(tender.status) + '20',
                            color: getStatusColor(tender.status)
                        }}
                    >
                        {getStatusLabel(tender.status)}
                    </span>
                </div>
                <div className="text-gray-500 mb-4 flex items-center gap-2">
                    <span>Created by:</span>
                    {creatorProfile ? (
                        <span className="font-semibold text-primary">{creatorProfile.name}</span>
                    ) : (
                        <span className="mono text-sm">{tender.creator}</span>
                    )}
                    <span className="text-xs text-gray-400">• {new Date(tender.createdAt * 1000).toLocaleDateString()}</span>
                </div>
                <p className="tender-description">{tender.description}</p>
            </div>

            <div className="detail-grid">
                <div className="detail-card">
                    <span className="detail-label">Min Bid</span>
                    <span className="detail-value mono">{tender.minBid} wei</span>
                </div>
                <div className="detail-card">
                    <span className="detail-label">Bidding Deadline</span>
                    <span className="detail-value">{formatTimestamp(tender.deadline)}</span>
                    <span className="detail-countdown">{getTimeLeft(tender.deadline)}</span>
                </div>
                <div className="detail-card">
                    <span className="detail-label">Reveal Deadline</span>
                    <span className="detail-value">{formatTimestamp(tender.revealDeadline)}</span>
                    <span className="detail-countdown">{getTimeLeft(tender.revealDeadline)}</span>
                </div>
                <div className="detail-card">
                    <span className="detail-label">Bidders</span>
                    <span className="detail-value">{tender.bidders}</span>
                </div>
                <div className="detail-card">
                    <span className="detail-label">Creator</span>
                    <span className="detail-value mono" style={{ fontSize: '0.75rem' }}>{tender.creator}</span>
                </div>
                {tender.ipfsHash && (
                    <div className="detail-card">
                        <span className="detail-label">IPFS Hash</span>
                        <span className="detail-value mono" style={{ fontSize: '0.75rem' }}>{tender.ipfsHash}</span>
                    </div>
                )}
            </div>

            {/* Winner Display */}
            {winner && (
                <div className="card winner-card">
                    <h2 className="card-title">🏆 Winner</h2>
                    <div className="winner-info">
                        <div className="key-row">
                            <span className="font-semibold">Winning Bidder:</span>
                            <span className="mono">{winner.bidder}</span>
                        </div>
                        <div className="key-row">
                            <span className="font-semibold">Amount:</span>
                            <span className="mono font-bold">{winner.amount} wei</span>
                        </div>

                        {isCreator && (
                            <div className="mt-4 pt-4 border-t border-yellow-200">
                                <h4 className="font-bold text-sm mb-2">Rate Performance</h4>
                                <div className="flex gap-2 items-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text - 2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} `}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <button
                                        className="btn btn-sm btn-primary ml-2"
                                        onClick={handleRate}
                                        disabled={actionLoading}
                                    >
                                        Submit Rating
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Bid */}
            {isBiddingOpen && (
                <div className="card">
                    <h2 className="card-title">🔒 Submit Encrypted Bid</h2>
                    <p className="card-desc">Your bid amount will be hashed and kept secret until the reveal phase.</p>

                    <div className="form-group">
                        <label className="form-label">Bid Amount (wei)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Enter your bid amount"
                            value={bidAmount}
                            onChange={e => setBidAmount(e.target.value)}
                            min="1"
                        />
                    </div>

                    <button className="btn btn-primary" onClick={handleSubmitBid} disabled={bidLoading}>
                        {bidLoading ? <><span className="spinner-sm"></span> Submitting...</> : '🔐 Encrypt & Submit Bid'}
                    </button>

                    {bidSubmitted && generatedKey && (
                        <div className="success-box">
                            <p className="success-text">✅ Bid Submitted On-Chain!</p>
                            <p className="key-label">Your Secret Key (save this!):</p>
                            <div className="key-row">
                                <code className="key-value">{generatedKey}</code>
                                <button className="btn btn-ghost btn-sm" onClick={copyKey}>📋 Copy</button>
                            </div>
                            <p className="key-warning">⚠️ You need this key + your bid amount to reveal your bid later.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Reveal Bid */}
            {isRevealOpen && (
                <div className="card">
                    <h2 className="card-title">🔓 Reveal Your Bid</h2>
                    <p className="card-desc">Enter your original bid amount and secret key to reveal.</p>

                    <div className="form-group">
                        <label className="form-label">Original Bid Amount (wei)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="The amount you originally bid"
                            value={revealAmount}
                            onChange={e => setRevealAmount(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Secret Key</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Paste your secret key"
                            value={revealKey}
                            onChange={e => setRevealKey(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary" onClick={handleReveal} disabled={revealLoading}>
                        {revealLoading ? <><span className="spinner-sm"></span> Revealing...</> : '🔓 Reveal Bid'}
                    </button>
                </div>
            )}

            {/* Close / Cancel Actions */}
            {(canClose || (tender.status === 0 && isCreator)) && (
                <div className="card">
                    <h2 className="card-title">⚡ Actions</h2>
                    <div className="action-row">
                        {canClose && (
                            <button className="btn btn-primary" onClick={handleClose} disabled={actionLoading}>
                                {actionLoading ? <><span className="spinner-sm"></span> Processing...</> : '✅ Finalize Tender'}
                            </button>
                        )}
                        {tender.status === 0 && isCreator && (
                            <button className="btn btn-danger" onClick={handleCancel} disabled={actionLoading}>
                                {actionLoading ? 'Processing...' : '🚫 Cancel Tender'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Phase indicators for non-actionable states */}
            {tender.status === 0 && !isBiddingOpen && !isRevealOpen && !canClose && (
                <div className="card">
                    <p className="muted">This tender is open but the current phase doesn't require any action from you.</p>
                </div>
            )}

            {tender.status >= 3 && !winner && (
                <div className="card">
                    <p className="muted">This tender has been {tender.status === 4 ? 'canceled' : 'finalized'} with no valid bids.</p>
                </div>
            )}
        </div>
    );
}
