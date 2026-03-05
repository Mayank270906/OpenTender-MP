import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function Navbar() {
    const { account, disconnectWallet } = useWallet();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const short = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : '';

    const navLinks = [
        { to: '/create', icon: '+', label: 'Create Tender' },
        { to: '/profile', icon: '👤', label: 'Profile' },
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    ];

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <span className="navbar-logo-icon">◆</span>
                OpenTender
            </Link>

            <button
                className="mobile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? '✕' : '☰'}
            </button>

            <div className={`navbar-actions${menuOpen ? ' open' : ''}`}>
                {navLinks.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`btn btn-nav${location.pathname === link.to ? ' active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        <span>{link.icon}</span> {link.label}
                    </Link>
                ))}
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
