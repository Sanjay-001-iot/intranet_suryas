'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: {
    name: string;
    image: string;
    upi?: string;
  };
}

export function QRCodeModal({ isOpen, onClose, qrCode }: QRModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = qrCode.image;
    link.download = `${qrCode.name.replace(/\s+/g, '_')}_QR_Code.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${qrCode.name} QR code downloaded!`);
  };

  const handleCopyUPI = () => {
    if (qrCode.upi) {
      navigator.clipboard.writeText(qrCode.upi);
      toast.success('UPI ID copied to clipboard!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isZoomed ? 'w-full max-w-2xl' : 'sm:max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💳 {qrCode.name} - Proposal
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Scan & Pay Text */}
          <p className="text-center text-lg font-semibold text-slate-700">
            Scan & Pay with any UPI App
          </p>

          {/* QR Code Image */}
          <div
            className={`bg-gray-100 p-4 rounded-lg border-2 border-gray-300 cursor-zoom-in ${
              isZoomed ? 'w-96 h-96' : 'w-64 h-64'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={qrCode.image}
              alt={`${qrCode.name} QR Code`}
              className="w-full h-full object-cover rounded"
            />
          </div>

          {/* Company Name */}
          <p className="text-center text-lg font-bold text-slate-800">
            SURYA'S MIB ENTERPRISES
          </p>

          {/* UPI ID (if available) */}
          {qrCode.upi && (
            <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-600 mb-2">UPI ID:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-slate-900 break-all">
                  {qrCode.upi}
                </code>
                <button
                  onClick={handleCopyUPI}
                  className="p-2 hover:bg-blue-100 rounded transition"
                  title="Copy UPI ID"
                >
                  <Copy size={16} className="text-blue-600" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 w-full mt-4">
            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <X size={16} />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
