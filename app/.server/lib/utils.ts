import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Params } from '@remix-run/react';

import { ToJson } from '~/common/types';
import ajv from '~/lib/ajv';

import { DeferredData } from './defer';
import { AjvInvalidException, HttpException } from './exception';

// * ENV 가져오기
export const getEnv = (name: string, defaultValue?: string) => {
  const env = process.env[name];
  if (!env && !defaultValue) {
    throw new Response(`Please define the ${name} environment variable.`, { status: 500 });
  }
  return env ? env : defaultValue;
};

// * FormData 객체 추출
export const parseFormData = async <T = any>(request: Request) => {
  const formData = await request.formData();
  return Object.fromEntries(formData) as T;
};

// * Ajv 유효성 검사
export const validate = (schema: any, data: any) => {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    throw new AjvInvalidException(validate.errors!);
  }
  return valid;
};

// * FormData 객체 추출 및 Ajv 유효성 검사
export const validateFormData = async <T>(request: Request, schema: any) => {
  const payload = await parseFormData<T>(request);
  validate(schema, payload);
  return payload;
};

// * Params Ajv 유효성 검사
export const validateParams = (params: Params<string>, schema: any) => {
  validate(schema, params);
  return params;
};

// * JSON 타입 추론 응답 생성
// Remix에서 json 함수가 deprecated됨에 따라 기존 함수 대채 및 JSON 직렬화 타입 추론
export const toJson = <T = any>(data: T, options?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  }) as unknown as ToJson<T>;
};

// * JSON 타입 추론 지연 스트림 응답 생성
// Remix에서 defer 함수가 deprecated됨에 따라 기존 함수 대채 및 JSON 직렬화 타입 추론
export const typedDefer = <T = any>(data: T, options?: ResponseInit) => {
  return new DeferredData(data as any, options) as unknown as ToJson<T>;
};

// * 컨트롤러 호출 및 에러 예외 처리
export const control = async <T>(
  controller: (
    args?: LoaderFunctionArgs | ActionFunctionArgs
  ) => Promise<T & { message?: string; path?: string; details?: any }>,
  args?: LoaderFunctionArgs | ActionFunctionArgs
): ReturnType<typeof controller> => {
  return controller(args).catch((error) => {
    if (error instanceof HttpException) {
      return toJson(
        {
          message: error.message,
          ...(error.path && { path: error.path }),
        },
        { status: error.status }
      );
    } else if (error instanceof Error) {
      return toJson({ message: error.message }, { status: 500 });
    } else if (error instanceof Response) {
      return toJson({ message: error.statusText }, { status: error.status });
    } else {
      return toJson({ message: 'Unknown Error' }, { status: 500 });
    }
  }) as ReturnType<typeof controller>;
};

//! user-session 제거로 인해 주석 처리, 사용하지마세요
// export const getEmployeeIdServer = async (request: Request) => {
//   const session = await getUserSession(request);

//   return session.getUser();
// };

export const getEmployeeIdCookie = (cookie: string) => {
  if (!cookie) return '';

  // employeeId 쿠키 값 추출 (다른 쿠키와 구분)
  const match = cookie.match(/employeeId=([^;]+)/);
  return match ? match[1] : '';
};
