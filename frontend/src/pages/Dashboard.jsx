import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllTenders, getBidDetails, getCompanyProfile } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';
import { CATEGORIES } from '../utils/categories';
import { getStatusLabel, getStatusColor } from '../utils/time';

export default function Dashboard() {
    const navigate = useNavigate();
    const { provider, account } = useWallet();
    const [stats, setStats] = useState({
        totalTenders: 0,
        activeTenders: 0,
        totalBids: 0,
        categoryDist: {}
    });
    const [myTenders, setMyTenders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider && account) {
            loadDashboard();
        }
    }, [provider, account]);

    async function loadDashboard() {
        try {
            setLoading(true);
            const tenders = await fetchAllTenders(provider);

            const totalTenders = tenders.length;
            const activeTenders = tenders.filter(t => t.status === 0).length;
            const totalBids = tenders.reduce((acc, t) => acc + t.bidders, 0);

            const categoryDist = {};
            tenders.forEach(t => {
                const cat = CATEGORIES[t.category] || 'Unknown';
                categoryDist[cat] = (categoryDist[cat] || 0) + 1;
            });

            setStats({ totalTenders, activeTenders, totalBids, categoryDist });

            const mine = tenders.filter(t => t.creator.toLowerCase() === account.toLowerCase());
            setMyTenders(mine);

        } catch (err) {
            console.error('Dashboard load failed:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <h1 className="page-title" style={{ marginBottom: '24px' }}>Dashboard</h1>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value purple">{stats.totalTenders}</div>
                    <div className="stat-label">Total Tenders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value green">{stats.activeTenders}</div>
                    <div className="stat-label">Active Tenders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value blue">{stats.totalBids}</div>
                    <div className="stat-label">Total Bids Placed</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Category Activity */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '20px' }}>Market Trends</h3>
                    {Object.keys(stats.categoryDist).length === 0 ? (
                        <p className="muted">No data yet.</p>
                    ) : (
                        Object.entries(stats.categoryDist).map(([cat, count]) => (
                            <div key={cat} className="progress-group">
                                <div className="progress-header">
                                    <span className="progress-name">{cat}</span>
                                    <span className="progress-count">{count} tenders</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(count / Math.max(stats.totalTenders, 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* My Tenders */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '20px' }}>My Tenders</h3>
                    {myTenders.length === 0 ? (
                        <p className="muted">You haven't created any tenders yet.</p>
                    ) : (
                        <table className="mini-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Bids</th>
                                    <th style={{ textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {myTenders.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: 500 }}>{t.title}</td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{
                                                    color: getStatusColor(t.status),
                                                    backgroundColor: getStatusColor(t.status) + '15'
                                                }}
                                            >
                                                {getStatusLabel(t.status)}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{t.bidders}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => navigate(`/tender/${t.id}`)}
                                                className="manage-link"
                                            >
                                                Manage →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
