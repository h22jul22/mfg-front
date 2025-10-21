import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Success from '~/components/icons/success';
import { Button } from '~/components/ui/button';
import { CheckboxBlack } from '~/components/ui/checkbox-black';

import { ManualFile, MOCK_MANUAL_FILES } from '../const/mock-data';
import { truncateFileName } from '../utils/file-utils';

const columns = [
  { key: 'fileName', label: '파일명', width: '300px' },
  { key: 'equipmentNumber', label: '장비번호', width: '150px' },
  { key: 'equipmentName', label: '장비명', width: '200px' },
  { key: 'category', label: '구분', width: '120px' },
  { key: 'roomName', label: '실명', width: '150px' },
  { key: 'roomNumber', label: '실번호', width: '100px' },
];

const DeleteManual = () => {
  const [manualFiles, setManualFiles] = useState<ManualFile[]>(MOCK_MANUAL_FILES);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFiles(new Set());
      setIsAllSelected(false);
    } else {
      const allFileIds = new Set(manualFiles.map((file) => file.id));
      setSelectedFiles(allFileIds);
      setIsAllSelected(true);
    }
  };

  const handleSelectFile = (fileId: string) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (newSelectedFiles.has(fileId)) {
      newSelectedFiles.delete(fileId);
    } else {
      newSelectedFiles.add(fileId);
    }
    setSelectedFiles(newSelectedFiles);
    setIsAllSelected(newSelectedFiles.size === manualFiles.length);
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.size === 0) return;

    //TODO: 실제 삭제 로직 추가 필요
    const remainingFiles = manualFiles.filter((file) => !selectedFiles.has(file.id));
    setManualFiles(remainingFiles);
    setSelectedFiles(new Set());
    setIsAllSelected(false);
    toast.success(`${selectedFiles.size}건의 메뉴얼을 삭제했어요.`, {
      className: 'success-toast',
      position: 'bottom-right',
      icon: <Success style={{ width: 24, height: 24 }} />,
    });
  };

  return (
    <div className='w-full'>
      {/* 제목 */}
      <h1 className='text-center text-[24px] font-[600] leading-[30px]'>업로드된 장비 메뉴얼 삭제</h1>
      {/* 선택 파일 삭제 버튼 */}
      <div className='mb-4'>
        <Button
          variant='outline'
          onClick={handleDeleteSelected}
          disabled={selectedFiles.size === 0}
          className='border-grey-500 text-grey-900 border hover:text-black'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          선택 파일 삭제
        </Button>
      </div>

      {/* 테이블 */}
      <div className='w-full rounded-[8px] border border-[var(--grey300)]'>
        <div className='overflow-x-auto'>
          <table className='w-full table-fixed border-collapse text-sm'>
            <thead className='sticky top-0 z-10 border-b bg-[var(--grey50)]'>
              <tr className='h-[60px]'>
                {/* 체크박스 + 번호 헤더 */}
                <th className='border-grey-300 w-[80px] border-r-2 px-[10px] text-left font-normal text-[var(--grey500)] last:border-r-0'>
                  <div className='flex items-center gap-2'>
                    <CheckboxBlack
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className='!data-[state=checked]:bg-black cursor-pointer'
                      iconSize={10}
                    />
                  </div>
                </th>

                {/* 나머지 컬럼 헤더들 */}
                {columns.map((col) => (
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
              {manualFiles.length > 0 ? (
                manualFiles.map((file, index) => (
                  <tr key={file.id} className='h-[60px] border-b border-b-[var(--grey300)] last:border-b-0'>
                    {/* 체크박스 + 번호 */}
                    <td className='border-grey-300 border-r-2 px-[10px] text-left leading-[20px]'>
                      <div className='flex items-center gap-2'>
                        <CheckboxBlack
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => handleSelectFile(file.id)}
                          iconSize={10}
                          className='!data-[state=checked]:bg-black cursor-pointer'
                        />
                        <span className='text-sm text-gray-600'>{index + 1}</span>
                      </div>
                    </td>

                    {/* 나머지 데이터 */}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-[10px] leading-[20px] ${col.width ? `w-[${col.width}]` : ''} text-left ${
                          col.key === 'category' && file.category === 'None' ? 'text-grey-300' : ''
                        }`}
                      >
                        {col.key === 'fileName'
                          ? truncateFileName(file[col.key as keyof ManualFile] as string)
                          : file[col.key as keyof ManualFile]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className='text-grey-500 py-8 text-center'>
                    삭제할 파일이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeleteManual;
