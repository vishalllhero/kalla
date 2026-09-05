import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CoinBadge } from '../components/CoinBadge';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, CreditCard } from 'lucide-react';

export const Wallet = () => {
  const { isConnected, connectWallet, address, klcBalance, transactions, ownedNFTs, exchangeRate } = useWeb3();

  if (!isConnected) {
    return (
      <div className="pt-32 min-h-screen bg-canvas flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-brand-purple/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <WalletIcon size={48} className="text-brand-purple" />
        </div>
        <h1 className="text-4xl font-serif text-ink mb-4">Connect Your Wallet</h1>
        <p className="text-ink/60 max-w-md mb-8">Access your KLC balance, view your NFT collection, and unlock exclusive artist rewards.</p>
        <button 
          onClick={connectWallet}
          className="px-8 py-4 bg-ink text-white rounded-full font-medium hover:bg-brand-purple transition-colors shadow-xl"
        >
          Connect MetaMask / WalletConnect
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Balance Card */}
          <div className="space-y-6">
            {/* Main Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-stone-400 text-sm uppercase tracking-widest mb-1">Total Balance</p>
                    <h2 className="text-4xl font-bold flex items-center gap-3">
                      <CoinBadge size="md" /> {klcBalance.toLocaleString()} KLC
                    </h2>
                    <p className="text-stone-500 text-sm mt-1">≈ ${(klcBalance / exchangeRate).toFixed(2)} USD</p>
                  </div>
                  <div className="p-2 bg-white/10 rounded-lg">
                    <WalletIcon size={24} />
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <button className="flex-1 bg-brand-purple hover:bg-brand-purple/90 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <ArrowDownLeft size={18} /> Buy KLC
                  </button>
                  <button className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <ArrowUpRight size={18} /> Send
                  </button>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Wallet Address</p>
                  <div className="flex items-center gap-2 font-mono text-sm bg-black/20 p-2 rounded">
                    <span className="truncate">{address}</span>
                    <button className="text-brand-purple hover:text-white text-xs">Copy</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
              <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                <History size={20} className="text-stone-400" /> Recent Activity
              </h3>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-stone-400 text-sm">No transactions yet.</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-stone-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-600'}`}>
                          {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-ink">{tx.details}</p>
                          <p className="text-xs text-stone-400">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-ink'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} KLC
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: NFT Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-100 min-h-[600px]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif text-ink">Your Collection</h2>
                <span className="px-3 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-500">{ownedNFTs.length} Items</span>
              </div>

              {ownedNFTs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-stone-200 rounded-xl">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                    <CreditCard size={32} className="text-stone-300" />
                  </div>
                  <h3 className="text-lg font-serif text-stone-400">No NFTs Found</h3>
                  <p className="text-stone-400 text-sm mb-6">Start your collection in the marketplace.</p>
                  <button className="text-brand-purple font-medium hover:underline">Browse Marketplace</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {ownedNFTs.map(nft => (
                    <div key={nft.id} className="group bg-stone-50 rounded-xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all">
                      <div className="aspect-video relative overflow-hidden">
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded">
                          {nft.rarity}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif text-lg mb-1">{nft.name}</h3>
                        <div className="flex justify-between items-center mt-4">
                          {nft.redeemable ? (
                            <button className="px-4 py-2 bg-brand-orange text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-brand-orange/90">
                              Redeem Physical
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400">Digital Only</span>
                          )}
                          <button className="text-xs text-brand-blue hover:underline">View Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
