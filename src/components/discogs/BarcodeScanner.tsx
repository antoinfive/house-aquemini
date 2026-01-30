'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X } from 'lucide-react';
import { ScanOverlay } from './ScanOverlay';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onError, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    const startScanning = async () => {
      try {
        // Request camera permissions
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Prefer back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!mounted || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        // Set up video element
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Initialize barcode reader with UPC/EAN formats
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
        ]);

        const reader = new BrowserMultiFormatReader(hints);
        readerRef.current = reader;

        // Start continuous decoding using decodeFromVideoDevice
        const scan = async () => {
          try {
            const result = await reader.decodeFromVideoElement(videoRef.current!);
            if (!mounted) return;

            if (result) {
              const barcode = result.getText();
              setIsSuccess(true);
              setIsScanning(false);

              // Show success animation briefly before closing
              setTimeout(() => {
                onScan(barcode);
              }, 500);
            } else {
              // Continue scanning if no result
              if (mounted) {
                requestAnimationFrame(scan);
              }
            }
          } catch (error) {
            // Continue scanning on errors (common during scanning process)
            if (mounted) {
              requestAnimationFrame(scan);
            }
          }
        };

        // Start scanning loop
        scan();
      } catch (err) {
        if (!mounted) return;

        let message = 'Unable to access camera. Please try manual entry.';

        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            message = 'Camera permission denied. Please enable in browser settings.';
          } else if (err.name === 'NotFoundError') {
            message = 'No camera found on this device.';
          } else if (err.name === 'NotReadableError') {
            message = 'Camera is already in use by another app.';
          }
        }

        setErrorMessage(message);
        setIsScanning(false);
        onError(message);
      }
    };

    startScanning();

    // Cleanup function
    return () => {
      mounted = false;

      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Stop barcode reader
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [onScan, onError]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
        aria-label="Close scanner"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video preview */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Scan overlay with frame and instructions */}
      {!errorMessage && <ScanOverlay isScanning={isScanning} isSuccess={isSuccess} />}

      {/* Error message */}
      {errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-sm text-center">
            <p className="text-white text-sm mb-4">{errorMessage}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-brass-500 hover:bg-brass-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
