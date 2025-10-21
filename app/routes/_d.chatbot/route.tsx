import { zodResolver } from '@hookform/resolvers/zod';
// import { LoaderFunctionArgs } from '@remix-run/node';
// import { useLoaderData } from '@remix-run/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

//import { getEmployeeIdCookie } from '~/.server/lib/utils';
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
//import { RetryBtn } from '~/components/ui/retry-btn';
import { cn } from '~/lib/utils';

import ChatPanel from './components/chat-panel';
import { mockResponses } from './const/const';

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
}

const MOCK_EQUIPMENT_LIST = [
  {
    id: 'CAE-P-030',
    name: 'Freeze Dryer',
    location: '동결건조실2',
    roomNumber: 'H109',
    category: 'API',
  },
  {
    id: 'CAE-U-083',
    name: 'Vacuum Pump',
    location: '진공펌프실1',
    roomNumber: 'H205',
    category: 'Intermediate',
  },
  {
    id: 'HE53',
    name: 'Heating Oven',
    location: '건조실3',
    roomNumber: 'H312',
    category: 'API',
  },
  {
    id: 'P1-TD-MIT-08',
    name: 'Tablet Press',
    location: '정제실1',
    roomNumber: 'P108',
    category: 'Finished',
  },
  {
    id: 'P1-TD-MIT-09',
    name: 'Coating Machine',
    location: '코팅실2',
    roomNumber: 'P209',
    category: 'Finished',
  },
  {
    id: 'S2-PA-CMP-01',
    name: 'Compression Machine',
    location: '압축실1',
    roomNumber: 'S201',
    category: 'Intermediate',
  },
];

interface Equipment {
  id: string;
  name: string;
  location: string;
  roomNumber: string;
  category: string;
}

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const cookie = request.headers.get('Cookie');
//   const employeeId: string = getEmployeeIdCookie(cookie);

//   return { employeeId };
// };

const messageSchema = z.object({
  message: z.string().trim().min(1),
});

const MfgChatbot = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  });
  // const { employeeId } = useLoaderData<typeof loader>();
  // if (!employeeId) return <RetryBtn />;

  const onSubmit = (data: z.infer<typeof messageSchema>) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.message,
      timestamp: new Date(),
    };

    // 랜덤하게 응답 선택
    // TODO : 실제 API 구현시 실제 API 호출
    const randomize = crypto.randomUUID();
    const randomResponse = mockResponses[Math.floor(randomize.charCodeAt(0) % mockResponses.length)];

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: randomResponse.content,
      files: randomResponse.files,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    form.reset();
  };

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  const handleUpdateEquipmentList = () => {
    toast.success('장비 리스트를 업데이트 했어요.', {
      className: 'success-toast',
      position: 'bottom-right',
      icon: <Success style={{ width: 24, height: 24 }} />,
    });
    toast.error('장비 리스트를 불러오는데 실패했어요.', {
      className: 'fail-toast',
      position: 'bottom-right',
      icon: <Fail style={{ width: 24, height: 24 }} />,
    });
  };

  return (
    <MfgLayout employeeId='I24418'>
      <div className='flex h-screen w-full flex-col justify-between py-[60px]'>
        <div className='mx-auto flex h-full w-full max-w-[720px] flex-col justify-between'>
          <section className='flex flex-col'>
            <h1 className='text-center text-[35px] font-[600] leading-[40px]'>질의응답 챗봇</h1>
            <p className='typography-6-bold pb-[12px] pt-[80px]'>문의할 장비 번호 선택</p>
            <div className='flex gap-8'>
              <div className='flex w-1/2 flex-col'>
                <DropdownMenu>
                  <DropdownMenuTrigger className='border-grey-100 flex h-[48px] w-full items-center justify-between rounded-md border p-4 text-left focus:outline-none'>
                    <span className={cn(selectedEquipment ? 'text-black' : 'text-grey-500')}>
                      {selectedEquipment
                        ? MOCK_EQUIPMENT_LIST.find((eq) => eq.id === selectedEquipment?.id)?.id
                        : '장비 번호를 선택하세요'}
                    </span>
                    <ChevronDown width={20} height={20} stroke='var(--grey500)' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-[320px]'>
                    {MOCK_EQUIPMENT_LIST.map((equipment) => (
                      <DropdownMenuItem
                        key={equipment.id}
                        onClick={() => handleEquipmentSelect(equipment)}
                        className='flex h-[40px] cursor-pointer items-center justify-between'
                      >
                        <span
                          className={cn(selectedEquipment?.id === equipment.id ? 'text-blue-700' : 'text-grey-800')}
                        >
                          {equipment.id}
                        </span>
                        {selectedEquipment?.id === equipment.id && (
                          <Check className='h-[20px] w-[20px]' color='var(--blue700)' />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={handleUpdateEquipmentList} variant='outline' className='mt-[20px] w-[155px]'>
                  장비 리스트 업데이트
                </Button>
              </div>
              {selectedEquipment && (
                <div className='flex flex-col gap-[17px]'>
                  <p className='typography-4-regular'>
                    <span className='typography-4-medium'>장비명:</span> {selectedEquipment.name}
                  </p>
                  <p className='typography-4-regular'>
                    <span className='typography-4-medium'>위치-실명:</span> {selectedEquipment.location}
                  </p>
                  <p className='typography-4-regular'>
                    <span className='typography-4-medium'>장비 번호:</span> {selectedEquipment.roomNumber}
                  </p>
                  <p className='typography-4-regular'>
                    <span className='typography-4-medium'>구분:</span> {selectedEquipment.category}
                  </p>
                </div>
              )}
            </div>
            <div className='bg-grey-300 mt-[35px] h-[1px] w-full' />

            {/* 채팅 섹션 */}
            <div className='max-h-[500px] min-h-[500px] flex-1 overflow-y-auto rounded-lg bg-white'>
              <ChatPanel messages={messages} onResetChat={handleResetChat} />
            </div>
          </section>
        </div>
        {/* 입력 섹션 */}
        <div className='mx-auto h-[48px] w-full max-w-[720px]'>
          <div className='fixed bottom-[0px] min-h-[80px] w-full max-w-[720px] bg-white'>
            <div className='p-[8px_12px_24px]'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='h-full w-full'>
                  <div className='bg-grey-50 flex h-full w-full items-center gap-[8px] rounded-[8px] p-[8px_8px_8px_16px]'>
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
                              className='typography-4-regular disabled:text-grey-400 h-[24px] w-full resize-none overflow-y-auto bg-transparent pt-[2px] leading-[24px] outline-none'
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
                      <button type='button' className='bg-grey-600 relative h-[32px] w-[32px] rounded-[8px]'>
                        <div className='absolute left-[50%] top-[50%] h-[12px] w-[12px] translate-x-[-50%] translate-y-[-50%] rounded-[2px] bg-white' />
                      </button>
                    ) : (
                      <button
                        type='submit'
                        className={cn(
                          'disabled:bg-grey-400 mt-auto flex h-[32px] min-w-[32px] items-center justify-center rounded-[8px] bg-black transition-colors'
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
