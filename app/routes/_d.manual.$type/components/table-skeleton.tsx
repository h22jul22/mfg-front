// 스켈레톤 셀
export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`h-4 w-full animate-pulse rounded bg-gray-200/80 ${className}`} />;
}

// 테이블 스켈레톤 바디
export function TableBodySkeleton({ rows = 8, cols }: { rows?: number; cols: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className='h-[60px] border-b border-b-[var(--grey300)] last:border-b-0'>
          {/* 체크박스 + 번호 칸 */}
          <td className='border-r-2 border-grey-300 px-[10px]'>
            <div className='flex items-center gap-2'>
              <div className='size-[16px] animate-pulse rounded bg-gray-200' />
              <SkeletonBlock className='w-6' />
            </div>
          </td>
          {/* 데이터 칸들 */}
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className='px-[10px]'>
              <SkeletonBlock />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
