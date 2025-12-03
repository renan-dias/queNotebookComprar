export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  metadata?: RecommendationMetadata;
}

export interface RecommendationMetadata {
  notebooks?: Notebook[];
  chartData?: PricePoint[];
  mapLocations?: StoreLocation[];
  groundingLinks?: GroundingLink[];
}

export interface GroundingLink {
  title: string;
  url: string;
}

export interface Notebook {
  name: string;
  price: number;
  specs: {
    cpu: string;
    ram: string;
    gpu: string;
    storage: string;
    screen: string;
  };
  pros: string[];
  cons: string[];
  imageUrl?: string;
  estimatedShipping?: string; // e.g., "2-3 dias"
  url?: string; // Direct link to product
  store?: string; // Store name
}

export interface PricePoint {
  name: string;
  price: number;
  store: string;
}

export interface StoreLocation {
  name: string;
  address: string;
  url?: string; // Google Maps Link
  distance?: string;
  latitude?: number;
  longitude?: number;
}

// Live API Types
export type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'error';