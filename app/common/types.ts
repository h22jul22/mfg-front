// * JSON 직렬화 타입 추론
export type ToJson<T> = T extends string | number | boolean | null
  ? T // 기본 타입은 그대로 반환
  : T extends undefined
  ? never // undefined는 반환하지 않음
  : T extends (...args: any[]) => any
  ? never // 함수는 반환하지 않음
  : T extends bigint
  ? never // bigint는 반환하지 않음
  : T extends symbol
  ? never // symbol은 반환하지 않음
  : T extends Promise<infer U>
  ? Promise<ToJson<U>> // Promise의 반환 타입에 ToJson 적용
  : T extends ArrayBuffer | ArrayBufferView
  ? never // ArrayBuffer와 TypedArray는 직렬화되지 않음
  : T extends Map<any, any>
  ? { [K in keyof T]: ToJson<T[K]> } // Map 처리
  : T extends Set<any>
  ? Array<ToJson<T extends Set<infer U> ? U : never>> // Set은 배열로 변환
  : T extends Date
  ? string // Date는 ISO 문자열로 변환
  : T extends Array<infer U>
  ? Array<ToJson<U>> // 배열은 재귀적으로 변환
  : { [K in keyof T]: ToJson<T[K]> };

export interface Participant {
  employeeId: string;
  employeeName: string;
  headquater: string;
  deptName: string;
  position: null | string;
  calendarOwner: boolean;
  id: number;
  colorGroup: {
    nameColor: string;
    nameLight: string;
    checkColor: string;
    checkLight: string;
    textColor: string;
  };
  checkRole?: string; // 캘린더 모드에서 소유주 식별용 ('y'|'n')
}

export interface WeeklyCallCompany {
  totalCount: number;
  weekCompanyId: number;
  employeeId: string;
  companyNo: string;
  sfeCompanyId: string;
  contactId: string;
  contactName: string;
  contactPosition: string;
  companyOrder: number;
  companyName: string;
  companyCategory: string;
  companyGrade: string;
  checkYn: string;
  addrSido: string;
  addrGugun: string;
  addrDong: string;
}

export interface CalendarEvent {
  // 공통 필드 (FullCalendarEvent 기준)
  id?: string;
  calendarId?: number;
  employeeId?: string;
  year?: number;
  month?: number;
  week?: number;
  day?: string; // yyyy-MM-dd

  // FullCalendar 전용 필드
  title?: string;
  calendar?: 'personal' | 'team' | 'all';
  location?: string;
  scheduleName?: string;
  activityType?: 'call' | 'product' | 'symposium' | 'null';
  scheduleType?: 'business' | 'normal';
  type?: `${'personal' | 'team'}.${'sales' | 'general'}` | 'default';
  participants?: Participant[];
  memo?: string;
  description?: string;
  backgroundColor?: string;

  // 기존 calendar 이벤트 필드
  editable?: 'true' | 'false';
  newActivityAble?: boolean;
  fieldOffType?: string;
  customer?: any[];
  targets?: any[];
  totalCount?: number;
  eventId?: number;
  eventGroup?: string;
  eventType?: string;
  callType?: 'detail' | 'remind' | 'visit' | 'etc' | null;
  isProductChecked?: boolean;
  isSymposiumChecked?: boolean;
  eventName?: string;
  checkAllDay?: 'Y' | 'N';
  startDate?: string; // ISO 8601
  endDate?: string;
  products?: { productName: string; productCode: string; productGroup: string; productGroupCode: string }[];
  callCode?: string;
  etcTitle?: string;
  selectedCustomer?: any;
  selectedCustomerIndex?: number;
  eventAddSource?: 'calendar' | 'drawer';
  activityIdList?: string[];
  templateColor?: string;

  // FullCalendar 전용 필드
  start?: Date;
  end?: Date;
  writeActivity?: boolean;
}
