'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
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
  const controlsRef = useRef<IScannerControls | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startScanning = async () => {
      try {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
        ]);

        const reader = new BrowserMultiFormatReader(hints, {
          delayBetweenScanAttempts: 300,
        });
        readerRef.current = reader;

        const controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current!,
          (result, error, controls) => {
            if (!mounted) return;
            if (result) {
              const barcode = result.getText();
              controls.stop();
              setIsSuccess(true);
              setIsScanning(false);
              setTimeout(() => onScan(barcode), 500);
            }
            // NotFoundException on frames without barcodes is normal — ignore
          }
        );

        controlsRef.current = controls;
        if (!mounted) controls.stop();
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

    return () => {
      mounted = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
      BrowserMultiFormatReader.releaseAllStreams();
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
