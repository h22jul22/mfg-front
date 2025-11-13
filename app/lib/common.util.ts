// ===== 인증 관련 공통 함수 =====
// Teams 환경 감지 공통 함수
const detectTeamsEnvironment = (): boolean => {
  const userAgent = navigator.userAgent;
  return (
    userAgent.includes('Teams') ||
    userAgent.includes('teams') ||
    userAgent.includes('Microsoft Teams') ||
    userAgent.includes('MSTeams') ||
    userAgent.includes('TeamsApp') ||
    userAgent.includes('TeamsModern')
  );
};

// 세션 저장을 위한 FormData 생성 공통 함수
const createSessionFormData = (userData: {
  accessToken?: string;
  employeeName: string;
  employeeId: string;
  isAdmin: string;
  deptName: string;
  isMockLogin?: boolean;
  expiresAtEpoch?: number;
}): FormData => {
  const sessionFormData = new FormData();
  sessionFormData.append('accessToken', userData.accessToken || '');
  sessionFormData.append('employeeName', userData.employeeName || '');
  sessionFormData.append('employeeId', userData.employeeId);
  sessionFormData.append('isAdmin', userData.isAdmin || '');
  sessionFormData.append('deptName', userData.deptName || '');
  sessionFormData.append('isMockLogin', (userData.isMockLogin ?? false).toString());
  sessionFormData.append('isTeams', detectTeamsEnvironment().toString());
  sessionFormData.append('expiresAtEpoch', (userData.expiresAtEpoch || 3600).toString());
  return sessionFormData;
};

// 세션 저장 공통 함수
export const saveUserSession = async (userData: {
  accessToken?: string;
  employeeName: string;
  employeeId: string;
  isAdmin: string;
  deptName: string;
  isMockLogin?: boolean;
  expiresAtEpoch?: number;
}): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const sessionFormData = createSessionFormData(userData);

    localStorage.setItem('employeeId', userData.employeeId);
    if (userData.accessToken) {
      localStorage.setItem('accessToken', userData.accessToken); // 쿠키가 막힌 환경 대비
    }

    await fetch('/app/save-user', {
      method: 'POST',
      body: sessionFormData,
      credentials: 'include',
    });
  } catch {
    return;
  }
};

// export const isLocalDevelopment = () => {
//   return process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development';
// };

// export const isLocal = () => {
//   return process.env.NODE_ENV === 'local';
// };
