'use client';

import { useSyncExternalStore } from 'react';

interface ResponsiveConfig {
  itemSize: number;
  spacing: number;
}

// Cached configs to prevent object recreation and infinite loops
const CONFIG_MOBILE: ResponsiveConfig = { itemSize: 200, spacing: 220 };
const CONFIG_TABLET: ResponsiveConfig = { itemSize: 240, spacing: 260 };
const CONFIG_DESKTOP: ResponsiveConfig = { itemSize: 280, spacing: 300 };

// Shared state for responsive config to avoid duplicate resize listeners
let currentConfig: ResponsiveConfig = CONFIG_DESKTOP;
const listeners = new Set<() => void>();

function calculateConfig(): ResponsiveConfig {
  if (typeof window === 'undefined') {
    return CONFIG_DESKTOP;
  }

  const width = window.innerWidth;
  if (width < 640) {
    return CONFIG_MOBILE;
  } else if (width < 1024) {
    return CONFIG_TABLET;
  }
  return CONFIG_DESKTOP;
}

function handleResize() {
  const newConfig = calculateConfig();
  if (newConfig.itemSize !== currentConfig.itemSize || newConfig.spacing !== currentConfig.spacing) {
    currentConfig = newConfig;
    listeners.forEach((listener) => listener());
  }
}

// Initialize resize listener once globally
if (typeof window !== 'undefined') {
  currentConfig = calculateConfig();
  window.addEventListener('resize', handleResize);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): ResponsiveConfig {
  return currentConfig;
}

function getServerSnapshot(): ResponsiveConfig {
  return CONFIG_DESKTOP;
}

/**
 * Shared hook for responsive carousel configuration.
 * Uses a single global resize listener instead of one per component instance.
 */
export function useResponsiveConfig(): ResponsiveConfig {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
