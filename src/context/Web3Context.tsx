import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { NFT, nfts as initialNFTs } from '../data/nfts';

interface Transaction {
  id: string;
  type: 'Purchase' | 'Mint' | 'Reward' | 'Redeem';
  amount: number; // KLC
  date: string;
  details: string;
}

interface Web3ContextType {
  isConnected: boolean;
  address: string | null;
  klcBalance: number;
  ownedNFTs: NFT[];
  transactions: Transaction[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  mintNFT: (nft: NFT) => Promise<boolean>;
  payWithKLC: (amount: number, item: string) => Promise<boolean>;
  exchangeRate: number; // USD to KLC
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [klcBalance, setKlcBalance] = useState(0);
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 1 USD = 10 KLC (Example Rate)
  const exchangeRate = 10;

  const connectWallet = async () => {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsConnected(true);
    setAddress('0x71C...9A23');
    setKlcBalance(5000); // Welcome bonus
    
    // Add welcome transaction if empty
    if (transactions.length === 0) {
      setTransactions([{
        id: 'tx-init',
        type: 'Reward',
        amount: 5000,
        date: new Date().toLocaleDateString(),
        details: 'Welcome Bonus'
      }]);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const mintNFT = async (nft: NFT) => {
    if (klcBalance < nft.price) return false;
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Minting animation delay
    
    setKlcBalance(prev => prev - nft.price);
    setOwnedNFTs(prev => [...prev, nft]);
    setTransactions(prev => [{
      id: `tx-${Date.now()}`,
      type: 'Mint',
      amount: -nft.price,
      date: new Date().toLocaleDateString(),
      details: `Minted ${nft.name}`
    }, ...prev]);
    
    return true;
  };

  const payWithKLC = async (amount: number, item: string) => {
    if (klcBalance < amount) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setKlcBalance(prev => prev - amount);
    setTransactions(prev => [{
      id: `tx-${Date.now()}`,
      type: 'Purchase',
      amount: -amount,
      date: new Date().toLocaleDateString(),
      details: `Bought ${item}`
    }, ...prev]);
    
    return true;
  };

  return (
    <Web3Context.Provider value={{
      isConnected,
      address,
      klcBalance,
      ownedNFTs,
      transactions,
      connectWallet,
      disconnectWallet,
      mintNFT,
      payWithKLC,
      exchangeRate
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};
