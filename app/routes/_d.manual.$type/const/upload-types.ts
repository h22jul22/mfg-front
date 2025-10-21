export interface UploadFile {
  id: string;
  fileName: string;
  fileSize: string;
  equipmentNumber: string;
  equipmentName: string;
  category: string;
  description: string;
  roomNumber: string;
  selectedLanguage: string;
}

export interface FileMetadata {
  language: string;
  category: string;
  description: string;
  roomNumber: string;
  equipmentName: string;
  equipmentNumber: string;
}
