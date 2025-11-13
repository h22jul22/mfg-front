import { axiosInstance } from './axios';
import { saveUserSession } from './common.util';

// Environment-specific URLs
const URLS = {
  local: 'https://210.223.56.94:25088',
  dev: '/api',
  test: 'https://210.223.56.94:25091',
  test_local: 'https://210.223.56.94:25091',
  sk_dev: 'https://ce-dev.skchemicals.com/api',
  sk_production: 'https://ce.skchemicals.com/api',
} as const;

type Environment = 'local' | 'development' | 'production' | 'test' | 'sk_dev' | 'sk_production' | 'test_local';

const getBaseUrl = () => {
  // 서버와 클라이언트 모두에서 환경 변수를 사용
  const env = (process.env.NODE_ENV || 'development').toLowerCase() as Environment;

  switch (env) {
    case 'local':
      return URLS.local; // local 환경에서도 development URL 사용
    case 'development':
      return URLS.dev;
    case 'test':
      return URLS.test;
    case 'sk_dev':
      return URLS.sk_dev;
    case 'sk_production':
      return URLS.sk_production;
    case 'test_local':
      return URLS.test_local;
    default:
      return URLS.dev;
  }
};

export const BASE_URL = getBaseUrl();

//* ===== 인증 관련 API 함수 =====
export const login = async (token: string) => {
  try {
    const res = (await fetch(`${BASE_URL}/v1/auth/query/login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })) as any;

    // 502 Bad Gateway 오류 명시적 처리
    if (res.status === 502) {
      throw new Response('502 Bad Gateway - 시스템 접속 장애', { status: 500 });
    }
    const data = await res.json();

    await saveUserSession({
      accessToken: data.accessToken,
      employeeName: data.employeeName,
      employeeId: data.employeeId,
      isAdmin: data.isAdmin,
      deptName: data.deptName,
      isMockLogin: true,
      expiresAtEpoch: data.expiresAtEpoch || 3600, // 기본값 설정
    });
  } catch (error) {
    // 502 오류나 네트워크 오류 구분
    if (error instanceof Error && error.message.includes('502')) {
      throw error; // 502 오류는 그대로 전달
    }

    throw new Response('네트워크 연결 오류가 발생했습니다.', { status: 500 });
  }
};

// 사용자 재검증
export const verifyUser = async (employeeId: string) => {
  const res = (await fetch(`${BASE_URL}/v1/auth/command/reverify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ employeeId }),
  })) as any;

  if (!res.ok) throw new Response(`사용자 검증 실패: ${res.status}`, { status: 500 });
  const data = await res.json();

  await saveUserSession({
    accessToken: data.accessToken,
    employeeName: data.employeeName,
    employeeId: data.employeeId,
    isAdmin: data.isAdmin,
    deptName: data.deptName,
    expiresAtEpoch: data.expiresAtEpoch || 3600, // 기본값 설정
    isMockLogin: false, // verifyUser는 실제 인증이므로 false
  });

  return res;
};

// 목로그인
export const mockLogin = async (authorizedUser: {
  employeeId: string;
  employeeName: string;
  isAdmin: string;
  deptName: string;
}) => {
  const res = await axiosInstance.post('/query/mock_login', null, {
    headers: { employeeId: authorizedUser.employeeId },
  });

  const data = res.data as { accessToken: string; expiresAtEpoch?: number };

  await saveUserSession({
    accessToken: data.accessToken,
    employeeName: authorizedUser.employeeName,
    employeeId: authorizedUser.employeeId,
    isAdmin: authorizedUser.isAdmin,
    deptName: authorizedUser.deptName,
    expiresAtEpoch: data.expiresAtEpoch || 3600,
    isMockLogin: true,
  });

  return data;
};

//* ===== Log Write API =====
export async function fetchLogWrite(employeeId: string, clientIp: string) {
  const res = await fetch(`${BASE_URL}/v1/logWrite/command/write`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, clientIp }),
  });
  const text = await res.text();

  if (!res.ok) throw new Response(`통합로그 입력 실패: ${res.status}`, { status: 500 });
  return JSON.parse(text);
}

//* ===== 챗봇 API =====
export async function postChatSession(
  chatSessionId: string,
  userInput: string,
  equipmentNo?: string,
  history?: string[] | []
) {
  try {
    const { data } = await axiosInstance.post('/chat/run', {
      chat_session_id: chatSessionId,
      user_input: userInput,
      equipment_no: equipmentNo,
      history,
    });
    return data;
  } catch (error: any) {
    console.error('챗봇 전송 실패:', error.response?.status);
  }
}

//* ===== 파일관리 API =====
// 매뉴얼 적재된 장비 리스트 조회
export async function fetchCollectionsList() {
  try {
    const { data } = await axiosInstance.get('/collections/get_equipments');
    const list = data?.response?.equip_no_list;
    if (!Array.isArray(list)) {
      throw new Response('Invalid response schema: response.equip_no_list is not an array');
    }
    return list as string[];
  } catch (error: any) {
    throw new Response('매뉴얼 적재 장비 리스트 조회 실패:', error.response?.status);
  }
}

// 장비 목록 조회 (장비 번호)
export async function fetchEquipmentList() {
  try {
    const { data } = await axiosInstance.get('/equipment/get_equipment_list');
    return data;
  } catch (error: any) {
    throw new Response('장비 목록 조회 실패:', error.response?.status);
  }
}

// 장비 목록 상세 조회 (장비 번호 + 각 장비 상세 정보)
export async function fetchEquipmentListDetail() {
  try {
    const { data } = await axiosInstance.get('/equipment/get_equipment_list_with_details');
    return data;
  } catch (error: any) {
    throw new Response('장비 목록 상세 조회 실패:', error.response?.status);
  }
}

// 특정 장비 상세 조회
export async function fetchSpecificEquipmentDetail(equipmentName: string) {
  try {
    const { data } = await axiosInstance.post('/equipment/get_equipment_data', null, {
      params: { equipment_name: equipmentName },
    });
    return data;
  } catch (error: any) {
    throw new Response('특정 장비 상세정보 조회 실패:', error.response?.status);
  }
}

// 업로드 된 장비 메뉴얼 파일 목록 조회
export async function fetchUploadedFilesInfo() {
  try {
    const { data } = await axiosInstance.post('/equipment/uploaded_files_with_info');
    return data;
  } catch (error: any) {
    throw new Response('업로드 된 파일 정보 조회 실패:', error.response?.status);
  }
}

// 벡터 삭제
export async function deleteVector(fileName: string) {
  try {
    const { data } = await axiosInstance.post('/collections/delete_vector_by_filename', { file_name: fileName });
    return data;
  } catch (error: any) {
    throw new Response('벡터 삭제 실패:', error.response?.status);
  }
}

// 장비 목록 파일 업데이트 (장비 마스터 업로드)
export async function updateEquipmentList(file: File) {
  try {
    const form = new FormData();
    form.append('file_name', file);
    const { data } = await axiosInstance.post('/file_management/update_equipment_list', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error: any) {
    throw new Response('장비 목록 파일 업데이트 실패:', error.response?.status);
  }
}

// 일탈 발생/조치내역 파일 업데이트 (일탈 발생 내역 업로드)
export async function updateDeviationFile(file: File) {
  try {
    const form = new FormData();
    form.append('file_name', file);
    const { data } = await axiosInstance.post('/file_management/update_deviation_file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error: any) {
    throw new Response('일탈 발생/조치내역 파일 업데이트 실패:', error.response?.status);
  }
}

// 메뉴얼 업로드
export async function updateManualFile(file: File) {
  try {
    const form = new FormData();
    form.append('file_name', file);
    const { data } = await axiosInstance.post('/rag_pipeline_mfg/run', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error: any) {
    throw new Response('메뉴얼 파일 업로드 실패:', error.response?.status);
  }
}

// 메뉴얼 업로드
export async function updateManual() {
  try {
    const { data } = await axiosInstance.post('/rag_pipeline_mfg/run');
    return data;
  } catch (error: any) {
    throw new Response('메뉴얼 업로드 실패:', error.response?.status);
  }
}
