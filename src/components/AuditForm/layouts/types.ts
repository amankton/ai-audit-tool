export type LayoutVariant = 'centered' | 'split';

export interface LayoutConfig {
  variant: LayoutVariant;
  title: string;
  description: string;
}

export const LAYOUT_OPTIONS: Record<LayoutVariant, LayoutConfig> = {
  centered: {
    variant: 'centered',
    title: 'Centered Layout',
    description: 'Traditional centered form with header above'
  },
  split: {
    variant: 'split',
    title: '2-Panel Layout',
    description: 'Symmetrical split-screen with balanced panels'
  }
};
