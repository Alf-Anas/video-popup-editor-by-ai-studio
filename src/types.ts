/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PopupCheckpoint {
  id: string;
  timestamp: string;      // HH:mm:ss format (represented cleanly to the user)
  timeInSeconds: number;  // Seconds from start
  imageUrl: string;       // Data URL or Object URL
  imageName: string;
  duration: number;       // Pause duration in seconds (e.g., 4)
  title: string;          // Optional title for the popup
  description: string;    // Optional short description for the popup
  position: PopupPosition; // Popup position overlay style
}

export type PopupPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

export interface VideoTemplate {
  id: string;
  name: string;
  url: string;
  duration: number; // in seconds
  description: string;
  category?: string;
}
