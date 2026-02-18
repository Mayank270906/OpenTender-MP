import { useWallet } from '../context/WalletContext';

export default function ConnectWallet() {
    const { connectWallet } = useWallet();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="p-8 bg-gray-800 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to OpenTender</h1>
                <p className="mb-6 text-gray-300">Please connect your wallet to continue.</p>
                <button
                    onClick={connectWallet}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition duration-200"
                >
                    Connect Wallet
                </button>
            </div>
        </div>
    );
}
