import { Link, useLocation } from '@remix-run/react';
import { LogOut } from 'lucide-react';
import React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '~/components/ui/sidebar';

const navigation = [
  {
    name: '메인',
    href: '/main',
  },
  {
    name: '챗봇',
    href: '/chatbot',
  },
  {
    name: '메뉴얼 관리',
    href: '/manual/delete_manual',
  },
];

interface MfgLayoutProps {
  children: React.ReactNode;
  employeeId: string;
}

export default function MfgLayout({ children, employeeId }: MfgLayoutProps) {
  const location = useLocation();

  const handleLogout = () => {
    // 쿠키 삭제
    document.cookie = 'employeeId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  };

  return (
    <SidebarProvider>
      <div className='flex h-screen w-full'>
        <Sidebar className='!bg-grey-10 w-[256px] border-none p-2'>
          <SidebarHeader className='p-2'>
            <button className='flex items-center gap-2 p-2'>
              <div className='bg-grey-800 flex h-[32px] w-[32px] items-center justify-center rounded-md text-white'>
                <img className='h-[16px] w-[16px]' src='/images/gallery-vertical-end.png' alt='' />
              </div>
              <div className='flex flex-col'>
                <span className='text-grey-800 text-start text-[14px] font-[600] leading-[20px]'>
                  Engineer Assistant
                </span>
              </div>
            </button>
          </SidebarHeader>
          <SidebarContent className='mt-2 px-2 py-2'>
            <SidebarGroup>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.href}
                        className={`flex items-center justify-between rounded-md p-2 py-4 text-[14px] font-[400] leading-[20px] ${
                          location.pathname.startsWith(item.href)
                            ? 'bg-sidebar-accent border-[2px] border-[#A1A1AA]'
                            : ''
                        }`}
                      >
                        {item.name}
                        <img className='h-[16px] w-[16px]' src='/images/chevron-right.png' alt='' />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className='absolute bottom-4 flex flex-col justify-center gap-[18px]'>
              <div className='flex items-center gap-2'>
                <div className='bg-grey-100 flex size-8 items-center justify-center rounded-full'>
                  <p className='typography-4-bold'>I</p>
                </div>
                {/* TODO: 사용자 아이디 표시 */}
                <p className='typography-4-bold'>{employeeId}</p>
              </div>
              <button onClick={handleLogout} className='flex items-center gap-2'>
                <div className='flex size-8 items-center justify-center'>
                  <LogOut width={12} height={12} className='text-grey-700' />
                </div>
                <p className='text-grey-700 text-sm'>로그아웃</p>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className='flex-1 overflow-auto'>{children}</div>
      </div>
    </SidebarProvider>
  );
}
