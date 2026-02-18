import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import CreateTender from './pages/CreateTender';
import TenderDetail from './pages/TenderDetail';
import { WalletProvider, useWallet } from './context/WalletContext';
import ConnectWallet from './components/ConnectWallet';

function AppContent() {
  const { account, isConnecting } = useWallet();

  if (isConnecting) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;

  if (!account) {
    return <ConnectWallet />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateTender />} />
            <Route path="/tender/:id" element={<TenderDetail />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
