import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// * localize 템플릿 문자열 치환
export const replaceT = (template: string, params: Record<string, string>) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => params[key.trim()] ?? key);
};

// * JSON fetch
export const fetchJson = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    });
    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    throw error;
  }
};

//* 세션 저장
export const save = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, JSON.stringify(value));
    // temp 저장 시 이벤트 발생
    if (key === 'temp') {
      window.dispatchEvent(new CustomEvent('temp-changed', { detail: value }));
    }
  }
};

export const load = (key: string) => {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const remove = (key: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(key);
    // temp 삭제 시 이벤트 발생
    if (key === 'temp') {
      window.dispatchEvent(new CustomEvent('temp-changed', { detail: null }));
    }
  }
};

/**
 * 클라이언트의 IP 주소를 가져옵니다.
 * 프록시나 로드밸런서 뒤에서도 정확한 IP를 가져올 수 있도록 여러 헤더를 확인합니다.
 */
export const getClientIP = (request: Request): string => {
  // X-Forwarded-For 헤더 확인 (프록시 서버가 설정한 실제 클라이언트 IP)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For는 쉼표로 구분된 IP 목록일 수 있으므로 첫 번째 IP를 사용
    return forwardedFor.split(',')[0].trim();
  }

  // X-Real-IP 헤더 확인 (Nginx 등이 설정한 실제 클라이언트 IP)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // CF-Connecting-IP 헤더 확인 (Cloudflare가 설정한 실제 클라이언트 IP)
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  // 기본적으로 Remote Address 사용
  const remoteAddr = request.headers.get('remote-addr');
  if (remoteAddr) {
    return remoteAddr;
  }

  const trueClientIp = request.headers.get('true-client-ip');
  if (trueClientIp) {
    return trueClientIp;
  }

  const connection = (request as any).connection;
  if (connection && connection.remoteAddress) {
    return connection.remoteAddress;
  }

  // IP를 찾을 수 없는 경우
  return 'unknown';
};

// 쿠키 읽기
export function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

// 토큰 가져오기
export function getAuthToken(): string | null {
  return getCookie('accessToken') || localStorage.getItem('accessToken') || null;
}
