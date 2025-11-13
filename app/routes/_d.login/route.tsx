// import { InteractionStatus } from '@azure/msal-browser';
// import { useMsal } from '@azure/msal-react';
// import * as microsoftTeams from '@microsoft/teams-js';
// import type { LoaderFunctionArgs } from '@remix-run/node';
// import { json } from '@remix-run/node';
// import { useLoaderData } from '@remix-run/react';
// import { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { isLocalDevelopment } from '~/lib/common.util';
// import { fetchLogWrite, login, mockLogin } from '~/lib/api';
// import { getClientIP } from '~/lib/utils';

// import { loginRequest } from '../../../authConfig';

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const clientIp = getClientIP(request);
//   return json({
//     clientIp,
//   });
// };

// // Teams 환경 체크 활성화 여부 설정
// // True로 설정하면 Teams 환경에서만 접근 가능하고 MSAL 로그인 비활성화
// // false 설정하면 Teams와 웹 환경 모두 접근가능
// const ENABLE_TEAMS_CHECK = false;
// // const microsoftTeams = await import('@microsoft/teams-js');

// const checkMobileBrowser = async (): Promise<boolean> => {
//   try {
//     if (typeof window === 'undefined') {
//       return false;
//     }

//     // Teams 환경에서는 모바일 브라우저 체크를 건너뛰기
//     if (microsoftTeams.app) {
//       await microsoftTeams.app.initialize();
//       const context = await microsoftTeams.app.getContext();
//       if (context && context.app?.host?.name) {
//         // Teams 환경이면 모바일 브라우저 체크를 하지 않음
//         return false;
//       }
//     }

//     // 일반 웹 환경에서만 모바일 브라우저 체크
//     const userAgent = navigator.userAgent.toLowerCase();
//     return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
//   } catch {
//     return false;
//   }
// };

// const Login: React.FC = () => {
//   const [isInTeams, setIsInTeams] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isMobile] = useState(false);
//   const navigate = useNavigate();
//   const { instance, inProgress, accounts } = useMsal();
//   const loginAttempted = useRef(false);
//   const redirectAttempted = useRef(false);
//   const msalInitialized = useRef(false);
//   const teamsInitialized = useRef(false);

//   const { clientIp } = useLoaderData<typeof loader>();

//   // 🔹 Teams 토큰 Promise 래퍼 (재발급에도 사용)
//   const getTeamsToken = (): Promise<string> =>
//     new Promise((resolve, reject) => {
//       if (!microsoftTeams?.authentication) {
//         return reject(new Error('Teams SDK not loaded'));
//       }

//       // 토큰 요청 전에 Teams 앱 상태 확인
//       microsoftTeams.app
//         .getContext()
//         .then((context) => {
//           if (!context || !context.app?.host?.name) {
//             return reject(new Error('Teams 컨텍스트가 유효하지 않습니다.'));
//           }

//           // 토큰 요청
//           microsoftTeams.authentication.getAuthToken({
//             successCallback: (t) => {
//               resolve(t);
//             },
//             failureCallback: (err) => {
//               reject(new Error(err || 'getAuthToken failed'));
//             },
//           });
//         })
//         .catch(() => {
//           reject(new Error('Teams 컨텍스트 확인 실패'));
//         });
//     });

//   // Teams 환경에서 footer 숨기기
//   useEffect(() => {
//     if (isInTeams) {
//       const style = document.createElement('style');
//       style.textContent = `
//         footer {
//           display: none !important;
//         }
//       `;
//       document.head.appendChild(style);
//       return () => {
//         document.head.removeChild(style);
//       };
//     }
//   }, [isInTeams]);

//   // 인증 상태 초기화 함수
//   const resetAuthState = () => {
//     loginAttempted.current = false;
//     redirectAttempted.current = false;
//     setError(null);
//     setIsLoading(true);
//   };

//   // MSAL 초기화
//   useEffect(() => {
//     const initializeMsal = async () => {
//       if (msalInitialized.current) return;

//       try {
//         await instance.initialize();
//         msalInitialized.current = true;
//       } catch {
//         setError('인증 시스템 초기화에 실패했습니다.');
//         setIsLoading(false);
//       }
//     };

//     initializeMsal();
//   }, [instance]);

//   // Teams 인증 처리
//   const handleTeamsAuth = async () => {
//     try {
//       // Teams SDK가 로드되었는지 확인
//       if (!microsoftTeams.app) {
//         throw new Response('Teams SDK not loaded', { status: 500 });
//       }

//       // 최초 토큰 취득
//       const token = await getTeamsToken();

//       try {
//         // Teams 컨텍스트에서 사용자 정보
//         const context = await microsoftTeams.app.getContext();
//         if (!context || !context.user) {
//           throw new Response('Failed to get Teams context or user information', { status: 500 });
//         }
//         const userPrincipalName = context.user.userPrincipalName;
//         const displayName = context.user.displayName;
//         if (!userPrincipalName) {
//           throw new Response('Failed to get userPrincipalName from Teams context', { status: 500 });
//         }
//         const employeeId = userPrincipalName.split('@')[0];
//         const userName = displayName || employeeId;

//         const isAuthorized = await checkUserAuthorization(token);
//         if (!isAuthorized) {
//           return;
//         } else {
//           await LogWrite(employeeId);
//         }

//         // 로컬 스토리지
//         localStorage.setItem('userName', userName);
//         localStorage.setItem('userPrincipalName', userPrincipalName);
//         if (displayName) localStorage.setItem('displayName', displayName);

//         // 세션 저장 (쿠키 사용 시 include)
//         const formData = new FormData();
//         formData.append('employeeId', employeeId);
//         formData.append('isTeams', 'true');

//         await fetch('/app/save-user', {
//           method: 'POST',
//           body: formData,
//           credentials: 'include',
//         });

//         // 이동
//         navigate('/main', { replace: true });
//       } catch (error) {
//         // 권한 오류인지 확인
//         if (error instanceof Error && (error.message.includes('권한') || error.message.includes('접근'))) {
//           setError('접근 권한이 없는 사용자입니다. 관리자에게 문의하시기 바랍니다.');
//         } else if (error instanceof Error && (error.message.includes('502') || error.message.includes('Bad Gateway'))) {
//           setError('시스템 접속 장애가 발생하였습니다. 잠시후에 다시 접속해주세요.');
//         } else {
//           setError('시스템 접속 장애가 발생하였습니다. 잠시후에 다시 접속해주세요.');
//         }
//         setIsLoading(false);
//       }
//     } catch (error) {
//       if (
//         error instanceof Error &&
//         (error.message.includes('토큰') ||
//           error.message.includes('getAuthToken') ||
//           error.message.includes('Teams SDK'))
//       ) {
//         setError('Teams 인증에 실패했습니다. 다시 시도해주세요.');
//       } else {
//         setError('시스템 접속 장애가 발생하였습니다. 잠시후에 다시 접속해주세요.');
//       }
//       setIsLoading(false);
//     }
//   };

//   // Teams 환경 확인 및 인증 처리
//   useEffect(() => {
//     const checkEnvironment = async () => {
//       try {
//         // Teams SDK가 로드되었는지 확인
//         if (!microsoftTeams.app) {
//           setIsInTeams(false);
//           setIsLoading(false);
//           return;
//         }

//         // Teams SDK 초기화
//         try {
//           await microsoftTeams.app.initialize();
//         } catch {
//           setIsInTeams(false);
//           setIsLoading(false);
//           return;
//         }

//         // Teams 컨텍스트 가져오기
//         let context;
//         try {
//           context = await microsoftTeams.app.getContext();
//         } catch {
//           setIsInTeams(false);
//           setIsLoading(false);
//           return;
//         }

//         if (!context) {
//           setIsInTeams(false);
//           setIsLoading(false);
//           return;
//         }

//         const hostName = context?.app?.host?.name?.toLowerCase();

//         // Teams 환경 호스트명 확장 (모바일 포함)
//         const validHosts = [
//           'teams',
//           'teamsdesktop',
//           'teamsmobile', // 모바일 Teams
//           'teamsmodern',
//           'teamsweb', // Teams 웹 버전
//           'teamsapp', // Teams 앱
//           'teamsclient', // Teams 클라이언트
//           'teamsmobileweb', // 모바일 웹 Teams
//         ];

//         // 모바일 Teams 환경 추가 체크
//         const isMobileTeams = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
//           navigator.userAgent.toLowerCase()
//         );
//         const isTeamsHost = validHosts.includes(hostName);

//         if (!isTeamsHost && !isMobileTeams) {
//           setIsInTeams(false);
//           setIsLoading(false);
//           return;
//         }

//         if (!validHosts.includes(hostName)) {
//           setIsInTeams(false);
//           setIsLoading(false);
//           return;
//         }

//         setIsInTeams(true);
//       } catch {
//         setIsInTeams(false);
//         setIsLoading(false);
//       }
//     };

//     checkEnvironment();

//     // Teams 앱 상태 변경 감지를 위한 간단한 폴링 방식
//     let statusCheckCount = 0;
//     const maxStatusChecks = 3; // 최대 3번까지만 상태 체크

//     const checkTeamsStatus = () => {
//       if (microsoftTeams.app && isInTeams && statusCheckCount < maxStatusChecks) {
//         statusCheckCount++;
//         // Teams 앱이 활성 상태인지 주기적으로 확인
//         microsoftTeams.app
//           .getContext()
//           .then((context) => {
//             if (!context || !context.app?.host?.name) {
//               setIsInTeams(false);
//               setIsLoading(true);
//               // 무한 루프 방지를 위해 checkEnvironment 직접 호출하지 않음
//               setTimeout(() => {
//                 checkEnvironment();
//               }, 1000);
//             }
//           })
//           .catch(() => {
//             setIsInTeams(false);
//             setIsLoading(true);
//             // 무한 루프 방지를 위해 checkEnvironment 직접 호출하지 않음
//             setTimeout(() => {
//               checkEnvironment();
//             }, 1000);
//           });
//       }
//     };

//     // 5초마다 Teams 상태 확인
//     const statusInterval = setInterval(checkTeamsStatus, 5000);

//     // 클린업 함수
//     return () => {
//       clearInterval(statusInterval);
//     };
//   }, []);

//   // 권한 체크 함수 추가
//   const checkUserAuthorization = async (token: string): Promise<boolean> => {
//     try {
//       if (!token || token.split('.').length !== 3) {
//         throw new Response('Teams SSO token is not a JWT-like string', { status: 500 });
//       }

//       // 1차 서버 로그인
//       let response = (await login(token)) as any;

//       if (response.status === 401) {
//         // 만료/invalid_token 힌트 확인
//         const hdr = response.headers.get('WWW-Authenticate') || '';
//         const txt = await response
//           .clone()
//           .text()
//           .catch(() => '');
//         const isExpired =
//           /expired/i.test(hdr) || /expired/i.test(txt) || /invalid_token/i.test(hdr) || /invalid_token/i.test(txt);

//         if (isExpired) {
//           // 🔁 새 Teams 토큰 재발급 후 1회 재시도
//           const fresh = await getTeamsToken();
//           response = await login(fresh);
//         }
//       }
//       if (!response.ok) {
//         // 상태 코드에 따른 오류 메시지 구분
//         if (response.status === 401) {
//           setError('접근 권한이 없는 사용자입니다. 관리자에게 문의하시기 바랍니다.');
//         } else if (response.status === 502 || response.status >= 500) {
//           setError('시스템 접속 장애가 발생하였습니다. 잠시후에 다시 접속해주세요.');
//         } else {
//           setError('시스템 접속 장애가 발생하였습니다. 잠시후에 다시 접속해주세요.');
//         }
//         setIsLoading(false);
//         sessionStorage.removeItem('accessToken');
//         localStorage.removeItem('employeeId');
//         return false;
//       } else {
//         if (response.ok) {
//           const data = await response.json();
//           if (data.accessToken) {
//             // sessionStorage.setItem('accessToken', data.accessToken);
//             // sessionStorage.setItem('employeeId', data.employeeId);
//           }
//         }
//       }
//       return true;
//     } catch (error) {
//       // 오류 유형에 따른 메시지 구분
//       if (
//         error instanceof Error &&
//         (error.message.includes('502') || error.message.includes('Bad Gateway') || error.message.includes('네트워크'))
//       ) {
//         setError('시스템 접속 장애가 발생하였습니다. 잠시후에 다시 접속해주세요.');
//       } else {
//         setError('시스템 접속 장애가 발생하였습니다. 잠시후에 다시 접속해주세요.');
//       }

//       setIsLoading(false);
//       sessionStorage.removeItem('accessToken');
//       localStorage.removeItem('employeeId');
//       return false;
//     }
//   };

//   // Log Write 로그인 적재
//   const LogWrite = async (employeeId: string): Promise<boolean> => {
//     try {
//       await fetchLogWrite(employeeId, clientIp);
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   // 인증 처리
//   useEffect(() => {
//     const authenticateUser = async () => {
//       if (loginAttempted.current || !msalInitialized.current) {
//         return;
//       }

//       if (inProgress !== InteractionStatus.None) {
//         return;
//       }

//       loginAttempted.current = true;
//       setIsLoading(true);

//       try {
//         if (await checkMobileBrowser()) {
//           setError('모바일 브라우저에서는 접속할 수 없습니다.');
//           return;
//         }

//         // Teams 환경 체크 - checkEnvironment에서 이미 처리되었으므로 isInTeams 상태 사용
//         if (ENABLE_TEAMS_CHECK && !isInTeams) {
//           setIsLoading(false);
//           return; // 접근 제한 화면이 표시됨
//         }

//         // Teams 환경에서는 Teams SSO 인증만 사용하고, 일반 브라우저에서는 MSAL 로그인 사용
//         if (isInTeams) {
//           await handleTeamsAuth();
//           return;
//         }

//         // 개발 환경에서 목업 로그인 처리
//         if (isLocalDevelopment()) {
//           await mockLogin({
//             employeeId: 'I24418',
//             employeeName: '허헌',
//             isAdmin: 'Y',
//             deptName: '',
//           });

//           navigate('/main', { replace: true });
//           return; // 개발 환경에서는 여기서 종료
//         }

//         // 프로덕션 환경에서는 MSAL 로그인 처리
//         // (현재는 navigate만 호출하고 있지만, 실제로는 MSAL 로그인 로직이 필요)
//         navigate('/main', { replace: true });
//       } catch {
//         setError('인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
//         setIsLoading(false);
//         localStorage.removeItem('employeeId');
//         resetAuthState();
//       }
//     };

//     if (msalInitialized.current) {
//       authenticateUser();
//     }
//   }, [instance, inProgress, navigate, accounts, isInTeams]);

//   // 인증 상태 모니터링
//   useEffect(() => {
//     if (inProgress === InteractionStatus.None) {
//       resetAuthState();
//     }
//   }, [inProgress]);

//   if (isMobile) {
//     return (
//       <div className='flex min-h-screen flex-col items-center justify-center p-4'>
//         <div className='text-center'>
//           <h1 className='mb-4 text-2xl font-bold text-red-600'>접근 제한</h1>
//           <p className='text-gray-700'>모바일 브라우저에서는 접속할 수 없습니다.</p>
//         </div>
//       </div>
//     );
//   }

//   // Teams 환경 체크가 활성화되어 있고 Teams 환경이 아닌 경우에만 접근 제한
//   if (ENABLE_TEAMS_CHECK && !isInTeams && !isLoading) {
//     return (
//       <div className='flex min-h-screen flex-col items-center justify-center'>
//         <style>
//           {`
//             footer {
//               display: none !important;
//             }
//           `}
//         </style>
//         <div className='mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow-lg'>
//           <h2 className='mb-4 text-2xl font-bold text-red-600'>접근 제한</h2>
//           <p className='mb-4 text-gray-700'>
//             이 서비스는 Microsoft Teams 환경에서만 사용할 수 있습니다.
//             <br />
//             Teams 앱을 통해 접속해 주시기 바랍니다.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className='flex min-h-screen flex-col items-center justify-center'>
//         <style>
//           {`
//             footer {
//               display: none !important;
//             }
//           `}
//         </style>
//         <div className='text-center'>
//           <h2 className='mb-4 text-2xl font-bold'>
//             {isInTeams ? 'Teams 환경에서 로그인 중...' : '웹 환경에서 로그인 중...'}
//           </h2>
//           <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500' />
//           <p className='mt-4'>잠시만 기다려주세요...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className='flex min-h-screen flex-col items-center justify-center'>
//         <style>
//           {`
//             footer {
//               display: none !important;
//             }
//           `}
//         </style>
//         <div className='text-center'>
//           <h2 className='mb-4 text-2xl font-bold'>오류가 발생했습니다</h2>
//           <p className='mb-4 text-red-600'>{error}</p>
//           <button
//             onClick={() => {
//               loginAttempted.current = false;
//               redirectAttempted.current = false;
//               teamsInitialized.current = false;
//               setError(null);
//               setIsLoading(true);
//               window.location.reload();
//             }}
//             className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
//           >
//             다시 시도
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='flex min-h-screen flex-col items-center justify-center'>
//       <style>
//         {`
//           footer {
//             display: none !important;
//           }
//         `}
//       </style>
//       <div className='text-center'>
//         <h2 className='mb-4 text-2xl font-bold'>{isInTeams ? 'Teams 환경에서 로그인 중...' : '로그인'}</h2>
//         {!isInTeams && (
//           <button
//             onClick={() => {
//               loginAttempted.current = false;
//               redirectAttempted.current = false;
//               teamsInitialized.current = false;
//               instance.loginRedirect(loginRequest);
//             }}
//             className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
//           >
//             Microsoft 계정으로 로그인
//           </button>
//         )}
//         {isInTeams && <p className='text-gray-600'>Teams 환경에서 자동 인증 중...</p>}
//       </div>
//     </div>
//   );
// };

// export default Login;
