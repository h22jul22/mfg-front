import { useState } from 'react';

import UploadSection from './upload-section';

export default function UploadAccident() {
  const [accidentFile, setAccidentFile] = useState<File | null>(null);

  return (
    <UploadSection
      file={accidentFile}
      setFile={setAccidentFile}
      enableDrag={true}
      title="Deviation 업로드"
      description="파일을 업로드 하세요."
      accept=".xlsx"
      uploadDescription="서버에 일탈 발생 내역 업로드"
      maxSize="Limit 200MB per file - XLSX"
    />
  );
}
