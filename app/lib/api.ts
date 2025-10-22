// Environment-specific URLs
const URLS = {
  local: 'https://210.223.56.94:25088',
  dev: 'https://210.223.56.94:25088',
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

// ===== 인증 관련 API 함수 =====
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

    // 세션 저장
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

  // 세션 저장
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

export const mockLogin = async (authorizedUser: {
  employeeId: string;
  employeeName: string;
  isAdmin: string;
  deptName: string;
}) => {
  const res = await fetch(`${BASE_URL}/v1/auth/query/mock_login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      employeeId: authorizedUser.employeeId,
    },
    credentials: 'include',
    body: JSON.stringify({
      employeeId: authorizedUser.employeeId,
      employeeName: authorizedUser.employeeName,
      isAdmin: authorizedUser.isAdmin,
      deptName: authorizedUser.deptName,
    }),
  });

  if (!res.ok) throw new Response(`목업 로그인 실패: ${res.status}`, { status: 500 });

  const data = await res.json();

  // 세션 저장
  await saveUserSession({
    accessToken: data.accessToken,
    employeeName: authorizedUser.employeeName,
    employeeId: authorizedUser.employeeId,
    isAdmin: authorizedUser.isAdmin,
    deptName: authorizedUser.deptName,
    expiresAtEpoch: data.expiresAtEpoch || 3600, // 기본값 설정
    isMockLogin: true,
  });

  return data;
};

const saveUserSession = async (sessionData: {
  accessToken: string;
  employeeName: string;
  employeeId: string;
  isAdmin: string;
  deptName: string;
  isMockLogin: boolean;
  expiresAtEpoch: number;
}) => {
  if (typeof window === 'undefined') return;

  try {
    const formData = new FormData();
    formData.append('accessToken', sessionData.accessToken);
    formData.append('employeeName', sessionData.employeeName);
    formData.append('employeeId', sessionData.employeeId);
    formData.append('isAdmin', sessionData.isAdmin);
    formData.append('deptName', sessionData.deptName);
    formData.append('isMockLogin', sessionData.isMockLogin.toString());
    formData.append('isTeams', 'false');
    formData.append('expiresAtEpoch', sessionData.expiresAtEpoch.toString());

    localStorage.setItem('employeeId', sessionData.employeeId);

    await fetch('/app/save-user', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
  } catch {
    return;
  }
};

// ===== Log Write API =====
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
