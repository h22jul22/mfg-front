import { FilePlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Fail from '~/components/icons/fail';
import { Button } from '~/components/ui/button';

import { FileMetadata, UploadFile } from '../const/upload-types';
import FileUploadSection from './file-upload-section';
import MetadataSelection from './metadata-selection';
import UploadFilesTable from './upload-files-table';
import { truncateFileName } from '../utils/file-utils';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function UploadManual() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata>({
    language: '',
    category: '',
    description: '',
    roomNumber: '',
    equipmentName: '',
    equipmentNumber: '',
  });
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
  };

  const handleFileRemove = () => {
    setCurrentFile(null);
  };

  const handleAddFile = () => {
    if (!currentFile) return;

    // 필수 필드 검증
    if (
      !metadata.language ||
      !metadata.category ||
      !metadata.description ||
      !metadata.roomNumber ||
      !metadata.equipmentName ||
      !metadata.equipmentNumber
    ) {
      toast.error('모든 필드를 선택해주세요.', {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
      return;
    }

    // 중복 파일명 검증
    const isDuplicate = uploadFiles.some((file) => file.fileName === currentFile.name);
    if (isDuplicate) {
      toast.error(`"${truncateFileName(currentFile.name)}" 파일은 이미 추가되었습니다.`, {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
      return;
    }

    const newUploadFile: UploadFile = {
      id: Date.now().toString(),
      fileName: currentFile.name,
      fileSize: formatFileSize(currentFile.size),
      equipmentNumber: metadata.equipmentNumber,
      equipmentName: metadata.equipmentName,
      category: metadata.category,
      description: metadata.description,
      roomNumber: metadata.roomNumber,
      selectedLanguage: metadata.language,
    };

    setUploadFiles((prev) => [...prev, newUploadFile]);

    // 메타데이터 초기화
    setMetadata({
      language: '',
      category: '',
      description: '',
      roomNumber: '',
      equipmentName: '',
      equipmentNumber: '',
    });
    setCurrentFile(null);
  };

  const handleUploadToServer = () => {
    // 업로드할 파일이 있는지 확인
    if (uploadFiles.length === 0) {
      toast.error('업로드할 파일이 없습니다.', {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
      return;
    }

    // 모든 상태 초기화, 업로드 리스트는 유지
    setMetadata({
      language: '',
      category: '',
      description: '',
      roomNumber: '',
      equipmentName: '',
      equipmentNumber: '',
    });
    setCurrentFile(null);
  };

  return (
    <div>
      {/* 제목 */}
      <h1 className="text-[24px] font-[600] leading-[30px] text-center">장비 메뉴얼 업로드</h1>
      <p className="text-[16px] font-[400] leading-[24px] text-center text-grey-500 my-[24px]">파일을 업로드 하세요</p>
      <div className="w-full flex flex-col items-center space-y-[40px]">
        {/* 파일 업로드 섹션 */}
        <FileUploadSection currentFile={currentFile} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} />

        {/* 메타데이터 선택 섹션 */}
        <MetadataSelection metadata={metadata} onMetadataChange={setMetadata} />

        {/* 파일 추가 버튼 */}
        <div className="w-full max-w-[750px] flex items-center justify-center">
          <Button
            onClick={handleAddFile}
            disabled={
              !currentFile ||
              !metadata.language ||
              !metadata.category ||
              !metadata.description ||
              !metadata.roomNumber ||
              !metadata.equipmentName ||
              !metadata.equipmentNumber
            }
            variant="outline"
            className="flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            파일 추가
          </Button>
        </div>

        <div className="w-full h-[1px] bg-grey-300" />

        {uploadFiles.length === 0 && (
          <div className="w-full max-w-[1200px]">
            <h2 className="text-[24px] font-[600] leading-[26px] text-center mt-4 mb-9">업로드할 파일 리스트</h2>
            <p className="text-[16px] font-[400] leading-[24px] text-center text-grey-500 my-[24px]">
              업로드할 파일이 아직 없습니다
            </p>
          </div>
        )}

        {/* 업로드할 파일 리스트 */}
        <UploadFilesTable uploadFiles={uploadFiles} onUploadToServer={handleUploadToServer} />
      </div>
    </div>
  );
}
