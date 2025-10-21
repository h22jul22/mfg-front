import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import Fail from '~/components/icons/fail';
import { Button } from '~/components/ui/button';

import { truncateFileName } from '../utils/file-utils';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface FileUploadSectionProps {
  currentFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export default function FileUploadSection({ currentFile, onFileSelect, onFileRemove }: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ['.csv', '.xlsx', '.txt', '.pdf'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

    if (allowedTypes.includes(fileExtension)) {
      onFileSelect(selectedFile);
    } else {
      toast.error('CSV, XLSX, TXT, PDF 파일만 업로드 가능합니다.', {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-[750px]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.txt,.pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div
        className={`w-full flex items-center justify-between bg-slate-100 p-[24px_16px] rounded-[8px] border-2 border-dashed transition-colors ${
          isDragOver ? 'border-blue-400 bg-blue-50' : 'border-transparent'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center gap-2">
          <Upload className="size-[32px]" color="var(--grey400)" />
          <div className="flex flex-col gap-2">
            <p className="text-[16px] font-[600] text-grey-800">
              {currentFile ? truncateFileName(currentFile.name) : 'Drag and drop file here'}
            </p>
            <p className="text-[12px] font-[400] text-grey-600">
              {currentFile ? formatFileSize(currentFile.size) : 'Limit 200MB per file - CSV, XLSX, TXT, PDF'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="w-[1px] h-[42px] bg-grey-300" />
          {currentFile ? (
            <Button
              className="border-l border-grey-300 pl-[12px]"
              type="button"
              variant="outline"
              onClick={handleRemoveFile}
            >
              <p>삭제</p>
            </Button>
          ) : (
            <Button
              className="border-l border-grey-300 pl-[12px]"
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <p>Browse Files</p>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
