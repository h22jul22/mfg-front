import type { SVGProps } from 'react';
import { Ref, forwardRef, memo } from 'react';
const SvgCheck = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    fill={props.color ?? 'var(--grey500)'}
    ref={ref}
    {...props}
  >
    <mask
      id="mask0_12_4086"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={20}
    >
      <rect width={20} height={20} />
    </mask>
    <g mask="url(#mask0_12_4086)">
      <path d="M7.95842 12.625L15.0209 5.5625C15.1876 5.39583 15.382 5.3125 15.6043 5.3125C15.8265 5.3125 16.0209 5.39583 16.1876 5.5625C16.3543 5.72917 16.4376 5.92708 16.4376 6.15625C16.4376 6.38542 16.3543 6.58333 16.1876 6.75L8.54176 14.4167C8.37509 14.5833 8.18065 14.6667 7.95842 14.6667C7.7362 14.6667 7.54176 14.5833 7.37509 14.4167L3.79176 10.8333C3.62509 10.6667 3.54523 10.4688 3.55217 10.2396C3.55912 10.0104 3.64592 9.8125 3.81259 9.64583C3.97926 9.47917 4.17717 9.39583 4.40634 9.39583C4.63551 9.39583 4.83342 9.47917 5.00009 9.64583L7.95842 12.625Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(SvgCheck);
const Memo = memo(ForwardRef);
export default Memo;
