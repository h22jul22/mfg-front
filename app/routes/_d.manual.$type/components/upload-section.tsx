import { CloudUpload, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import Success from '~/components/icons/success';
import Fail from '~/components/icons/fail';
import { Button } from '~/components/ui/button';
import { truncateFileName } from '../utils/file-utils';

interface UploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  enableDrag?: boolean;
  title?: string;
  description?: string;
  accept?: string;
  maxSize?: string;
  uploadDescription?: string;
  onUpload?: (file: File) => Promise<any>;
}

export default function UploadSection({
  file,
  setFile,
  enableDrag = true,
  title = '업로드 제목',
  description = '업로드 설명',
  accept = '.xlsx',
  maxSize = 'Limit 200MB per file - XLSX',
  uploadDescription = '서버에 업로드',
  onUpload,
}: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (selectedFile: File) => {
    if (
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      selectedFile.name.endsWith('.xlsx')
    ) {
      setFile(selectedFile);
    } else {
      toast.error('XLSX 파일만 업로드 가능합니다.', {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!enableDrag) return;
      e.preventDefault();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [enableDrag]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enableDrag) return;
      e.preventDefault();
      setIsDragOver(true);
    },
    [enableDrag]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enableDrag) return;
      e.preventDefault();
      setIsDragOver(false);
    },
    [enableDrag]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = async () => {
    if (!file || !onUpload || isUploading) return;
    try {
      setIsUploading(true);
      await onUpload(file);
      toast.success('파일을 성공적으로 업로드했어요.', {
        className: 'success-toast',
        position: 'bottom-right',
        icon: <Success style={{ width: 24, height: 24 }} />,
      });
      handleRemoveFile();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '업로드 중 오류가 발생했어요.';
      toast.error(msg, {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='flex w-full flex-col items-center'>
      <h1 className='text-center text-[24px] font-[600] leading-[30px]'>{title}</h1>
      <p className='my-[24px] text-center text-[16px] font-[400] leading-[24px] text-grey-500'>{description}</p>

      <input ref={fileInputRef} type='file' accept={accept} className='hidden' onChange={handleFileInputChange} />

      <div
        className={`flex w-full max-w-[750px] items-center justify-between rounded-[8px] border-2 border-dashed bg-slate-100 p-[24px_16px] transition-colors ${
          isDragOver ? 'border-blue-400 bg-blue-50' : 'border-transparent'
        }`}
        onDrop={enableDrag ? handleDrop : undefined}
        onDragOver={enableDrag ? handleDragOver : undefined}
        onDragLeave={enableDrag ? handleDragLeave : undefined}
      >
        <div className='flex items-center gap-2'>
          <Upload className='size-[32px]' color='var(--grey400)' />
          <div className='flex flex-col gap-2'>
            <p className='text-[16px] font-[600] text-grey-800'>
              {file ? truncateFileName(file.name) : 'Drag and drop file here'}
            </p>
            <p className='text-[12px] font-[400] text-grey-600'>{file ? formatFileSize(file.size) : maxSize}</p>
          </div>
        </div>

        <div className='flex items-center justify-center gap-2'>
          <div className='h-[42px] w-[1px] bg-grey-300' />
          {file ? (
            <div className='flex gap-2'>
              <Button
                className='border-l border-grey-300 pl-[12px]'
                type='button'
                variant='outline'
                onClick={handleRemoveFile}
              >
                <p>삭제</p>
              </Button>
            </div>
          ) : (
            <Button
              className='border-l border-grey-300 pl-[12px]'
              type='button'
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
            >
              <p>Browse Files</p>
            </Button>
          )}
        </div>
      </div>
      <Button
        disabled={!file || isUploading}
        variant='outline'
        className='mt-[32px] flex items-center gap-1'
        onClick={handleUploadClick}
      >
        <CloudUpload width={20} height={20} color='var(--grey500)' />
        {isUploading ? '업로드 중…' : uploadDescription}
      </Button>
    </div>
  );
}
