export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description?: string;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
}

export const products: Product[] = [
  // Signature Collection
  {
    id: 1,
    name: "Midnight Dandelion Shirt",
    price: 85,
    rating: 4.9,
    reviews: 128,
    image: "/images/dandelion-shirt.jpg",
    category: "Men's Fashion",
    description: "A dreamlike scene of dandelions drifting across a cosmic purple night sky, handpainted on a premium black shirt.",
    tags: ["Handpainted", "Cosmic", "Best Seller"],
    colors: ["Black", "Navy"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "Golden Horizon Tee",
    price: 65,
    rating: 4.7,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
    category: "Men's Fashion",
    description: "A mesmerizing golden sunset landscape handpainted on a premium black cotton tee.",
    tags: ["Landscape", "Cotton"],
    colors: ["Black"],
    sizes: ["M", "L"]
  },
  
  // Women's Collection
  {
    id: 4,
    name: "Floral Handpainted Saree",
    price: 120,
    rating: 5.0,
    reviews: 42,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    category: "Women's Ethnic",
    tags: ["Silk", "Floral", "Wedding"],
    colors: ["Red", "Cream"],
    sizes: ["Free Size"]
  },
  {
    id: 6,
    name: "Painted Silk Gown",
    price: 150,
    rating: 4.8,
    reviews: 30,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
    category: "Women's Western",
    tags: ["Luxury", "Evening Wear"],
    colors: ["Blue", "Purple"],
    sizes: ["S", "M", "L"]
  },

  // Bags
  {
    id: 10,
    name: "Cosmic Rockers Backpack",
    price: 185,
    rating: 5.0,
    reviews: 15,
    image: "/images/rick-morty-bag.jpg",
    category: "Bags & Gear",
    description: "Handpainted acrylic art featuring cosmic rockstars on a premium leather backpack.",
    tags: ["Limited Edition", "Leather", "Waterproof"],
    colors: ["Black"],
    sizes: ["Standard"]
  },
  {
    id: 12,
    name: "Eco Jute Shopper",
    price: 40,
    rating: 4.5,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800",
    category: "Bags & Gear",
    tags: ["Sustainable", "Handmade"],
    colors: ["Beige"],
    sizes: ["Large"]
  },

  // Home Decor & Canvas
  {
    id: 14,
    name: "Custom Oil Portrait",
    price: 150,
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?auto=format&fit=crop&q=80&w=800",
    category: "Canvas Art",
    description: "Lifelike handpainted portraits from your photos.",
    tags: ["Custom", "Portrait"],
    colors: ["Multi"],
    sizes: ["A4", "A3", "A2"]
  },
  {
    id: 20,
    name: "Abstract Blue Wave",
    price: 95,
    rating: 4.6,
    reviews: 12,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
    category: "Canvas Art",
    tags: ["Abstract", "Modern"],
    colors: ["Blue", "White"],
    sizes: ["24x36", "30x40"]
  },
  {
    id: 21,
    name: "Handpainted Ceramic Vase",
    price: 55,
    rating: 4.8,
    reviews: 34,
    image: "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?auto=format&fit=crop&q=80&w=800",
    category: "Home Decor",
    tags: ["Ceramic", "Floral"],
    colors: ["White", "Blue"],
    sizes: ["Standard"]
  },
  {
    id: 22,
    name: "Boho Wall Hanging",
    price: 45,
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?auto=format&fit=crop&q=80&w=800",
    category: "Home Decor",
    tags: ["Macrame", "Boho"],
    colors: ["Cream"],
    sizes: ["Large"]
  }
];

export const categories = [
  "All",
  "Men's Fashion",
  "Women's Ethnic",
  "Women's Western",
  "Bags & Gear",
  "Canvas Art",
  "Home Decor"
];
