//import { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useParams } from '@remix-run/react';

//import { getEmployeeIdCookie } from '~/.server/lib/utils';
import MfgLayout from '~/components/mfg-layout';
//import { RetryBtn } from '~/components/ui/retry-btn';
import { cn } from '~/lib/utils';

import DeleteManual from './components/delete-manual';
import UploadAccident from './components/upload-accident';
import UploadManual from './components/upload-manual';
import UploadMaster from './components/upload-master';

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const cookie = request.headers.get('Cookie');
//   const employeeId: string = getEmployeeIdCookie(cookie);

//   return { employeeId };
// };

const MfgMain = () => {
  const { type } = useParams();
  // const { employeeId } = useLoaderData<typeof loader>();
  // if (!employeeId) return <RetryBtn />;

  return (
    <MfgLayout employeeId='I24418'>
      <div className='mx-auto flex min-w-[780px] max-w-[1400px] flex-col gap-10 px-[60px] py-[46px]'>
        <h1 className='text-[35px] font-[600] leading-[40px]'>메뉴얼 데이터 업데이트</h1>
        <section>
          <div className='flex w-full p-1'>
            <Link to='/manual/delete_manual' className='flex-1'>
              <button
                className={cn(
                  type === 'delete_manual' && 'border-black',
                  'w-full whitespace-nowrap border-b-2 p-[14px_12px] text-[14px] font-[500] leading-[20px]'
                )}
              >
                업로드된 장비 메뉴얼 삭제
              </button>
            </Link>
            <Link to='/manual/upload_manual' className='flex-1'>
              <button
                className={cn(
                  type === 'upload_manual' && 'border-black',
                  'w-full whitespace-nowrap border-b-2 p-[14px_12px] text-[14px] font-[500] leading-[20px]'
                )}
              >
                메뉴얼 업로드
              </button>
            </Link>
            <Link to='/manual/upload_master' className='flex-1'>
              <button
                className={cn(
                  type === 'upload_master' && 'border-black',
                  'w-full whitespace-nowrap border-b-2 p-[14px_12px] text-[14px] font-[500] leading-[20px]'
                )}
              >
                장비 마스터 업로드
              </button>
            </Link>
            <Link to='/manual/upload_accident' className='flex-1'>
              <button
                className={cn(
                  type === 'upload_accident' && 'border-black',
                  'w-full whitespace-nowrap border-b-2 p-[14px_12px] text-[14px] font-[500] leading-[20px]'
                )}
              >
                일탈 발생 내역 업로드
              </button>
            </Link>
          </div>
        </section>

        {type === 'delete_manual' && <DeleteManual />}
        {type === 'upload_manual' && <UploadManual />}
        {type === 'upload_master' && <UploadMaster />}
        {type === 'upload_accident' && <UploadAccident />}
      </div>
    </MfgLayout>
  );
};

export default MfgMain;
