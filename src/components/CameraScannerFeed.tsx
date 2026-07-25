import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Download } from 'lucide-react';

export interface CameraScannerFeedProps {
  scannerId: string;
  onScanSuccess: (code: string) => void;
  isCameraActive: boolean;
  flashlightOn?: boolean;
}

export const CameraScannerFeed: React.FC<CameraScannerFeedProps> = ({
  scannerId,
  onScanSuccess,
  isCameraActive,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      if (!isCameraActive) {
        if (isMounted) setIsScanning(false);
        return;
      }

      const element = document.getElementById(scannerId);
      if (!element) return;

      try {
        html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            const now = Date.now();
            if (
              decodedText === lastScannedCodeRef.current &&
              now - lastScanTimeRef.current < 2500
            ) {
              return;
            }
            lastScannedCodeRef.current = decodedText;
            lastScanTimeRef.current = now;
            onScanSuccess(decodedText);
          },
          () => {}
        );

        if (isMounted) {
          setIsScanning(true);
          setCameraError(null);
        } else {
          // If unmounted during start, safely stop now
          try {
            if (html5QrCode.isScanning) {
              await html5QrCode.stop();
            }
          } catch (e) {
            // ignore
          }
          try {
            html5QrCode.clear();
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Camera feed failed to start:', err);
          setCameraError('Camera access not granted or webcam unavailable in current preview window.');
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      setIsScanning(false);
      if (html5QrCodeRef.current) {
        const instance = html5QrCodeRef.current;
        html5QrCodeRef.current = null;
        
        const cleanup = async () => {
          try {
            if (instance.isScanning) {
              await instance.stop();
            }
          } catch (e) {
            // ignore transition conflict
          }
          try {
            instance.clear();
          } catch (e) {
            // ignore
          }
        };
        cleanup();
      }
    };
  }, [scannerId, isCameraActive]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        let instance = html5QrCodeRef.current;
        let isTemp = false;
        if (!instance) {
          instance = new Html5Qrcode(scannerId);
          isTemp = true;
        }
        const result = await instance.scanFile(file, true);
        onScanSuccess(result);
        if (isTemp) {
          try { instance.clear(); } catch(e){}
        }
      } catch (err) {
        alert('Could not detect QR code in uploaded image file. Please ensure the file contains a clear QR code image.');
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden flex flex-col justify-center items-center">
      {/* HTML5 QR Code DOM mount point */}
      <div id={scannerId} className={`w-full h-full ${!isScanning ? 'hidden' : 'block'}`} />

      {/* Fallback / Error / Paused camera UI */}
      {(!isCameraActive || cameraError || !isScanning) && (
        <div className="p-4 text-center space-y-2 z-10 max-w-sm">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
            <Camera className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {!isCameraActive ? 'Camera Feed Paused' : 'Live Camera Scanner'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {cameraError || 'Align ticket QR code inside viewfinder, or upload QR image pass file.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <label className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition shadow-md flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Upload QR File</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Scanning Target Box */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-48 h-48 border-2 border-emerald-500 rounded-3xl relative flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse"></div>
        </div>
      )}
    </div>
  );
};
