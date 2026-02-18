import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllTenders } from '../hooks/useContract';
import { getTimeLeft, getStatusLabel, getStatusColor } from '../utils/time';
import { useWallet } from '../context/WalletContext';

export default function Home() {
    const navigate = useNavigate();
    const { provider } = useWallet();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (provider) {
            loadTenders();
        }
    }, [provider]);

    async function loadTenders() {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllTenders(provider);
            setTenders(data);
        } catch (err) {
            setError(`Failed to connect to blockchain: ${err.message || err} (Make sure your wallet is connected to Localhost 8545)`);
        } finally {
            setLoading(false);
        }
    }

    const filtered = tenders.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Active Tenders</h1>
                    <p className="page-subtitle">Browse and participate in blockchain-secured tenders</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/create')}>
                    <span>+</span> Create Tender
                </button>
            </div>

            <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search tenders..."
                    className="search-input"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading tenders from blockchain...</p>
                </div>
            )}

            {error && (
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <button className="btn btn-secondary" onClick={loadTenders}>Retry</button>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No tenders found</h3>
                    <p>Create the first tender to get started!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/create')}>
                        Create Tender
                    </button>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Min Bid</th>
                                <th>Status</th>
                                <th>Bid Deadline</th>
                                <th>Reveal Deadline</th>
                                <th>Bidders</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => (
                                <tr key={t.id}>
                                    <td className="mono">#{t.id}</td>
                                    <td className="bold">{t.title}</td>
                                    <td className="mono">{t.minBid} wei</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(t.status) + '20', color: getStatusColor(t.status) }}
                                        >
                                            {getStatusLabel(t.status)}
                                        </span>
                                    </td>
                                    <td>{getTimeLeft(t.deadline)}</td>
                                    <td>{getTimeLeft(t.revealDeadline)}</td>
                                    <td>{t.bidders}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => navigate(`/tender/${t.id}`)}
                                        >
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
