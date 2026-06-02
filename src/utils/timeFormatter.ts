/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a given time in seconds to HH:mm:ss
 */
export function formatSecondsToHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0')
  ].join(':');
}

/**
 * Formats seconds into a shorter visual display (e.g., 01:15 instead of 00:01:15 if hours are 0)
 */
export function formatSecondsShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Parses time strings of formats:
 * - HHmmss (e.g., "000130" -> 90s)
 * - HH:mm:ss (e.g., "00:01:30" -> 90s)
 * - mm:ss (e.g., "01:30" -> 90s)
 * - ss (e.g., "90" -> 90s)
 */
export function parseTimeToSeconds(timeStr: string): number {
  // Strip non-digit characters to check for raw HHmmss
  const cleaned = timeStr.trim();
  
  // If it's a raw 6-digit or 4-digit number like "0130" or "000130"
  if (/^\d+$/.test(cleaned)) {
    if (cleaned.length === 6) {
      // HHmmss
      const h = parseInt(cleaned.slice(0, 2), 10);
      const m = parseInt(cleaned.slice(2, 4), 10);
      const s = parseInt(cleaned.slice(4, 6), 10);
      return h * 3600 + m * 60 + s;
    } else if (cleaned.length === 4) {
      // mmss
      const m = parseInt(cleaned.slice(0, 2), 10);
      const s = parseInt(cleaned.slice(2, 4), 10);
      return m * 60 + s;
    } else {
      // Just seconds
      return parseInt(cleaned, 10) || 0;
    }
  }

  // Handle colon-separated values e.g., "01:23:45" or "12:34"
  const parts = cleaned.split(':').map(p => parseInt(p, 10) || 0);
  
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return 0;
}

/**
 * Validates if the user's string is in any correct time format
 */
export function isValidTimeFormat(timeStr: string): boolean {
  const cleaned = timeStr.trim();
  if (!cleaned) return false;
  
  // Format 1: raw digits 4 or 6 chars
  if (/^\d{4}$/.test(cleaned) || /^\d{6}$/.test(cleaned)) {
    // Validate bounds (HHmmss -> hours, minutes < 60, seconds < 60)
    if (cleaned.length === 6) {
      const m = parseInt(cleaned.slice(2, 4), 10);
      const s = parseInt(cleaned.slice(4, 6), 10);
      return m < 60 && s < 60;
    }
    if (cleaned.length === 4) {
      const s = parseInt(cleaned.slice(2, 4), 10);
      return s < 60;
    }
    return true;
  }
  
  // Format 2: colon separated HH:mm:ss or mm:ss
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const s = parseInt(cleaned.split(':')[1], 10);
    return s < 60;
  }
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(cleaned)) {
    const parts = cleaned.split(':');
    const m = parseInt(parts[1], 10);
    const s = parseInt(parts[2], 10);
    return m < 60 && s < 60;
  }
  
  // Format 3: raw single digits (treated as total seconds)
  if (/^\d+$/.test(cleaned)) {
    return true;
  }
  
  return false;
}
