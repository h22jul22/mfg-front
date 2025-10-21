export interface ManualFile {
  id: string;
  fileName: string;
  equipmentNumber: string;
  equipmentName: string;
  category: string;
  roomName: string;
  roomNumber: string;
}

export const MOCK_MANUAL_FILES: ManualFile[] = [
  {
    id: '1',
    fileName: 'FB112030-T-04.pdf',
    equipmentNumber: 'CAE-P-030',
    equipmentName: '동결건조기 #2',
    category: 'None',
    roomName: '동결건조실2',
    roomNumber: 'H109',
  },
  {
    id: '2',
    fileName: 'FB112030-T-05.pdf',
    equipmentNumber: 'CAE-P-030',
    equipmentName: '동결건조기 #2',
    category: 'None',
    roomName: '동결건조실2',
    roomNumber: 'H109',
  },
  {
    id: '3',
    fileName: 'SCAN_20241125_FD2.pdf',
    equipmentNumber: 'CAE-P-030',
    equipmentName: '동결건조기 #2',
    category: 'None',
    roomName: '동결건조실2',
    roomNumber: 'H109',
  },
  {
    id: '4',
    fileName: 'SCAN_20241125_FD3.pdf',
    equipmentNumber: 'CAE-P-030',
    equipmentName: 'PILOT 도포열교환기 #1',
    category: 'UT-패취',
    roomName: '동결건조실2',
    roomNumber: 'H109',
  },
  {
    id: '5',
    fileName: 'PILOT 도포건조기(P1-RD-CDM-02) 매뉴얼.docx',
    equipmentNumber: 'P2-PAHE-01',
    equipmentName: 'Halogen Moisture Analyser',
    category: 'API',
    roomName: 'Technical Area-1',
    roomNumber: 'P2-T02',
  },
  {
    id: '6',
    fileName: 'PILOT 도포건조기(P1-RD-CDM-02) 매뉴얼.docx',
    equipmentNumber: 'HE53',
    equipmentName: 'Cone Mill',
    category: 'API',
    roomName: '합성Pilot1실',
    roomNumber: 'H503',
  },
  {
    id: '7',
    fileName: 'UM-HE53(JA-KO-ZH-TH).pdf',
    equipmentNumber: 'CAE-P-089',
    equipmentName: '캡핑기(카운텍3라인)',
    category: '고형제동',
    roomName: '분쇄1실',
    roomNumber: 'H120',
  },
  {
    id: '8',
    fileName: 'UM-HE53(JA-KO-ZH-TH).pdf',
    equipmentNumber: 'S2-PA-CTB-23',
    equipmentName: '비닐투입기(카운텍3라인)',
    category: '고형제동',
    roomName: '병포장4실',
    roomNumber: 'S2-P37',
  },
  {
    id: '9',
    fileName: 'UM-HE53(JA-KO-ZH-TH).pdf',
    equipmentNumber: 'S2-PA-CTB-23',
    equipmentName: '조제탱크#8',
    category: '고형제동',
    roomName: '병포장4실',
    roomNumber: 'S2-P37',
  },
  {
    id: '10',
    fileName: 'UM-HE53(JA-KO-ZH-TH).pdf',
    equipmentNumber: 'S2-PA-CTB-23',
    equipmentName: '조제탱크#8',
    category: '생산2팀',
    roomName: 'Pilot 조제1실',
    roomNumber: 'P1-T38',
  },
];
