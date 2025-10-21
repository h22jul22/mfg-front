// import { LoaderFunctionArgs } from '@remix-run/node';
// import { useLoaderData } from '@remix-run/react';

import MfgLayout from '~/components/mfg-layout';
// import { getEmployeeIdCookie } from '~/.server/lib/utils';
// import { RetryBtn } from '~/components/ui/retry-btn';

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const cookie = request.headers.get('Cookie');
//   const employeeId: string = getEmployeeIdCookie(cookie);

//   return { employeeId };
// };

const MfgMain = () => {
  //   const { employeeId } = useLoaderData<typeof loader>();

  //   if (!employeeId) {
  //     return <RetryBtn />;
  //   }

  return (
    <MfgLayout employeeId='I24418'>
      <div className='h-screen'>
        <div className='mx-auto min-w-[780px] max-w-[1400px] p-[78px_60px_103px_60px]'>
          <h1 className='text-[35px] font-[600] leading-[40px]'>Engineer Assistant</h1>
          <p className='typography-4-regular text-grey-500 whitespace-normal pt-[16px] md:whitespace-nowrap md:pt-[24px]'>
            Engineer Assistant를 통해 장비 메뉴얼 및 일탈 발생/조치내역에 대한 정보를 대화형 챗봇 인터페이스로 빠르게
            확인하실 수 있습니다.
          </p>
          <img
            loading='lazy'
            src='/imgs/mfg_main.png'
            className='max-h-sm max-w-sm object-cover pt-[20px] md:max-h-[637px] md:max-w-[1136px] md:pt-[80px]'
            alt='mfg-main'
          />
        </div>
      </div>
    </MfgLayout>
  );
};

export default MfgMain;
