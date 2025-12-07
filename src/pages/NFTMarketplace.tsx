import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { nfts } from '../data/nfts';
import { useWeb3 } from '../context/Web3Context';
import { CoinBadge } from '../components/CoinBadge';
import { Hexagon, Sparkles, ShoppingCart, ExternalLink } from 'lucide-react';

export const NFTMarketplace = () => {
  const { connectWallet, isConnected, mintNFT, klcBalance } = useWeb3();
  const [filter, setFilter] = useState('All');
  const [mintingId, setMintingId] = useState<string | null>(null);

  const handleMint = async (nft: any) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    setMintingId(nft.id);
    const success = await mintNFT(nft);
    if (success) {
      alert(`Successfully minted ${nft.name}!`);
    } else {
      alert("Insufficient KLC Balance!");
    }
    setMintingId(null);
  };

  const filteredNFTs = filter === 'All' ? nfts : nfts.filter(n => n.rarity === filter);

  return (
    <div className="pt-24 min-h-screen bg-stone-900 text-white relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-purple/20 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/50 text-brand-purple mb-6"
          >
            <Hexagon size={14} className="fill-current" />
            <span className="text-xs font-bold uppercase tracking-widest">Web3 Gallery</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-brand-purple">
            Phygital Art <br/> Revolution
          </h1>
          <p className="text-stone-400 max-w-2xl mx-auto text-lg">
            Collect digital masterpieces. Redeem them for physical canvas paintings. 
            Own the art in both worlds.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 border-y border-white/10 py-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10k</div>
            <div className="text-xs text-stone-500 uppercase tracking-widest">Total Supply</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">2.4k</div>
            <div className="text-xs text-stone-500 uppercase tracking-widest">Owners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-purple">500 KLC</div>
            <div className="text-xs text-stone-500 uppercase tracking-widest">Floor Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">124</div>
            <div className="text-xs text-stone-500 uppercase tracking-widest">Redeemed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {['All', 'Common', 'Rare', 'Legendary', 'Artifact'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f 
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/25' 
                  : 'bg-white/5 text-stone-400 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredNFTs.map((nft) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-purple/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-purple/10 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
                  {nft.rarity}
                </div>
                {nft.redeemable && (
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-xs font-bold text-green-400 border border-green-500/30 flex items-center gap-1">
                    <Sparkles size={12} /> Redeemable
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-serif text-xl text-white group-hover:text-brand-purple transition-colors">{nft.name}</h3>
                    <p className="text-xs text-stone-500">{nft.artist}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                    <CoinBadge size="sm" />
                    <span className="font-bold text-sm">{nft.price}</span>
                  </div>
                </div>

                <p className="text-stone-400 text-xs mb-4 line-clamp-2">{nft.description}</p>

                <button
                  onClick={() => handleMint(nft)}
                  disabled={mintingId === nft.id}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                    isConnected && klcBalance < nft.price 
                      ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                      : 'bg-brand-purple text-white hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20'
                  }`}
                >
                  {mintingId === nft.id ? (
                    <span className="animate-pulse">Minting...</span>
                  ) : (
                    <>
                      {isConnected ? (klcBalance < nft.price ? 'Insufficient KLC' : 'Mint Now') : 'Connect to Mint'}
                      <ExternalLink size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
