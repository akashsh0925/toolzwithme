import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function PDFDropzone({ onFileSelect, isProcessing }: PDFDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative rounded-xl border-2 border-dashed transition-all duration-300',
        'bg-card/50 backdrop-blur-sm',
        isDragging ? 'border-primary bg-accent/50 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-accent/20',
        isProcessing && 'pointer-events-none opacity-70'
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {selectedFile ? (
          <div>
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            {!isProcessing && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="mt-4 text-sm text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={cn('w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4', isDragging && 'animate-bounce')}>
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Drop your PDF here</p>
            <p className="text-sm text-muted-foreground">or click to browse files</p>
          </>
        )}
      </div>
    </div>
  );
}
