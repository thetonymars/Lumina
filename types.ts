
export enum DesignStyle {
  MID_CENTURY = 'Mid-Century Modern',
  SCANDINAVIAN = 'Scandinavian',
  INDUSTRIAL = 'Industrial',
  BOHEMIAN = 'Bohemian',
  MINIMALIST = 'Minimalist',
  JAPANDI = 'Japandi',
  ART_DECO = 'Art Deco'
}

export interface DesignHistoryItem {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
}

export interface ProductRecommendation {
  title: string;
  price?: string;
  url: string;
  description: string;
}

export interface DesignState {
  originalImage: string | null;
  currentImage: string | null;
  history: DesignHistoryItem[];
  selectedStyle: DesignStyle;
  isGenerating: boolean;
  isSearching: boolean;
  recommendations: ProductRecommendation[];
}
