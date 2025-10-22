import { createCookieSessionStorage } from '@remix-run/node';

import { getAcceptLanguage, isLanguage } from '~/.server/lib/localization';
// import { Theme } from '~/common/constants';
// import { isTheme } from '~/hooks/use-theme';

// * 언어 세션
export const getLanguageSession = async (request: Request) => {
  const languageStorage = createCookieSessionStorage({
    cookie: {
      name: 'language',
      secure: true,
      secrets: [process.env.SESSION_SECRET ?? ''],
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
    },
  });
  const session = await languageStorage.getSession(request.headers.get('Cookie'));
  return {
    getLanguage: () => {
      const langValue = session.get('language') as string;
      return isLanguage(langValue) ? langValue : getAcceptLanguage(request);
    },
    setLanguage: (language: string) => session.set('language', language),
    commit: () => languageStorage.commitSession(session),
  };
};

// * 테마 세션
// export const getThemeSession = async (request: Request) => {
//   const themeStorage = createCookieSessionStorage({
//     cookie: {
//       name: 'theme',
//       secure: true,
//       secrets: [process.env.SESSION_SECRET ?? ''],
//       sameSite: 'lax',
//       path: '/',
//       httpOnly: true,
//     },
//   });
//   const session = await themeStorage.getSession(request.headers.get('Cookie'));
//   return {
//     getTheme: () => {
//       const themeValue = session.get('theme');
//       return isTheme(themeValue) ? themeValue : null;
//     },
//     setTheme: (theme: Theme) => session.set('theme', theme),
//     commit: () => themeStorage.commitSession(session),
//   };
// };

// * 액세스 토큰 세션 스토리지
const createAccessTokenStorage = (isTeams: boolean, isSecure: boolean) =>
  createCookieSessionStorage({
    cookie: {
      name: 'access-token',
      secure: isSecure,
      secrets: [process.env.SESSION_SECRET ?? ''],
      sameSite: isTeams ? 'none' : 'lax',
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 8, // 8시간
      domain: undefined,
    },
  });

// * 직원 ID 세션 스토리지
const createEmployeeIdStorage = (isTeams: boolean, isSecure: boolean) =>
  createCookieSessionStorage({
    cookie: {
      name: 'employee-id',
      secure: isSecure,
      secrets: [process.env.SESSION_SECRET ?? ''],
      sameSite: isTeams ? 'none' : 'lax',
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 8, // 8시간
      domain: undefined,
    },
  });

// * 액세스 토큰 세션 관리
export const getAccessTokenSession = async (request: Request) => {
  const userAgent = request.headers.get('User-Agent');
  const referer = request.headers.get('Referer');
  const origin = request.headers.get('Origin');

  // Teams 환경 감지 (getUserSession과 동일한 로직)
  const teamsPatterns = [
    'Teams',
    'teams',
    'Microsoft Teams',
    'microsoft teams',
    'MSTeams',
    'msteams',
    'TeamsApp',
    'teamsapp',
    'TeamsModern',
    'teamsmodern',
    'Edg/',
    'Edge/',
    'edge/',
  ];

  const userAgentTeams =
    teamsPatterns.some((pattern) => userAgent?.includes(pattern)) ||
    (userAgent?.includes('Edg/') && userAgent?.includes('Chrome/')) ||
    (userAgent?.includes('Mozilla/') && userAgent?.includes('Edg/'));

  const refererTeams =
    (referer &&
      (referer.includes('teams.microsoft.com') ||
        referer.includes('teams.live.com') ||
        referer.includes('teams.office.com'))) ||
    (origin &&
      (origin.includes('teams.microsoft.com') ||
        origin.includes('teams.live.com') ||
        origin.includes('teams.office.com'))) ||
    false;

  const isTeams = userAgentTeams || refererTeams;
  const isSecure = request.url.startsWith('https://') || isTeams;
  const storage = createAccessTokenStorage(isTeams, isSecure);

  let session: any;
  try {
    session = await storage.getSession(request.headers.get('Cookie'));
  } catch {
    session = await storage.getSession();
  }

  return {
    getAccessToken: () => session.get('accessToken'),
    setAccessToken: (token: string) => session.set('accessToken', token),
    commit: () => storage.commitSession(session),
  };
};

// * 직원 ID 세션 관리
export const getEmployeeIdSession = async (request: Request) => {
  const userAgent = request.headers.get('User-Agent');
  const referer = request.headers.get('Referer');
  const origin = request.headers.get('Origin');

  // Teams 환경 감지 (getUserSession과 동일한 로직)
  const teamsPatterns = [
    'Teams',
    'teams',
    'Microsoft Teams',
    'microsoft teams',
    'MSTeams',
    'msteams',
    'TeamsApp',
    'teamsapp',
    'TeamsModern',
    'teamsmodern',
    'Edg/',
    'Edge/',
    'edge/',
  ];

  const userAgentTeams =
    teamsPatterns.some((pattern) => userAgent?.includes(pattern)) ||
    (userAgent?.includes('Edg/') && userAgent?.includes('Chrome/')) ||
    (userAgent?.includes('Mozilla/') && userAgent?.includes('Edg/'));

  const refererTeams =
    (referer &&
      (referer.includes('teams.microsoft.com') ||
        referer.includes('teams.live.com') ||
        referer.includes('teams.office.com'))) ||
    (origin &&
      (origin.includes('teams.microsoft.com') ||
        origin.includes('teams.live.com') ||
        origin.includes('teams.office.com'))) ||
    false;

  const isTeams = userAgentTeams || refererTeams;
  const isSecure = request.url.startsWith('https://') || isTeams;
  const storage = createEmployeeIdStorage(isTeams, isSecure);

  let session: any;
  try {
    session = await storage.getSession(request.headers.get('Cookie'));
  } catch {
    session = await storage.getSession();
  }

  return {
    getEmployeeId: () => session.get('employeeId'),
    setEmployeeId: (id: string) => session.set('employeeId', id),
    commit: () => storage.commitSession(session),
  };
};

export const activityStorage = createCookieSessionStorage({
  cookie: {
    name: 'activity',
    secure: false,
    secrets: [process.env.SESSION_SECRET ?? ''],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
});

// 세션 가져오기 함수
export const getActivitySession = async (request: Request) => {
  const session = await activityStorage.getSession(request.headers.get('Cookie'));

  return {
    getActivity: () => session.get('activity'),
    setActivity: (activity: string) => session.set('activity', activity),
    commit: () => activityStorage.commitSession(session),
  };
};
