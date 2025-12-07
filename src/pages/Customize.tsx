import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Shirt, ShoppingBag, Upload, X, ZoomIn, ZoomOut, Brush } from 'lucide-react';
import { Logo } from '../components/Logo';

const COLORS = [
  { name: 'Canvas White', value: '#FDFBF7', text: '#2B2926', border: '#e5e5e5' },
  { name: 'Charcoal', value: '#2B2926', text: '#FDFBF7', border: '#2B2926' },
  { name: 'Terracotta', value: '#BC4749', text: '#FDFBF7', border: '#BC4749' },
  { name: 'Ochre', value: '#D4A373', text: '#2B2926', border: '#D4A373' },
  { name: 'Olive', value: '#57534e', text: '#FDFBF7', border: '#57534e' },
];

const ITEMS = [
  { id: 'shirt', name: 'Cotton Shirt', price: 45 },
  { id: 'tshirt', name: 'Classic Tee', price: 30 },
  { id: 'saree', name: 'Silk Saree', price: 120 },
  { id: 'bag', name: 'Canvas Tote', price: 25 },
];

// Added "Cosmic Dandelion" style based on the image
const ART_STYLES = [
  { id: 'floral', name: 'Floral Vines', price: 20 },
  { id: 'cosmic', name: 'Cosmic Dandelion', price: 45 },
  { id: 'abstract', name: 'Abstract Splash', price: 25 },
  { id: 'tribal', name: 'Tribal Patterns', price: 30 },
  { id: 'portrait', name: 'Minimalist Portrait', price: 35 },
];

export const Customize = () => {
  const [selectedItem, setSelectedItem] = useState(ITEMS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedArt, setSelectedArt] = useState(ART_STYLES[0]);
  const [customText, setCustomText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1.0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPrice = selectedItem.price + selectedArt.price;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setImageScale(1.0);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-canvas bg-paper-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-block p-3 rounded-full bg-clay-100 text-clay-600 mb-4">
            <Brush size={24} />
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-4">
             <span className="text-5xl md:text-7xl font-serif font-medium text-ink">Design Your</span>
             <Logo className="w-48 h-24 -mb-4" />
          </div>

          <p className="text-xl text-ink/60 font-serif italic">"The world is your canvas, but this shirt is yours."</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Preview Section */}
          <div className="relative sticky top-32 h-fit">
            <div 
              className="aspect-[4/5] shadow-2xl flex items-center justify-center relative overflow-hidden transition-colors duration-700 border-[12px] border-white bg-white"
            >
              {/* The Fabric Background */}
              <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: selectedColor.value }}></div>
              
              {/* Texture Overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] mix-blend-overlay"></div>

              <div className="text-center p-4 z-10 flex flex-col items-center w-full h-full justify-center">
                <div className="relative w-full flex items-center justify-center">
                  {/* Base Item Icon */}
                  <div className={`opacity-90 transition-colors duration-300 relative z-10 drop-shadow-xl`} style={{ color: selectedColor.text }}>
                     {selectedItem.id === 'bag' ? <ShoppingBag size={340} strokeWidth={0.5} /> : <Shirt size={340} strokeWidth={0.5} />}
                  </div>

                  {/* Uploaded Image Overlay */}
                  {uploadedImage && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div 
                        style={{ 
                          width: `${200 * imageScale}px`,
                          height: `${200 * imageScale}px`,
                          transform: `translateY(${selectedItem.id === 'bag' ? '20px' : '-10px'})`
                        }}
                        className="relative transition-all duration-100"
                      >
                        <img 
                          src={uploadedImage} 
                          alt="Custom Design" 
                          className="w-full h-full object-contain" 
                          style={{ 
                            mixBlendMode: selectedColor.text === '#FDFBF7' ? 'normal' : 'multiply',
                            filter: 'contrast(1.1) saturate(1.1)',
                            opacity: 0.95
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-12">
                  <h3 className="text-3xl font-serif mb-1" style={{ color: selectedColor.text }}>{selectedItem.name}</h3>
                  <p className="text-lg opacity-75 mb-6 font-handwriting" style={{ color: selectedColor.text }}>{selectedArt.name} Style</p>
                  
                  {customText && (
                    <div className="pt-4 mt-2 opacity-90 max-w-xs mx-auto border-t border-current" style={{ color: selectedColor.text }}>
                      <p className="font-handwriting text-3xl transform -rotate-2">"{customText}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Artistic Shadow/Blob behind preview */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-ink/5 blur-3xl rounded-full"></div>
          </div>

          {/* Controls Section */}
          <div className="space-y-12">
            
            {/* Item Selection */}
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-ink/50 mb-6">1. Choose Your Canvas</h3>
              <div className="grid grid-cols-2 gap-4">
                {ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-6 text-left transition-all duration-300 border ${
                      selectedItem.id === item.id 
                        ? 'border-clay-500 bg-clay-50 shadow-lg shadow-clay-100' 
                        : 'border-ink/10 hover:border-ink/30 bg-white'
                    }`}
                  >
                    <div className="font-serif text-xl text-ink mb-1">{item.name}</div>
                    <div className="text-sm text-ink/60 font-sans">+${item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-ink/50 mb-6">2. Select Pigment</h3>
              <div className="flex flex-wrap gap-6">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${
                      selectedColor.name === color.name ? 'ring-2 ring-offset-4 ring-clay-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.value, border: `1px solid ${color.border}` }}
                    title={color.name}
                  >
                    {selectedColor.name === color.name && (
                      <Check size={20} color={color.text} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Art Style Selection */}
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-ink/50 mb-6">3. Choose Art Style</h3>
              <div className="grid grid-cols-2 gap-4">
                {ART_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedArt(style)}
                    className={`p-6 text-left transition-all duration-300 border ${
                      selectedArt.id === style.id 
                        ? 'border-clay-500 bg-clay-50 shadow-lg shadow-clay-100' 
                        : 'border-ink/10 hover:border-ink/30 bg-white'
                    }`}
                  >
                    <div className="font-serif text-xl text-ink mb-1">{style.name}</div>
                    <div className="text-sm text-ink/60 font-sans">+${style.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-ink/50 mb-6">4. Upload Reference</h3>
              <div 
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-sm p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                  uploadedImage ? 'border-clay-500 bg-clay-50/30' : 'border-ink/20 hover:border-clay-400 hover:bg-white'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {uploadedImage ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 overflow-hidden bg-white shadow-md border border-ink/10">
                          <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-ink font-serif text-lg">Reference Loaded</span>
                      </div>
                      <button 
                        onClick={clearImage}
                        className="p-2 hover:bg-clay-100 rounded-full text-ink/50 hover:text-clay-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* Size Slider */}
                     <div className="mt-6 pt-6 border-t border-ink/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-sans uppercase tracking-widest text-ink/50 flex items-center gap-2">
                          <ZoomOut size={14} /> Scale Art
                        </span>
                        <span className="text-xs font-sans uppercase tracking-widest text-ink/50 flex items-center gap-2">
                          <ZoomIn size={14} />
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={imageScale}
                        onChange={(e) => setImageScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-clay-600"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mb-4 text-ink/40 group-hover:text-clay-500 group-hover:bg-clay-50 transition-colors">
                      <Upload size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-ink font-serif text-lg">Click to upload inspiration</p>
                    <p className="text-sm text-ink/40 mt-2 font-sans">JPG, PNG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Custom Text */}
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-ink/50 mb-6">5. Add Signature (Optional)</h3>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Initials, Date, or Quote..."
                className="w-full p-5 rounded-none border-b-2 border-ink/20 focus:border-clay-500 outline-none bg-transparent font-handwriting text-2xl text-ink placeholder:text-ink/30 transition-colors"
                maxLength={30}
              />
            </div>

            {/* Summary & Action */}
            <div className="pt-10 border-t border-ink/10">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-sm font-sans uppercase tracking-widest text-ink/50 mb-1">Estimated Total</p>
                  <p className="text-5xl font-serif text-ink">${totalPrice}</p>
                </div>
                <button className="px-10 py-5 bg-ink text-canvas font-serif text-lg hover:bg-clay-600 transition-all duration-300 shadow-xl shadow-ink/20 hover:shadow-clay-600/30">
                  Commission Piece
                </button>
              </div>
              <p className="text-xs text-ink/40 text-center font-sans">
                *Each piece is handpainted. Allow 2-3 weeks for creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
