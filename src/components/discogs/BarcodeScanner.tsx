'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X } from 'lucide-react';
import { ScanOverlay } from './ScanOverlay';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
  continuous?: boolean;
  addedCount?: number;
  lastAddedLabel?: string | null;
}

export function BarcodeScanner({
  onScan,
  onError,
  onClose,
  continuous = false,
  addedCount = 0,
  lastAddedLabel = null,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const processingRef = useRef(false);
  const recentBarcodesRef = useRef<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const handleScanResult = useCallback(
    (barcode: string, controls: IScannerControls) => {
      if (continuous) {
        // In continuous mode: gate on processing and dedup
        if (processingRef.current) return;
        if (recentBarcodesRef.current.has(barcode)) return;

        processingRef.current = true;
        recentBarcodesRef.current.add(barcode);

        setIsSuccess(true);
        onScanRef.current(barcode);

        // Reset success animation after 1.5s
        setTimeout(() => {
          setIsSuccess(false);
          processingRef.current = false;
        }, 1500);

        // Remove barcode from recent set after 5s
        setTimeout(() => {
          recentBarcodesRef.current.delete(barcode);
        }, 5000);

        // Do NOT stop the scanner
      } else {
        // Original single-scan behavior
        controls.stop();
        setIsSuccess(true);
        setIsScanning(false);
        setTimeout(() => onScanRef.current(barcode), 500);
      }
    },
    [continuous]
  );

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
          (result, _error, controls) => {
            if (!mounted) return;
            if (result) {
              const barcode = result.getText();
              handleScanResult(barcode, controls);
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
        onErrorRef.current(message);
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
  }, [handleScanResult]);

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
      {!errorMessage && (
        <ScanOverlay
          isScanning={isScanning}
          isSuccess={isSuccess}
          continuous={continuous}
          addedCount={addedCount}
          lastAddedLabel={lastAddedLabel}
        />
      )}

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
