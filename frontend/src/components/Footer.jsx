export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <span className="footer-brand">◆ OpenTender</span>
                <span>© {new Date().getFullYear()} OpenTender — Decentralized Tendering</span>
                <div className="footer-links">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://docs.ethers.org" target="_blank" rel="noopener noreferrer">Docs</a>
                </div>
            </div>
        </footer>
    );
}
