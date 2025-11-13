export interface Equipment {
  equip_no: string;
  equipment_name: string;
  category: string;
  room_name: string;
  room_number: string;
  file_name?: string;
  application?: string;
}

export interface ManualFile {
  id: string;
  fileName: string;
  equipmentNumber: string;
  equipmentName: string;
  category: string;
  roomName: string;
  roomNumber: string;
}

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
