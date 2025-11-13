import { toJson } from '~/.server/lib/utils';

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const id = formData.get('employeeId') as string;
  const isTeams = formData.get('isTeams') === 'true';
  const accessToken = formData.get('accessToken') as string;
  const expiresAtEpoch = formData.get('expiresAtEpoch') as string;
  const expiresAtEpochNumber = expiresAtEpoch ? parseInt(expiresAtEpoch, 10) : 3600;

  // 빈 employeeId로의 중복 요청 방지
  if (!id || id.trim() === '') {
    return toJson(
      {
        success: true,
        isTeams,
        sessionSaved: false,
        timestamp: new Date().toISOString(),
        message: '빈 employeeId 요청 무시',
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }

  // 요청이 https인지 여부를 간단히 판단
  const isHttps =
    (request.headers.get('x-forwarded-proto') || request.url.split(':')[0]) === 'https' ||
    process.env.NODE_ENV === 'production';

  // 로컬 HTTP이면 SameSite=Lax, Secure 미부여. HTTPS 환경이면 SameSite=None; Secure.
  const cookieAttrs = isHttps
    ? `Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${expiresAtEpochNumber}`
    : `Path=/; HttpOnly; SameSite=Lax; Max-Age=${expiresAtEpochNumber}`;

  try {
    // 응답 헤더에 쿠키들 추가
    const responseHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };

    // 개별 쿠키만 설정
    const response = new Response(
      JSON.stringify({
        success: true,
        isTeams,
        sessionSaved: true,
        timestamp: new Date().toISOString(),
        employeeId: id,
        accessToken,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...responseHeaders,
        },
      }
    );

    if (accessToken) {
      response.headers.append('Set-Cookie', `accessToken=${accessToken}; ${cookieAttrs}`);
    }

    // 개발 로컬에서도 employeeId 쿠키가 필요하다면 아래처럼 추가
    response.headers.append('Set-Cookie', `employeeId=${id}; ${cookieAttrs}`);

    // if (accessToken) {
    //   response.headers.append(
    //     'Set-Cookie',
    //     `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=None Secure Max-Age=${expiresAtEpochNumber}`,
    //   );
    // }

    // if (process.env.NODE_ENV === 'local') {
    //   response.headers.append(
    //     'Set-Cookie',
    //     `accessToken=${accessToken}; Path=/; HttpOnly; SameSite=None Secure Max-Age=${expiresAtEpochNumber}`,
    //   );
    //   response.headers.append(
    //     'Set-Cookie',
    //     `employeeId=${id}; Path=/; HttpOnly; SameSite=None Secure Max-Age=${expiresAtEpochNumber}`,
    //   );
    // }

    return response;
  } catch (error) {
    // Teams 환경에서는 세션 저장 실패 시에도 성공으로 처리
    if (isTeams) {
      return toJson(
        {
          success: true,
          isTeams,
          sessionSaved: false,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // 일반 환경에서는 에러 반환
    return toJson(
      {
        success: false,
        error: '쿠키 설정 실패',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
};
