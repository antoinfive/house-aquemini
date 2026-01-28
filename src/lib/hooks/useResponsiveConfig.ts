'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

interface ResponsiveConfig {
  itemSize: number;
  spacing: number;
}

// Shared state for responsive config to avoid duplicate resize listeners
let currentConfig: ResponsiveConfig = { itemSize: 280, spacing: 300 };
const listeners = new Set<() => void>();

function calculateConfig(): ResponsiveConfig {
  if (typeof window === 'undefined') {
    return { itemSize: 280, spacing: 300 };
  }

  const width = window.innerWidth;
  if (width < 640) {
    return { itemSize: 200, spacing: 220 };
  } else if (width < 1024) {
    return { itemSize: 240, spacing: 260 };
  }
  return { itemSize: 280, spacing: 300 };
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
  return { itemSize: 280, spacing: 300 };
}

/**
 * Shared hook for responsive carousel configuration.
 * Uses a single global resize listener instead of one per component instance.
 */
export function useResponsiveConfig(): ResponsiveConfig {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
