import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllTenders } from '../hooks/useContract';
import { getTimeLeft, getStatusLabel, getStatusColor } from '../utils/time';
import { useWallet } from '../context/WalletContext';
import { CATEGORIES, CATEGORY_OPTIONS } from '../utils/categories';

export default function Home() {
    const navigate = useNavigate();
    const { provider } = useWallet();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState(null);
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

    const filtered = tenders.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === null || t.category === filterCategory;
        return matchSearch && matchCategory;
    });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Active Tenders</h1>
                    <p className="page-subtitle">Browse and participate in blockchain-secured tenders</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/create')} id="create-tender-btn">
                    <span>+</span> Create Tender
                </button>
            </div>

            <div className="search-filter-row">
                <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search tenders..."
                        className="search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        id="search-tenders-input"
                    />
                </div>

                <div className="filter-select-wrap">
                    <select
                        className="form-input"
                        value={filterCategory ?? ''}
                        onChange={e => setFilterCategory(e.target.value === '' ? null : Number(e.target.value))}
                        id="filter-category-select"
                    >
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
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
                    <button className="btn btn-secondary" onClick={loadTenders} style={{ marginTop: '12px' }}>Retry</button>
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
                                <th>Category</th>
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
                                    <td><span className="category-badge">{CATEGORIES[t.category]}</span></td>
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
