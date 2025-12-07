import React from 'react';
import { Package, Heart, Settings, LogOut, User } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="pt-24 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-serif text-ink mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone-100">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                <User size={32} />
              </div>
              <div>
                <h3 className="font-bold text-ink">Art Lover</h3>
                <p className="text-sm text-stone-500">member@kalla.art</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-blue/5 text-brand-blue rounded-lg font-medium">
                <Package size={20} /> Orders
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 rounded-lg transition-colors">
                <Heart size={20} /> Wishlist
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 rounded-lg transition-colors">
                <Settings size={20} /> Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-8">
                <LogOut size={20} /> Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Order */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif">Recent Orders</h2>
                <button className="text-sm text-brand-blue font-medium">View All</button>
              </div>
              
              <div className="border border-stone-100 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 bg-stone-100 rounded-md overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Order" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-lg">Canvas Tote - Sunflowers</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Delivered</span>
                  </div>
                  <p className="text-sm text-stone-500">Order #KA-8832 • Placed on Oct 24, 2024</p>
                  <div className="mt-4 w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-green-500"></div>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Delivered to New York, NY</p>
                </div>
                <button className="px-6 py-2 border border-stone-200 rounded-md hover:bg-stone-50 text-sm font-medium">
                  Track
                </button>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-brand-purple/5 p-8 rounded-xl border border-brand-purple/10">
              <h2 className="text-xl font-serif mb-4 text-brand-purple">Recommended For You</h2>
              <p className="text-stone-600 mb-6">Based on your love for floral patterns.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-square bg-stone-100 rounded-md mb-3 overflow-hidden">
                      <img src={`https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?auto=format&fit=crop&q=80&w=400&random=${i}`} className="w-full h-full object-cover" alt="Rec" />
                    </div>
                    <h4 className="font-serif text-sm truncate">Artistic Floral Print</h4>
                    <p className="text-xs text-stone-500">$45.00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
