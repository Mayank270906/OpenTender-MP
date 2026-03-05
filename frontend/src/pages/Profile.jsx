import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { registerCompany, getCompanyProfile } from '../hooks/useContract';
import { showToast } from '../components/Toast';

export default function Profile() {
    const { signer, account, provider } = useWallet();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [regId, setRegId] = useState('');
    const [email, setEmail] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');

    useEffect(() => {
        if (account && provider) {
            loadProfile();
        }
    }, [account, provider]);

    async function loadProfile() {
        try {
            setLoading(true);
            const p = await getCompanyProfile(provider, account);
            if (p.isRegistered) {
                setProfile(p);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        if (!name) {
            showToast('Company Name is required', 'error');
            return;
        }

        try {
            setRegistering(true);
            await registerCompany(signer, name, regId, email, ipfsHash);
            showToast('Company registered successfully!');
            await loadProfile();
        } catch (err) {
            console.error('Registration failed:', err);
            showToast(err.reason || err.message || 'Registration failed', 'error');
        } finally {
            setRegistering(false);
        }
    }

    if (loading) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    const reputationScore = (profile && profile.reputationTotal > 0 && profile.ratingCount > 0)
        ? (profile.reputationTotal / profile.ratingCount).toFixed(1)
        : '0.0';

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Company Profile</h1>
                    <p className="page-subtitle">Manage your company identity and reputation</p>
                </div>
            </div>

            {profile ? (
                <div className="card">
                    <div className="profile-header">
                        <h2 className="profile-name">{profile.name}</h2>
                        <span className="verified-badge">✓ Verified Company</span>
                    </div>

                    <div className="profile-grid">
                        <div className="detail-card">
                            <span className="detail-label">Reputation Score</span>
                            <div>
                                <span className="reputation-value">{reputationScore}</span>
                                <div className="reputation-meta">/ 5.0 ({profile.ratingCount} ratings)</div>
                            </div>
                        </div>

                        <div className="detail-card">
                            <span className="detail-label">Registration ID</span>
                            <span className="detail-value">{profile.registrationId || 'N/A'}</span>
                        </div>

                        <div className="detail-card">
                            <span className="detail-label">Contact Email</span>
                            <span className="detail-value">{profile.contactEmail || 'N/A'}</span>
                        </div>

                        <div className="detail-card">
                            <span className="detail-label">Wallet Address</span>
                            <span className="detail-value mono" style={{ fontSize: '0.85rem' }}>{account}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card form-card">
                    <h2 className="card-title">Register Company</h2>
                    <p className="card-desc">Create a profile to build reputation and participate in tenders.</p>

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label className="form-label">Company Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Acme Corp"
                                id="company-name-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Business Reg. ID (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={regId}
                                    onChange={e => setRegId(e.target.value)}
                                    placeholder="TAX-12345"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Email (Optional)</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="info@acme.com"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">IPFS Logo/Doc Hash (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={ipfsHash}
                                onChange={e => setIpfsHash(e.target.value)}
                                placeholder="Qm..."
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={registering} id="register-company-btn">
                                {registering ? (
                                    <><span className="spinner-sm"></span> Registering...</>
                                ) : (
                                    'Register Company'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
