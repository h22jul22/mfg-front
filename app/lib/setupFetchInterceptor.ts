// 글로벌 employeeId 저장소
let globalEmployeeId: string | null = null;

export function setGlobalEmployeeId(employeeId: string) {
  globalEmployeeId = employeeId;
}

export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return;
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo, init?: RequestInit) => {
    const headers = new Headers(init?.headers);

    // 글로벌 employeeId 사용
    if (globalEmployeeId) {
      headers.set('userId', globalEmployeeId);
    }

    // 쿠키 기반 세션을 항상 포함 (accessToken과 employeeId 쿠키 자동 전송)
    const response = await originalFetch(input, {
      ...init,
      headers,
      credentials: 'include',
    });

    return response;
  };
}
