import { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);

    const switchNetwork = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x7A69' }], // 31337 in hex
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x7A69',
                                    chainName: 'Anvil Localhost',
                                    rpcUrls: ['http://127.0.0.1:8545'],
                                    nativeCurrency: {
                                        name: 'ETH',
                                        symbol: 'ETH',
                                        decimals: 18,
                                    },
                                },
                            ],
                        });
                    } catch (addError) {
                        console.error('Failed to add Anvil network:', addError);
                    }
                } else {
                    console.error('Failed to switch network:', switchError);
                }
            }
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await _provider.send("eth_requestAccounts", []);
                const _signer = await _provider.getSigner();
                const network = await _provider.getNetwork();

                setProvider(_provider);
                setSigner(_signer);
                setAccount(accounts[0]);
                setChainId(network.chainId);

                if (network.chainId !== 31337n) {
                    await switchNetwork();
                }
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert("Please install a wallet extension like Lace or MetaMask!");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
        setIsConnecting(false);
    };

    const checkIfWalletIsConnected = async () => {
        if (window.ethereum) {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await _provider.listAccounts();

                if (accounts.length > 0) {
                    const _signer = await _provider.getSigner();
                    const network = await _provider.getNetwork();

                    setProvider(_provider);
                    setSigner(_signer);
                    setAccount(accounts[0].address);
                    setChainId(network.chainId);

                    if (network.chainId !== 31337n) {
                        console.warn("Wallet is not connected to Anvil (Chain ID 31337). Attempting switch...");
                        await switchNetwork();
                    }
                }
            } catch (error) {
                console.error("Error checking wallet connection:", error);
            }
        }
        setIsConnecting(false);
    };

    useEffect(() => {
        checkIfWalletIsConnected();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    checkIfWalletIsConnected();
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        }
    }, []);

    return (
        <WalletContext.Provider value={{ account, provider, signer, chainId, connectWallet, disconnectWallet, isConnecting }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
