// 기본 설정값
const DEFAULT_CONFIG = {
  CLIENT_ID: 'c6e6a4d3-6214-42ac-836f-2070931370f9',
  TENANT_ID: 'f41f4fff-f409-44ed-86d7-eb05f4748597',
  REDIRECT_URI: 'https://localhost:8080/auth/profile',
};

// 환경 변수에서 설정값 가져오기 (클라이언트 사이드에서만 실행)
const getConfig = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }

  return {
    CLIENT_ID: import.meta.env.VITE_AZURE_CLIENT_ID || DEFAULT_CONFIG.CLIENT_ID,
    TENANT_ID: import.meta.env.VITE_AZURE_TENANT_ID || DEFAULT_CONFIG.TENANT_ID,
    REDIRECT_URI: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin + '/auth/profile',
  };
};

const config = getConfig();

export const msalConfig = {
  auth: {
    clientId: config.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${config.TENANT_ID}`,
    redirectUri: config.REDIRECT_URI,
    postLogoutRedirectUri: config.REDIRECT_URI,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  prompt: 'select_account',
};

export const tokenRequest = {
  scopes: ['User.Read'],
  forceRefresh: false,
};

// 토큰 갱신 설정
export const silentRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  forceRefresh: false,
};

// 로그아웃 설정
export const logoutRequest = {
  postLogoutRedirectUri: config.REDIRECT_URI,
};

export const CLIENT_SECRET = import.meta.env.VITE_AZURE_CLIENT_SECRET || '';
export const AUTH_URL = `https://login.microsoftonline.com/${config.TENANT_ID}/oauth2/v2.0/authorize`;
export const TOKEN_URL = `https://login.microsoftonline.com/${config.TENANT_ID}/oauth2/v2.0/token`;

export const GRAPH_API_URL = 'https://graph.microsoft.com';
