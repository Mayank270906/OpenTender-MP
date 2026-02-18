import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function Navbar() {
    const { account, disconnectWallet } = useWallet();
    const address = account;
    const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <span className="navbar-logo-icon">◆</span>
                OpenTender
            </Link>

            <div className="navbar-actions">
                <Link to="/create" className="btn btn-nav">
                    <span>+</span> Create Tender
                </Link>
                <div className="wallet-actions">
                    <div className="wallet-badge">
                        <span className="wallet-dot"></span>
                        {short}
                    </div>
                    <button className="btn btn-sm btn-ghost" onClick={disconnectWallet} title="Disconnect">
                        ✕
                    </button>
                </div>
            </div>
        </nav>
    );
}
