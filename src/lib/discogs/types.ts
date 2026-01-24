// Discogs API response types

export interface DiscogsArtist {
  id: number;
  name: string;
  anv: string; // Artist name variation
  join: string;
  role: string;
  tracks: string;
  resource_url: string;
}

export interface DiscogsLabel {
  id: number;
  name: string;
  catno: string; // Catalog number
  entity_type: string;
  entity_type_name: string;
  resource_url: string;
}

export interface DiscogsFormat {
  name: string;
  qty: string;
  text?: string;
  descriptions?: string[];
}

export interface DiscogsTrack {
  position: string;
  type_: string;
  title: string;
  duration: string;
  extraartists?: DiscogsArtist[];
}

export interface DiscogsImage {
  type: 'primary' | 'secondary';
  uri: string;
  uri150: string;
  width: number;
  height: number;
  resource_url: string;
}

export interface DiscogsVideo {
  uri: string;
  title: string;
  description: string;
  duration: number;
  embed: boolean;
}

// Search result from Discogs database search
export interface DiscogsSearchResult {
  id: number;
  type: 'release' | 'master' | 'artist' | 'label';
  master_id?: number;
  master_url?: string;
  title: string;
  thumb: string;
  cover_image: string;
  resource_url: string;
  uri: string;
  country?: string;
  year?: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  style?: string[];
  catno?: string;
  barcode?: string[];
  community?: {
    want: number;
    have: number;
  };
}

export interface DiscogsSearchResponse {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
    urls: {
      first?: string;
      prev?: string;
      next?: string;
      last?: string;
    };
  };
  results: DiscogsSearchResult[];
}

// Full release details
export interface DiscogsRelease {
  id: number;
  status: string;
  year: number;
  resource_url: string;
  uri: string;
  artists: DiscogsArtist[];
  artists_sort: string;
  labels: DiscogsLabel[];
  formats: DiscogsFormat[];
  community: {
    have: number;
    want: number;
    rating: {
      count: number;
      average: number;
    };
    submitter: {
      username: string;
      resource_url: string;
    };
    contributors: {
      username: string;
      resource_url: string;
    }[];
    data_quality: string;
    status: string;
  };
  format_quantity: number;
  date_added: string;
  date_changed: string;
  num_for_sale: number;
  lowest_price: number | null;
  master_id?: number;
  master_url?: string;
  title: string;
  country?: string;
  released?: string;
  released_formatted?: string;
  notes?: string;
  identifiers: {
    type: string;
    value: string;
    description?: string;
  }[];
  videos?: DiscogsVideo[];
  genres: string[];
  styles: string[];
  tracklist: DiscogsTrack[];
  extraartists?: DiscogsArtist[];
  images?: DiscogsImage[];
  thumb: string;
  estimated_weight?: number;
  blocked_from_sale?: boolean;
}

// API error response
export interface DiscogsError {
  message: string;
}

// Rate limit info from headers
export interface DiscogsRateLimit {
  limit: number;
  used: number;
  remaining: number;
}
