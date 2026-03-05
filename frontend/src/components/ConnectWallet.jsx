import { useWallet } from '../context/WalletContext';

export default function ConnectWallet() {
    const { connectWallet } = useWallet();

    return (
        <div className="connect-page">
            <div className="connect-card">
                <div className="connect-logo">◆</div>
                <h1 className="connect-title">
                    Welcome to <span className="connect-title-accent">OpenTender</span>
                </h1>
                <p className="connect-subtitle">
                    Decentralized blind tendering powered by blockchain.
                    Submit encrypted bids, ensure fair competition, and build trust — all on-chain.
                </p>

                <button onClick={connectWallet} className="connect-btn" id="connect-wallet-btn">
                    <span>🔗</span> Connect Wallet
                </button>

                <div className="connect-features">
                    <div className="feature-card">
                        <span className="feature-icon">🔒</span>
                        <div className="feature-title">Blind Bidding</div>
                        <div className="feature-desc">
                            Encrypted bids keep amounts hidden until the reveal phase
                        </div>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">⛓️</span>
                        <div className="feature-title">On-Chain Security</div>
                        <div className="feature-desc">
                            Every action is recorded immutably on the blockchain
                        </div>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">⭐</span>
                        <div className="feature-title">Reputation System</div>
                        <div className="feature-desc">
                            Build your company profile and earn trust over time
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
