'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ScanOverlayProps {
  isScanning: boolean;
  isSuccess: boolean;
}

export function ScanOverlay({ isScanning, isSuccess }: ScanOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Semi-transparent backdrop outside frame */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Scan frame container */}
      <div className="relative z-10 w-[280px] h-[200px]">
        {/* Animated corner brackets */}
        <motion.div
          className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brass-400"
          animate={isScanning ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={isScanning ? { duration: 2, repeat: Infinity } : {}}
        />
        <motion.div
          className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brass-400"
          animate={isScanning ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={isScanning ? { duration: 2, repeat: Infinity, delay: 0.5 } : {}}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brass-400"
          animate={isScanning ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={isScanning ? { duration: 2, repeat: Infinity, delay: 1 } : {}}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brass-400"
          animate={isScanning ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={isScanning ? { duration: 2, repeat: Infinity, delay: 1.5 } : {}}
        />

        {/* Success animation */}
        {isSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-green-500/20 backdrop-blur-sm rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-green-400" />
            </div>
          </motion.div>
        )}

        {/* Success flash */}
        {isSuccess && (
          <motion.div
            className="absolute inset-0 bg-green-400/30 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>

      {/* Instruction text */}
      {isScanning && !isSuccess && (
        <motion.div
          className="absolute bottom-32 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white text-sm font-medium mb-1">Position barcode within frame</p>
          <p className="text-white/70 text-xs">Scanning...</p>
        </motion.div>
      )}
    </div>
  );
}
