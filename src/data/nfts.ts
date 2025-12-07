export interface NFT {
  id: string;
  name: string;
  artist: string;
  price: number; // in KLC
  image: string;
  rarity: 'Common' | 'Rare' | 'Legendary' | 'Artifact';
  tokenId: string;
  redeemable: boolean;
  description: string;
  attributes: { trait_type: string; value: string }[];
}

export const nfts: NFT[] = [
  {
    id: 'nft-1',
    name: "Genesis Cube #001",
    artist: "Kalla Studio",
    price: 500,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    rarity: 'Legendary',
    tokenId: '0x...8f2a',
    redeemable: true,
    description: "The first digital brushstroke in the Kalla metaverse. Redeemable for a 4x4ft oil painting.",
    attributes: [
      { trait_type: "Medium", value: "Oil & Digital" },
      { trait_type: "Canvas", value: "Infinite" }
    ]
  },
  {
    id: 'nft-2',
    name: "Neon Dandelion",
    artist: "Elena R.",
    price: 150,
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800",
    rarity: 'Rare',
    tokenId: '0x...b1c4',
    redeemable: true,
    description: "A cyberpunk reinterpretation of our classic dandelion motif.",
    attributes: [
      { trait_type: "Style", value: "Neon Noir" },
      { trait_type: "Edition", value: "1 of 50" }
    ]
  },
  {
    id: 'nft-3',
    name: "Abstract Fluidity",
    artist: "Marcus T.",
    price: 75,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
    rarity: 'Common',
    tokenId: '0x...99a1',
    redeemable: false,
    description: "Digital-only fluid art representing the flow of creativity.",
    attributes: [
      { trait_type: "Color", value: "Blue" },
      { trait_type: "Flow", value: "Turbulent" }
    ]
  },
  {
    id: 'nft-4',
    name: "Golden Glitch",
    artist: "Kalla AI",
    price: 1200,
    image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?auto=format&fit=crop&q=80&w=800",
    rarity: 'Artifact',
    tokenId: '0x...77d2',
    redeemable: true,
    description: "A corruption of gold leaf textures. Redeemable for a gold-leaf embellished statue.",
    attributes: [
      { trait_type: "Material", value: "Gold" },
      { trait_type: "Glitch", value: "Heavy" }
    ]
  }
];
