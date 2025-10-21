import { CloudUpload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Success from '~/components/icons/success';
import { Button } from '~/components/ui/button';

import { UploadFile } from '../const/upload-types';
import { truncateFileName } from '../utils/file-utils';

interface UploadFilesTableProps {
  uploadFiles: UploadFile[];
  onUploadToServer: () => void;
}

const tableColumns = [
  { key: 'fileName', label: '파일명', width: '200px' },
  { key: 'equipmentNumber', label: '장비번호', width: '120px' },
  { key: 'equipmentName', label: '장비명', width: '180px' },
  { key: 'category', label: '구분', width: '100px' },
  { key: 'description', label: '설명', width: '150px' },
  { key: 'roomNumber', label: '실번호', width: '100px' },
  { key: 'selectedLanguage', label: 'selected_language', width: '120px' },
];

export default function UploadFilesTable({ uploadFiles, onUploadToServer }: UploadFilesTableProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  if (uploadFiles.length === 0) return null;

  const handleUploadToServer = () => {
    if (uploadFiles.length === 0) {
      toast.error('업로드할 파일이 없습니다.', {
        className: 'fail-toast',
        position: 'bottom-right',
      });
      return;
    }

    // TODO: 실제 서버 업로드 로직 구현
    toast.success(`${uploadFiles.length}개의 파일을 서버에 업로드했습니다.`, {
      className: 'success-toast',
      position: 'bottom-right',
      icon: <Success style={{ width: 24, height: 24 }} />,
    });
    onUploadToServer();
    setIsSubmitted(true);
  };

  return (
    <div className='w-full max-w-[1200px]'>
      <h2 className='mb-9 mt-4 text-center text-[24px] font-[600] leading-[26px]'>업로드할 파일 리스트</h2>

      <div className='w-full rounded-[8px] border border-[var(--grey300)]'>
        <div className='overflow-x-auto'>
          <table className='w-full table-fixed border-collapse text-sm'>
            <thead className='sticky top-0 z-10 border-b bg-[var(--grey50)]'>
              <tr className='h-[60px]'>
                {tableColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-[10px] font-normal text-[var(--grey500)] ${
                      col.width ? `w-[${col.width}]` : ''
                    } text-left`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploadFiles.map((file) => (
                <tr key={file.id} className='h-[60px] border-b border-b-[var(--grey300)] last:border-b-0'>
                  {tableColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-[10px] leading-[20px] ${col.width ? `w-[${col.width}]` : ''} text-left`}
                    >
                      {col.key === 'fileName'
                        ? truncateFileName(file[col.key as keyof UploadFile] as string)
                        : file[col.key as keyof UploadFile]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 서버 업로드 버튼 */}
      <div className='mt-6 flex justify-center'>
        <Button
          disabled={isSubmitted}
          variant='outline'
          onClick={handleUploadToServer}
          className='flex items-center gap-2'
        >
          <CloudUpload className='h-4 w-4' color='var(--grey500)' />
          추가된 파일 서버 업로드
        </Button>
      </div>
    </div>
  );
}
