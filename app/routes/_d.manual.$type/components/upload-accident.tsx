import { useState } from 'react';

import UploadSection from './upload-section';
import { updateDeviationFile } from '~/lib/api';

export default function UploadAccident() {
  const [accidentFile, setAccidentFile] = useState<File | null>(null);

  const handleUpload = async (file: File) => {
    await updateDeviationFile(file);
  };

  return (
    <UploadSection
      file={accidentFile}
      setFile={setAccidentFile}
      enableDrag={true}
      title='Deviation 업로드'
      description='파일을 업로드 하세요.'
      accept='.xlsx'
      uploadDescription='서버에 일탈 발생 내역 업로드'
      maxSize='Limit 200MB per file - XLSX'
      onUpload={handleUpload}
    />
  );
}
