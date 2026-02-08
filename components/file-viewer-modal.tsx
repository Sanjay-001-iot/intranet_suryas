'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, FileText, Image } from 'lucide-react';

interface FileViewerModalProps {
  file?: {
    name: string;
    type: string;
    base64: string;
  };
  onClose: () => void;
}

export default function FileViewerModal({ file, onClose }: FileViewerModalProps) {
  if (!file) return null;

  const downloadFile = () => {
    try {
      const link = document.createElement('a');
      link.href = file.base64;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-4xl max-h-96 p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {isImage ? <Image size={20} /> : <FileText size={20} />}
              {file.name}
            </h2>
            <p className="text-xs text-slate-500">{file.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 rounded p-4 max-h-64">
          {isPdf ? (
            <embed
              src={file.base64}
              type="application/pdf"
              width="100%"
              height="400"
              className="rounded"
            />
          ) : isImage ? (
            <img
              src={file.base64}
              alt={file.name}
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="text-center text-slate-500 py-8">
              <FileText size={48} className="mx-auto mb-2 opacity-50" />
              <p>Preview not available for this file type</p>
              <p className="text-sm">{file.type}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t pt-4">
          <Button
            onClick={downloadFile}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download size={16} className="mr-2" />
            Download File
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
