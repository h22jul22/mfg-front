import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Check, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { getEmployeeIdCookie } from '~/.server/lib/utils';
import Success from '~/components/icons/success';
import Fail from '~/components/icons/fail';
import MfgLayout from '~/components/mfg-layout';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { RetryBtn } from '~/components/ui/retry-btn';
import { cn } from '~/lib/utils';

import ChatPanel from './components/chat-panel';
import { fetchCollectionsList, fetchEquipmentListDetail, postChatSession } from '~/lib/api';
import { Equipment } from '../_d.manual.$type/const/upload-types';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  files?: Array<{
    id: string;
    name: string;
    pages: number;
  }>;
  timestamp: Date;
  loading?: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get('Cookie');
  const employeeId: string = getEmployeeIdCookie(cookie);

  return { employeeId };
};

const messageSchema = z.object({
  message: z.string().trim().min(1),
});

const MfgChatbot = () => {
  const [equipNoList, setEquipNoList] = useState<string[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [selectedEquipNo, setSelectedEquipNo] = useState<string | null>(null);
  const [selectedEquipDetail, setSelectedEquipDetail] = useState<Equipment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isEquipDetailLoading, setIsEquipDetailLoading] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const loadingTimerRef = useRef<number | null>(null);
  const tempAiIdRef = useRef<string | null>(null);

  const [chatSessionId] = useState(() => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `ssr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  });

  const { employeeId } = useLoaderData<typeof loader>();
  if (!employeeId) return <RetryBtn />;

  // 1. 장비 리스트 로드
  const loadEquipList = async (showToast = false) => {
    setIsReloading(true);
    try {
      const list = await fetchCollectionsList();
      setEquipNoList(list);

      if (showToast) {
        toast.success('장비 리스트를 업데이트 했어요.', {
          className: 'success-toast',
          position: 'bottom-right',
          icon: <Success style={{ width: 24, height: 24 }} />,
        });
      }
    } catch {
      if (showToast) {
        toast.error('장비 리스트를 불러오는데 실패했어요.', {
          className: 'fail-toast',
          position: 'bottom-right',
          icon: <Fail style={{ width: 24, height: 24 }} />,
        });
      }
    } finally {
      setIsReloading(false);
    }
  };

  useEffect(() => {
    loadEquipList(false);
  }, []);

  // 2. 선택한 장비번호의 상세 정보 로드
  const loadEquipmentDetail = useCallback(async (equipNo: string) => {
    setIsEquipDetailLoading(true);
    try {
      const res = await fetchEquipmentListDetail();
      const list: Equipment[] = res?.response?.equipment_details ?? res?.equipment_list ?? res ?? [];
      const found = list.find((item) => String(item.equip_no) === String(equipNo));

      if (found) {
        setSelectedEquipDetail({
          equip_no: String(found.equip_no),
          equipment_name: String(found.equipment_name),
          room_name: String(found.room_name),
          room_number: String(found.room_number),
          category: String(found.category),
        });
      } else {
        setSelectedEquipDetail(null);
        toast.error('선택한 장비의 상세 정보를 찾지 못했어요.', {
          className: 'fail-toast',
          position: 'bottom-right',
          icon: <Fail style={{ width: 24, height: 24 }} />,
        });
      }
    } catch (error) {
      console.error('fetchEquipmentListDetail error:', error);
      setSelectedEquipDetail(null);
      toast.error('장비 상세 정보를 불러오지 못했어요.', {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
    } finally {
      setIsEquipDetailLoading(false);
    }
  }, []);

  const startFakeProgress = () => {
    setLoadingPercent(0);
    loadingTimerRef.current = window.setInterval(() => {
      setLoadingPercent((p) => {
        if (p >= 99) {
          if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
          return 99;
        }
        return p + 1;
      });
    }, 50);
  };

  const stopFakeProgress = (to100 = false) => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (to100) setLoadingPercent(100);
  };

  // 3. 챗봇 메세지
  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    if (!selectedEquipNo) {
      toast.error('문의할 장비 번호를 먼저 선택해주세요.', {
        className: 'fail-toast',
        position: 'bottom-right',
      });
      return;
    }

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 임시 AI 로딩 메시지 추가
    setIsAnswerLoading(true);
    startFakeProgress();
    const tempId = (Date.now() + 1).toString();
    tempAiIdRef.current = tempId;

    const tempAiMessage: Message = {
      id: tempId,
      role: 'ai',
      content: '',
      timestamp: new Date(),
      loading: true, // 로딩 플래그
    };
    setMessages((prev) => [...prev, tempAiMessage]);

    try {
      // 서버 호출
      const history = messages.map((m) => m.content);
      const result = await postChatSession(chatSessionId, data.message, selectedEquipNo, history);

      // 서버 응답 스키마 처리
      const replyText =
        result?.response?.answer ?? result?.answer ?? result?.content ?? result?.message ?? JSON.stringify(result);
      const files = result?.files ?? result?.attachments ?? undefined;

      const aiMessage: Message = {
        id: tempId,
        role: 'ai',
        content: replyText,
        files: Array.isArray(files)
          ? files.map((f: any, idx: number) => ({
              id: String(f?.id ?? idx),
              name: String(f?.name ?? f?.filename ?? `file-${idx + 1}`),
              pages: Number(f?.pages ?? 1),
            }))
          : undefined,
        timestamp: new Date(),
      };

      // 임시 로딩 메시지를 실제 답변으로 교체
      setMessages((prev) => prev.map((m) => (m.id === tempId ? aiMessage : m)));
      stopFakeProgress(true);
      setIsAnswerLoading(false);
      form.reset();
    } catch (err) {
      console.error('postChatSession error:', err);

      // 에러가 나도 임시 메시지를 에러 텍스트로 교체
      const errorText =
        err instanceof Response ? `요청 실패: ${err.status}` : ((err as any)?.message ?? '네트워크 오류가 발생했어요.');

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, loading: false, content: errorText, files: undefined } : m))
      );

      stopFakeProgress();
      setIsAnswerLoading(false);

      toast.error(errorText, {
        className: 'fail-toast',
        position: 'bottom-right',
        icon: <Fail style={{ width: 24, height: 24 }} />,
      });
    }
  };

  const handleEquipmentSelect = (equipNo: string) => {
    setSelectedEquipNo(equipNo);
    setSelectedEquipDetail(null);
    loadEquipmentDetail(equipNo);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  const handleUpdateEquipmentList = () => {
    if (!isReloading) loadEquipList(true);
  };

  return (
    <MfgLayout employeeId={employeeId}>
      <div className='flex h-screen w-full flex-col justify-between py-[60px]'>
        <div className='mx-auto flex h-full w-full max-w-[720px] flex-col justify-between'>
          <section className='flex flex-col'>
            <h1 className='text-center text-[35px] font-[600] leading-[40px]'>질의응답 챗봇</h1>
            <p className='pb-[12px] pt-[80px] typography-6-bold'>문의할 장비 번호 선택</p>
            <div className='flex gap-8'>
              <div className='flex w-1/2 flex-col'>
                <DropdownMenu>
                  <DropdownMenuTrigger className='flex h-[48px] w-full items-center justify-between rounded-md border border-grey-100 p-4 text-left focus:outline-none'>
                    <span className={cn(selectedEquipNo ? 'text-black' : 'text-grey-500')}>
                      {selectedEquipNo ?? '장비 번호를 선택하세요'}
                    </span>
                    <ChevronDown width={20} height={20} stroke='var(--grey500)' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-[320px]'>
                    {equipNoList.map((equipNo) => (
                      <DropdownMenuItem
                        key={equipNo}
                        onClick={() => handleEquipmentSelect(equipNo)}
                        className='flex h-[40px] cursor-pointer items-center justify-between'
                      >
                        <span className={cn(selectedEquipNo === equipNo ? 'text-blue-700' : 'text-grey-800')}>
                          {equipNo}
                        </span>
                        {selectedEquipNo === equipNo && <Check className='h-[20px] w-[20px]' color='var(--blue700)' />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={handleUpdateEquipmentList} variant='outline' className='mt-[20px] w-[155px]'>
                  장비 리스트 업데이트
                </Button>
              </div>

              {/* 장비 상세 정보 영역 */}
              {selectedEquipNo && (
                <div className='flex flex-col gap-[17px]'>
                  {isEquipDetailLoading ? (
                    // 로딩 중일 때
                    <p className='animate-pulse text-grey-600 typography-4-regular'>장비 정보를 불러오는 중입니다…</p>
                  ) : selectedEquipDetail ? (
                    // 상세 정보 있을 때
                    <>
                      <p className='typography-4-regular'>
                        <span className='typography-4-medium'>장비명:</span> {selectedEquipDetail.equipment_name}
                      </p>
                      <p className='typography-4-regular'>
                        <span className='typography-4-medium'>위치-실명:</span> {selectedEquipDetail.room_number}
                      </p>
                      <p className='typography-4-regular'>
                        <span className='typography-4-medium'>장비 번호:</span> {selectedEquipDetail.equip_no}
                      </p>
                      <p className='typography-4-regular'>
                        <span className='typography-4-medium'>구분:</span> {selectedEquipDetail.category}
                      </p>
                    </>
                  ) : (
                    // 상세 정보 없음
                    <p className='text-grey-400 typography-4-regular'>선택한 장비의 상세 정보를 찾지 못했어요.</p>
                  )}
                </div>
              )}
            </div>
            <div className='mt-[35px] h-[1px] w-full bg-grey-300' />

            {/* 채팅 섹션 */}
            <div className='max-h-[500px] min-h-[500px] flex-1 overflow-y-auto rounded-lg bg-white'>
              <ChatPanel
                messages={messages}
                onResetChat={handleResetChat}
                isLoading={isAnswerLoading}
                loadingPercent={loadingPercent}
              />
            </div>
          </section>
        </div>
        {/* 입력 섹션 */}
        <div className='mx-auto h-[48px] w-full max-w-[720px]'>
          <div className='fixed bottom-[0px] min-h-[80px] w-full max-w-[720px] bg-white'>
            <div className='p-[8px_12px_24px]'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='h-full w-full'>
                  <div className='flex h-full w-full items-center gap-[8px] rounded-[8px] bg-grey-50 p-[8px_8px_8px_16px]'>
                    <FormField
                      control={form.control}
                      name='message'
                      render={({ field }) => (
                        <FormItem className='m-0 flex flex-1 items-center justify-center'>
                          <FormControl>
                            <textarea
                              onKeyDown={(e) => {
                                if (e.altKey && e.key === 'Enter') {
                                  form.handleSubmit(onSubmit)();
                                }
                              }}
                              disabled={form.formState.isSubmitting}
                              className='h-[24px] w-full resize-none overflow-y-auto bg-transparent pt-[2px] leading-[24px] outline-none typography-4-regular disabled:text-grey-400'
                              placeholder='질문을 입력해주세요.'
                              onInput={(e) => {
                                const target = e.currentTarget;
                                target.style.height = '24px';
                                target.style.height = `${Math.min(target.scrollHeight, 264)}px`;
                              }}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* 전송 버튼 */}
                    {form.formState.isSubmitting ? (
                      <button type='button' className='relative h-[32px] w-[32px] rounded-[8px] bg-grey-600'>
                        <div className='absolute left-[50%] top-[50%] h-[12px] w-[12px] translate-x-[-50%] translate-y-[-50%] rounded-[2px] bg-white' />
                      </button>
                    ) : (
                      <button
                        type='submit'
                        className={cn(
                          'mt-auto flex h-[32px] min-w-[32px] items-center justify-center rounded-[8px] bg-black transition-colors disabled:bg-grey-400'
                        )}
                        disabled={form.formState.isSubmitting || !form.formState.isValid}
                      >
                        <img src='/icons/mic.png' alt='' width={24} />
                      </button>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </MfgLayout>
  );
};

export default MfgChatbot;
