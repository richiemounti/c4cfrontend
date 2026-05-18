// types/taxonomy.ts
import { User } from './index';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  creator: string | User;
  status: 'draft' | 'published' | 'archived';
  inclusion?: string[];
  estimatedPopulation?: number; // NEW FIELD
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// types/taxonomy.ts
export interface Evidence {
  source?: string;
  url?: string[]; // Changed from string to string[]
  details?: string;
}

export interface Indicator {
  _id: string;
  name: string;
  description?: string;
  evidence?: Evidence | null;
  creator: string | User;
  status: 'active' | 'inactive';
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


// types/taxonomy.ts
export interface Theme {
  _id: string;
  name: string;
  description?: string;
  theoryOfChangeStage?: 'Stage 1 - Output' | 'Stage 2 - Outcome' | 'Both';
  creator: string | User;
  status: 'draft' | 'published' | 'archived';
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTheme {
  _id: string;
  name: string;
  description?: string;
  theme: string | Theme;
  theoryOfChangeStage: 'Stage 1 - Output' | 'Stage 2 - Outcome' | 'Both'; // added 'Both'
  indicatorTags: string[] | Indicator[];
  sdgTags: string[] | SDG[];
  resilienceTags: string[] | ResilienceDimension[];
  esgTags: string[] | ESGCategory[];
  standardTags: string[] | Standard[];
  creator: string | User;
  status: 'draft' | 'published' | 'archived';
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


// types/taxonomy.ts (Add to existing file)

// ESG Category
export interface ESGCategory {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'Environmental' | 'Social' | 'Governance';
  status: 'active' | 'inactive';
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Updated ResilienceDimension interface
export interface ResilienceDimension {
  _id: string;
  code: string;
  name: string;
  description?: string;
  capacityTypes: 'absorptive_capacity' | 'adaptive_capacity' | 'transformative_capacity';
  category: string; // Changed from enum to string for custom categories
  // New optional fields
  linkToPvModel?: string;
  resilienceIndexCriteria?: string;
  indicatorExamples?: string;
  status: 'active' | 'inactive';
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// SDG
export interface SDG {
  _id: string;
  code: string;
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  status: 'active' | 'inactive';
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Standard
export interface Standard {
  _id: string;
  code: string;
  name: string;
  description?: string;
  issuingBody: string;
  website?: string;
  version?: string;
  publishedYear?: number | undefined;
  status: 'active' | 'inactive';
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaxonomyStatus = 'active' | 'inactive' | 'draft' | 'published' | 'archived' | 'all';

export const INCLUSION_OPTIONS = [
  'people with disability',
  'women and girls',
  'LGBTQ',
  'young people',
  'indigenous persons'
] as const;

export type InclusionOption = typeof INCLUSION_OPTIONS[number];