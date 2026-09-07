import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Customize } from './pages/Customize'
import { Shop } from './pages/Shop'
import { ProductDetails } from './pages/ProductDetails'
import { Dashboard } from './pages/Dashboard'
import { NFTMarketplace } from './pages/NFTMarketplace'
import { Wallet } from './pages/Wallet'
import { B2BBuyer } from './pages/B2BBuyer'
import { B2BArtisan } from './pages/B2BArtisan'
import { CartDrawer } from './components/CartDrawer'
import { ShopProvider } from './context/ShopContext'
import { Web3Provider } from './context/Web3Context'
import { AuthProvider } from './context/AuthContext'
import { ScrollToTop } from './components/ScrollToTop'
import { Checkout } from './pages/Checkout'
import { PurchaseSuccess } from './pages/PurchaseSuccess'
import VerifiedArtPage from './pages/VerifiedArtPage'
import ArtisanProfile from './pages/ArtisanProfile'
import BuyerCollection from './pages/BuyerCollection'
import Explore from './pages/Explore'
import { PremiumHome } from './pages/PremiumHome'
import Provenance from './pages/Provenance'

function App() {
  return (
    <Web3Provider>
      <ShopProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-canvas font-sans text-ink selection:bg-brand-orange/30 selection:text-brand-orange bg-paper-texture">
              <Navbar />
              <CartDrawer />
              <main>
                <Routes>
                  <Route path="/" element={<PremiumHome />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/sell" element={<Customize />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/artwork/:id" element={<ProductDetails />} />
                  <Route path="/customize" element={<Customize />} />
                  <Route path="/ai-studio" element={<Customize />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/purchase-success/:id" element={<PurchaseSuccess />} />
                  <Route path="/verified-art" element={<VerifiedArtPage />} />
                  <Route path="/artisan/:id" element={<ArtisanProfile />} />
                  <Route path="/collection" element={<BuyerCollection />} />
                  <Route path="/b2b/buyer" element={<B2BBuyer />} />
                  <Route path="/b2b/artisan" element={<B2BArtisan />} />
                  <Route path="/b2b" element={<B2BBuyer />} />
                  <Route path="/provenance/:id" element={<Provenance />} />
                  <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                  <Route path="/wallet" element={<Wallet />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ShopProvider>
    </Web3Provider>
  )
}

export default App