import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { Trash2 } from 'lucide-react';
import Success from '~/components/icons/success';
import Fail from '~/components/icons/fail';
import { Button } from '~/components/ui/button';
import { CheckboxBlack } from '~/components/ui/checkbox-black';
import { truncateFileName } from '../utils/file-utils';
import { deleteVector, fetchUploadedFilesInfo } from '~/lib/api';
import { Equipment, ManualFile } from '../const/upload-types';
import { TableBodySkeleton } from './table-skeleton';

const columns = [
  { key: 'fileName', label: '파일명', width: '250px' },
  { key: 'equipmentNumber', label: '장비번호', width: '150px' },
  { key: 'equipmentName', label: '장비명', width: '200px' },
  { key: 'category', label: '구분', width: '120px' },
  { key: 'roomName', label: '실명', width: '120px' },
  { key: 'roomNumber', label: '실번호', width: '100px' },
];

const DeleteManual = () => {
  const [manualFiles, setManualFiles] = useState<ManualFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    if (isFetching) t = setTimeout(() => setShowLoading(true), 150);
    else setShowLoading(false);
    return () => {
      if (t) clearTimeout(t);
    };
  }, [isFetching]);

  // 업로드된 장비 메뉴얼 파일 목록 호출
  useEffect(() => {
    const load = async () => {
      setIsFetching(true);
      try {
        const res = await fetchUploadedFilesInfo();

        const list: ManualFile[] = (res.response.file_data ?? []).map((e: Equipment) => ({
          id: String(e.file_name ?? e.equip_no),
          fileName: String(e.file_name ?? '-'),
          equipmentNumber: String(e.equip_no ?? '-'),
          equipmentName: String(e.equipment_name ?? '-'),
          category: String(e.category ?? '-'),
          roomName: String(e.room_name ?? '-'),
          roomNumber: String(e.room_number ?? '-'),
        }));
        setManualFiles(list);
        setSelectedFiles(new Set());
        setIsAllSelected(false);
      } catch {
        toast.error('업로드된 파일 목록을 불러오지 못했어요.', {
          className: 'fail-toast',
          position: 'bottom-right',
          icon: <Fail style={{ width: 24, height: 24 }} />,
        });
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, []);

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

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0 || isDeleting) return;

    setIsDeleting(true);
    const ids = Array.from(selectedFiles);

    // 화면 데이터에서 fileName을 찾아서 API 호출
    const toDelete = manualFiles.filter((f) => ids.includes(f.id));

    // 병렬 호출 + 결과 집계
    const results = await Promise.allSettled(toDelete.map((f) => deleteVector(f.fileName)));

    // 성공/실패 카운트
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const fail = results.length - ok;

    // 성공한 것만 화면에서 제거
    const successFileNames = new Set(
      toDelete.map((f, i) => (results[i].status === 'fulfilled' ? f.id : null)).filter(Boolean) as string[]
    );

    setManualFiles((prev) => prev.filter((f) => !successFileNames.has(f.id)));
    setSelectedFiles(new Set());
    setIsAllSelected(false);
    setIsDeleting(false);

    if (ok > 0) {
      toast.success(`${ok}건의 메뉴얼을 삭제했어요.`, {
        className: 'success-toast',
        position: 'bottom-right',
        icon: <Success style={{ width: 24, height: 24 }} />,
      });
    }
    if (fail > 0) {
      toast.error(`${fail}건 삭제에 실패했어요. 다시 시도해주세요.`, {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
    }
  };

  const dataColCount = columns.length;
  const isInitialLoading = showLoading && manualFiles.length === 0;

  return (
    <div className='w-full'>
      {/* 제목 */}
      <h1 className='text-center text-[24px] font-[600] leading-[30px]'>업로드된 장비 메뉴얼 삭제</h1>
      {/* 선택 파일 삭제 버튼 */}
      <div className='mb-4'>
        <Button
          variant='outline'
          onClick={handleDeleteSelected}
          disabled={selectedFiles.size === 0 || isDeleting || isFetching}
          className='border border-grey-500 text-grey-900 hover:text-black'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          {isDeleting ? '삭제 중…' : '선택 파일 삭제'}
        </Button>
      </div>

      {/* 테이블 */}
      <div className='w-full rounded-[8px] border border-[var(--grey300)]'>
        <div className='overflow-x-auto'>
          <table className='w-full table-fixed border-collapse text-sm'>
            <thead className='sticky top-0 z-10 border-b bg-[var(--grey50)]'>
              <tr className='h-[60px]'>
                {/* 체크박스 + 번호 헤더 */}
                <th className='w-[80px] border-r-2 border-grey-300 px-[10px] text-left font-normal text-[var(--grey500)] last:border-r-0'>
                  <div className='flex items-center gap-2'>
                    <CheckboxBlack
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={isFetching || isDeleting || manualFiles.length === 0}
                      className='!data-[state=checked]:bg-black cursor-pointer'
                      iconSize={10}
                    />
                  </div>
                </th>

                {/* 나머지 컬럼 헤더들 */}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={twMerge('px-[10px] text-left font-normal text-[var(--grey500)]')}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {isInitialLoading ? (
              <TableBodySkeleton rows={8} cols={dataColCount} />
            ) : (
              <tbody>
                {manualFiles.length > 0 ? (
                  manualFiles.map((file, index) => (
                    <tr
                      key={`${index}-${file.id}`}
                      className='h-[60px] border-b border-b-[var(--grey300)] last:border-b-0'
                    >
                      {/* 체크박스 + 번호 */}
                      <td className='border-r-2 border-grey-300 px-[10px] text-left leading-[20px]'>
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
                          className={twMerge(
                            'px-[10px] text-left leading-[20px]',
                            col.key === 'category' && file.category === 'None' ? 'text-grey-300' : ''
                          )}
                          style={{ width: col.width }}
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
                    <td colSpan={columns.length + 1} className='py-8 text-center text-grey-500'>
                      삭제할 파일이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeleteManual;
