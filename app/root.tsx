import './tailwind.css';
import { BrowserCacheLocation, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRouteError,
} from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';

import { setAxiosGlobalEmployeeId } from '~/lib/axios';
import { setGlobalEmployeeId } from '~/lib/setupFetchInterceptor';

import { msalConfig } from '../authConfig';
import { getLanguageSession, getThemeSession } from './.server/services/session.service';
import { LoadingProvider, useLoading } from './context/loading-provider';

import { mockLogin } from './lib/api';
import { getCookie } from './lib/utils';

//* ====== 목로그인을 위한 ======
// Authorization 자동 첨부용 전역 fetch 패치
function patchFetchWithAuth() {
  if (typeof window === 'undefined') return;
  // 중복 패치 방지
  if ((window as any).__fetchPatchedWithAuth) return;
  const orig = window.fetch.bind(window);
  (window as any).__fetchPatchedWithAuth = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = getCookie('accessToken') || localStorage.getItem('accessToken') || '';
    const headers = new Headers(init?.headers || {});
    // 호출부에서 이미 Authorization 지정했다면 건드리지 않음
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return orig(input, { ...init, headers });
  };
}

//* ====== SSO 비활성화 플래그 ======
// MSAL 활성화 상태 관리
const isMsalEnabled = false;

// MSAL 인스턴스 생성을 안전하게 처리하는 함수
const createMsalInstance = async () => {
  if (!isMsalEnabled || typeof window === 'undefined') {
    throw new Response('MSAL is not enabled or not in browser environment', { status: 500 });
  }

  try {
    const instance = new PublicClientApplication({
      ...msalConfig,
      cache: {
        ...msalConfig.cache,
        storeAuthStateInCookie: true,
        cacheLocation: BrowserCacheLocation.LocalStorage,
      },
      system: {
        loggerOptions: {
          loggerCallback: () => {},
          piiLoggingEnabled: false,
          logLevel: LogLevel.Error,
        },
      },
    });

    // MSAL 인스턴스 초기화 시도
    try {
      await instance.initialize();

      // 초기화 후 간단한 테스트로 MSAL이 제대로 작동하는지 확인
      try {
        instance.getAllAccounts();
      } catch (testError) {
        if (testError.errorCode === 'stubbed_public_client_application_called') {
          throw new Response('MSAL stub error - instance not properly initialized', { status: 500 });
        }
        throw testError;
      }
    } catch (initError) {
      // 이미 초기화된 경우 무시
      if (initError.errorCode === 'already_initialized') {
      } else if (initError.errorCode === 'stubbed_public_client_application_called') {
        throw new Response('MSAL stub error - instance not properly initialized', { status: 500 });
      } else {
        // 초기화 실패해도 인스턴스는 반환 (나중에 재시도 가능)
      }
    }

    return instance;
  } catch (error) {
    throw new Response(error as string, { status: 500 });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getLanguage } = await getLanguageSession(request);
  const { getTheme } = await getThemeSession(request);

  // 쿠키에서 employeeId 추출 (클라이언트에서 사용)
  const cookie = request.headers.get('Cookie');
  let employeeId = '';
  if (cookie) {
    const match = cookie.match(/employeeId=([^;]+)/);
    employeeId = match ? match[1] : '';
  }

  return { lang: getLanguage(), ssrTheme: getTheme(), employeeId };
};

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

//* ====== 목로그인을 위한 ======
export const App = () => {
  const { lang, employeeId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // 이펙트 중복 실행 방지(StrictMode)용
  const didLogin = useRef(false);

  // employeeId를 글로벌로 설정
  useEffect(() => {
    if (employeeId) {
      setGlobalEmployeeId(employeeId);
      setAxiosGlobalEmployeeId(employeeId);
    }
  }, [employeeId]);

  // 클라이언트 사이드에서만 Swiper CSS 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingLink = document.querySelector('link[href*="swiper"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/node_modules/swiper/swiper.css';
        document.head.appendChild(link);
      }
    }
  }, []);

  // 전역 fetch 인터셉트 패치
  useEffect(() => {
    patchFetchWithAuth();
  }, []);

  // 앱 최초 진입 시 자동 목로그인 → 성공 시 /main 이동
  useEffect(() => {
    if (didLogin.current) return;
    didLogin.current = true;

    const hasToken = !!getCookie('accessToken') || !!localStorage.getItem('accessToken');

    const runMockLogin = async () => {
      try {
        if (!hasToken) {
          // 요구사항: employId = 'I24418' 하드코딩, /query/mock_login
          await mockLogin({
            employeeId: 'I24418',
            employeeName: 'Mock User',
            isAdmin: 'N',
            deptName: 'MFG',
          });
          // saveUserSession에서 accessToken 쿠키/로컬스토리지 저장됨
        }
        // 토큰 보장 후 메인으로 이동
        navigate('/main', { replace: true });
      } catch (e) {
        // 실패 시에도 메인으로 이동해서 사용자에게 재시도 UI 제공 가능
        // 혹은 별도 에러 페이지/토스트 처리
        console.error('Mock login failed:', e);
        navigate('/main', { replace: true });
      }
    };

    runMockLogin();
  }, [navigate]);

  //* ====== SSO 비활성화 플래그 ======
  // export const App = () => {
  //   const { lang, employeeId } = useLoaderData<typeof loader>();
  //   const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  //   //? employeeId를 글로벌로 설정
  //   useEffect(() => {
  //     if (employeeId) {
  //       setGlobalEmployeeId(employeeId);
  //       setAxiosGlobalEmployeeId(employeeId);
  //     }
  //   }, [employeeId]);

  //   // 클라이언트 사이드에서만 Swiper CSS 로드
  //   useEffect(() => {
  //     if (typeof window !== 'undefined') {
  //       // 이미 로드되었는지 확인
  //       const existingLink = document.querySelector('link[href*="swiper"]');
  //       if (!existingLink) {
  //         // 동적으로 CSS 링크 추가
  //         const link = document.createElement('link');
  //         link.rel = 'stylesheet';
  //         link.href = '/node_modules/swiper/swiper.css';
  //         document.head.appendChild(link);
  //       }
  //     }
  //   }, []);

  //   useEffect(() => {
  //     if (isMsalEnabled) {
  //       const initializeMsal = async () => {
  //         try {
  //           const instance = await createMsalInstance();
  //           setMsalInstance(instance);
  //         } catch {
  //           // MSAL 인스턴스 생성 실패 시 기본 인스턴스 생성
  //           try {
  //             const fallbackInstance = new PublicClientApplication({
  //               auth: {
  //                 clientId: msalConfig.auth.clientId,
  //                 authority: msalConfig.auth.authority,
  //                 redirectUri: msalConfig.auth.redirectUri,
  //               },
  //               cache: {
  //                 cacheLocation: BrowserCacheLocation.LocalStorage,
  //                 storeAuthStateInCookie: true,
  //               },
  //             });

  //             // fallback 인스턴스도 초기화 시도
  //             try {
  //               await fallbackInstance.initialize();

  //               // fallback 인스턴스도 테스트
  //               try {
  //                 fallbackInstance.getAllAccounts();
  //               } catch (testError) {
  //                 if (testError.errorCode === 'stubbed_public_client_application_called') {
  //                   throw new Response('Fallback MSAL stub error', { status: 500 });
  //                 }
  //                 throw testError;
  //               }
  //             } catch (fallbackInitError) {
  //               if (fallbackInitError.errorCode === 'already_initialized') {
  //               } else if (fallbackInitError.errorCode === 'stubbed_public_client_application_called') {
  //                 throw new Response('Fallback MSAL stub error', { status: 500 });
  //               } else {
  //               }
  //             }

  //             setMsalInstance(fallbackInstance);
  //           } catch {
  //             setMsalInstance(null);
  //           }
  //         }
  //       };

  //       initializeMsal();
  //     } else {
  //     }
  //   }, []);

  return (
    <html lang={lang} className='light'>
      <head>
        <meta charSet='utf-8' />
        <meta name='robots' content='noindex, nofollow' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, interactive-widget=resizes-content'
        />
        <Meta />
        <Links />
        <script src='https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=H3rnRFD8ZP7JJTg6iKWBdUymOtnVccs3FEMM13Eh' />
      </head>
      <body>
        {/* SSO는 보류 */}
        {/* {msalInstance ? (
          <MsalProvider instance={msalInstance}>
            <LoadingProvider>
              <LoadingWatcher />
              <Outlet />
              <ScrollRestoration />
              <Scripts />
              <Toaster position='bottom-center' className='toast' />
            </LoadingProvider>
          </MsalProvider>
        ) : (
          <LoadingProvider>
            <LoadingWatcher />
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <Toaster position='bottom-center' className='toast' />
          </LoadingProvider>
        )} */}

        <LoadingProvider>
          <LoadingWatcher />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <Toaster position='bottom-center' className='toast' />
        </LoadingProvider>
      </body>
    </html>
  );
};

function LoadingWatcher() {
  const navigation = useNavigation();
  const { setIsLoading } = useLoading(); // LoadingProvider에서 제공

  useEffect(() => {
    const active = navigation.state !== 'idle';
    setIsLoading(active);
  }, [navigation.state, setIsLoading]);

  return null;
}

export default function AppWithProviders() {
  return <App />;
}

// Global Error Boundary (Remix v2 style)
export function ErrorBoundary() {
  const error = useRouteError();

  // Thrown Response (from loader/action)
  if (isRouteErrorResponse(error)) {
    return (
      <html lang='ko'>
        <head>
          <Meta />
          <Links />
          <title>{`${error.status} ${error.statusText}`}</title>
        </head>
        <body>
          <div
            style={{
              maxWidth: 840,
              margin: '80px auto',
              padding: '24px',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              {error.status} {error.statusText}
            </h1>
            <p style={{ color: '#4b5563', whiteSpace: 'pre-wrap' }}>
              {typeof error.data === 'string' ? error.data : '요청을 처리하는 중 오류가 발생했습니다.'}
            </p>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  // Uncaught Error (render/loader/action etc.)
  const message = (error as any)?.message || 'Unexpected Application Error';
  const stack = (error as any)?.stack;

  return (
    <html lang='ko'>
      <head>
        <Meta />
        <Links />
        <title>Unexpected Error</title>
      </head>
      <body>
        <div
          style={{
            maxWidth: 920,
            margin: '80px auto',
            padding: '24px',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Unexpected Error</h1>
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>{message}</p>
          {stack && (
            <pre
              style={{
                overflowX: 'auto',
                background: '#0b1020',
                color: '#d1d5db',
                padding: 16,
                borderRadius: 8,
                lineHeight: 1.4,
              }}
            >
              {stack}
            </pre>
          )}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// import {
//   Links,
//   Meta,
//   Outlet,
//   Scripts,
//   ScrollRestoration,
// } from "@remix-run/react";
// import type { LinksFunction } from "@remix-run/node";

// import "./tailwind.css";

// export const links: LinksFunction = () => [
//   { rel: "preconnect", href: "https://fonts.googleapis.com" },
//   {
//     rel: "preconnect",
//     href: "https://fonts.gstatic.com",
//     crossOrigin: "anonymous",
//   },
//   {
//     rel: "stylesheet",
//     href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
//   },
// ];

// export function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <Meta />
//         <Links />
//       </head>
//       <body>
//         {children}
//         <ScrollRestoration />
//         <Scripts />
//       </body>
//     </html>
//   );
// }

// export default function App() {
//   return <Outlet />;
// }
