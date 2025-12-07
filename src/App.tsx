import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Customize } from './pages/Customize';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Dashboard } from './pages/Dashboard';
import { NFTMarketplace } from './pages/NFTMarketplace';
import { Wallet } from './pages/Wallet';
import { CartDrawer } from './components/CartDrawer';
import { ShopProvider } from './context/ShopContext';
import { Web3Provider } from './context/Web3Context';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <Web3Provider>
      <ShopProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-canvas font-sans text-ink selection:bg-brand-orange/30 selection:text-brand-orange bg-paper-texture">
            <Navbar />
            <CartDrawer />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/customize" element={<Customize />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                <Route path="/wallet" element={<Wallet />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ShopProvider>
    </Web3Provider>
  );
}

export default App;
