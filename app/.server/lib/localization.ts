import { resolveAcceptLanguage, type MatchType } from 'resolve-accept-language';

import { DEFAULT_LANGUAGE, LANGUAGES } from '~/common/constants';

import { CommonJson, ErrorJson } from '../locales/types';
import { getLanguageSession } from '../services/session.service';

// * language 코드
export const getAcceptLanguage = (request: Request) => {
  try {
    const header = request.headers.get('accept-language') ?? '';
    const result = resolveAcceptLanguage(header, LANGUAGES, DEFAULT_LANGUAGE);

    // result.match가 string이면 split, 아니면 기본값 사용
    const langString = (result && typeof result.match === 'string' ? result.match : DEFAULT_LANGUAGE) as
      | 'en-US'
      | 'ko-KR';

    return langString.split('-')[0];
  } catch {
    return DEFAULT_LANGUAGE.split('-')[0]; // 안전하게 fallback
  }
};

// * language 검증
export const isLanguage = (language: string) => LANGUAGES.map((lang) => lang.split('-')[0]).includes(language);

// * 현지화 번역 언어셋
export const localize: <T>(request: Request, namespace: string) => Promise<CommonJson & T> = async (
  request,
  namespace = 'common'
) => {
  const languageSession = await getLanguageSession(request);
  const language = languageSession.getLanguage();
  const commonTranslations = await import(`../locales/${language}/common.json`);
  if (namespace === 'common') {
    return commonTranslations.default;
  } else {
    const pageTranslations = await import(`../locales/${language}/${namespace}.json`);
    return { ...commonTranslations.default, ...pageTranslations.default };
  }
};

// * 현지화 번역 에러 메세지
export const localizedError = async (request: Request) => {
  return await localize<ErrorJson>(request, 'error');
};
