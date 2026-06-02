/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoTemplate {
  id: string;
  name: string;
  url: string;
  duration: number;
}

export const DEFAULT_VIDEO = {
  id: 'bunny-nature',
  name: 'Ocean Coast Drone Clip',
  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  duration: 15,
  description: 'Relaxing waves crashing on a beautiful coastline - perfect for a social media story.'
};

export const SAMPLE_POPUP_IMAGES = [
  {
    id: 'verified-badge',
    name: 'Verified Creator Card',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect x="0" y="0" width="300" height="200" fill="%23f0fdf4" rx="20" stroke="%2322c55e" stroke-width="4"/><circle cx="150" cy="80" r="30" fill="%2322c55e"/><path d="M142,80 L148,86 L158,74" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="150" y="140" fill="%2314532d" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">VERIFIED CREATOR</text><text x="150" y="165" fill="%2315803d" font-family="sans-serif" font-size="12" text-anchor="middle">Identity officially verified</text></svg>'
  },
  {
    id: 'trending-fire',
    name: 'Hot Story Badge',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect x="0" y="0" width="300" height="200" fill="%23fff7ed" rx="20" stroke="%23f97316" stroke-width="4"/><path d="M150,45 C150,45 165,70 165,85 C165,100 150,115 150,115 C150,115 135,100 135,85 C135,70 150,45 150,45 Z" fill="%23f97316"/><path d="M150,65 C150,65 158,80 158,90 C158,100 150,108 150,108 C150,108 142,100 142,90 C142,80 150,65 150,65 Z" fill="%23facc15"/><text x="150" y="145" fill="%237c2d12" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">TRENDING TOPIC</text><text x="150" y="170" fill="%239a3412" font-family="sans-serif" font-size="12" text-anchor="middle">Currently viral on feeds</text></svg>'
  },
  {
    id: 'location-pinned',
    name: 'Travel Spot Badge',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect x="0" y="0" width="300" height="200" fill="%23f0f9ff" rx="20" stroke="%230284c7" stroke-width="4"/><path d="M150,50 C138,50 128,60 128,72 C128,88 150,110 150,110 C150,110 172,88 172,72 C172,60 162,50 150,50 Z" fill="%23ef4444"/><circle cx="150" cy="72" r="8" fill="white"/><text x="150" y="145" fill="%230c4a6e" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">FEATURED DESTINATION</text><text x="150" y="168" fill="%230369a1" font-family="sans-serif" font-size="12" text-anchor="middle">Added to user itinerary</text></svg>'
  }
];
