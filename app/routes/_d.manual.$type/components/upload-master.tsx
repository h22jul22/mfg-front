import { useState } from 'react';

import UploadSection from './upload-section';
import { updateEquipmentList } from '~/lib/api';

export default function UploadMaster() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (file: File) => {
    await updateEquipmentList(file);
  };

  return (
    <UploadSection
      file={file}
      setFile={setFile}
      enableDrag={true}
      title='장비 리스트 업로드'
      description='장비 리스트 파일을 업로드 하세요 (xlsx 형식)'
      accept='.xlsx'
      uploadDescription='서버에 장비 리스트 업로드'
      maxSize='Limit 200MB per file - XLSX'
      onUpload={handleUpload}
    />
  );
}
