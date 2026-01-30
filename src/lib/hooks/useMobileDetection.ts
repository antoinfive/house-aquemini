'use client';

import { useSyncExternalStore, useEffect } from 'react';

interface MobileDetectionState {
  isMobile: boolean;
  hasCamera: boolean;
  isSupported: boolean;
}

// Cached states to prevent object recreation and infinite loops
const STATE_MOBILE_WITH_CAMERA: MobileDetectionState = {
  isMobile: true,
  hasCamera: true,
  isSupported: true,
};
const STATE_MOBILE_NO_CAMERA: MobileDetectionState = {
  isMobile: true,
  hasCamera: false,
  isSupported: false,
};
const STATE_DESKTOP: MobileDetectionState = {
  isMobile: false,
  hasCamera: false,
  isSupported: false,
};

// Shared state for mobile detection to avoid duplicate resize listeners
let currentState: MobileDetectionState = STATE_DESKTOP;
let cameraCheckInProgress = false;
let cameraCheckComplete = false;
const listeners = new Set<() => void>();

function checkCameraAvailability(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return Promise.resolve(false);
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return Promise.resolve(false);
  }

  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => devices.some((device) => device.kind === 'videoinput'))
    .catch(() => false);
}

function updateStateWithCamera(hasCamera: boolean) {
  const newState = hasCamera ? STATE_MOBILE_WITH_CAMERA : STATE_MOBILE_NO_CAMERA;
  if (
    newState.hasCamera !== currentState.hasCamera ||
    newState.isSupported !== currentState.isSupported
  ) {
    currentState = newState;
    listeners.forEach((listener) => listener());
  }
}

function initializeCameraCheck() {
  if (cameraCheckInProgress || cameraCheckComplete) {
    return;
  }

  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const isMobile = width < 1024;

  if (!isMobile) {
    currentState = STATE_DESKTOP;
    cameraCheckComplete = true;
    return;
  }

  cameraCheckInProgress = true;
  checkCameraAvailability().then((hasCamera) => {
    cameraCheckInProgress = false;
    cameraCheckComplete = true;
    updateStateWithCamera(hasCamera);
  });
}

function handleResize() {
  if (typeof window === 'undefined') return;

  const width = window.innerWidth;
  const isMobile = width < 1024;

  if (!isMobile && currentState.isMobile) {
    // Switched from mobile to desktop
    currentState = STATE_DESKTOP;
    listeners.forEach((listener) => listener());
  } else if (isMobile && !currentState.isMobile) {
    // Switched from desktop to mobile - trigger camera check
    currentState = STATE_MOBILE_NO_CAMERA;
    cameraCheckComplete = false;
    initializeCameraCheck();
    listeners.forEach((listener) => listener());
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  const width = window.innerWidth;
  const isMobile = width < 1024;
  currentState = isMobile ? STATE_MOBILE_NO_CAMERA : STATE_DESKTOP;
  window.addEventListener('resize', handleResize);
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  // Trigger camera check when first listener subscribes
  if (listeners.size === 1 && currentState.isMobile && !cameraCheckComplete) {
    initializeCameraCheck();
  }

  return () => listeners.delete(callback);
}

function getSnapshot(): MobileDetectionState {
  return currentState;
}

function getServerSnapshot(): MobileDetectionState {
  return STATE_DESKTOP;
}

/**
 * Shared hook for mobile detection and camera availability.
 * Uses a single global resize listener instead of one per component instance.
 * Returns cached state objects to prevent rerenders.
 */
export function useMobileDetection(): MobileDetectionState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Ensure camera check runs on mount for mobile devices
  useEffect(() => {
    if (state.isMobile && !cameraCheckComplete && !cameraCheckInProgress) {
      initializeCameraCheck();
    }
  }, [state.isMobile]);

  return state;
}
