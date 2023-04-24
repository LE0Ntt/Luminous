import { memo, SVGProps } from 'react';

const TuneIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg preserveAspectRatio='none' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <mask
      id='mask0_369_2200'
      style={{
        maskType: 'alpha',
      }}
      maskUnits='userSpaceOnUse'
      x={0}
      y={0}
      width={24}
      height={24}
    >
      <rect y={24} width={24} height={24} transform='rotate(-90 0 24)' fill='#D9D9D9' />
    </mask>
    <g mask='url(#mask0_369_2200)'>
      <path
        d='M21 14H15V12H17V4H19V12H21V14ZM19 22H17V16H19V22ZM15 18H13V22H11V18H9V16H15V18ZM13 14H11L11 4H13L13 14ZM9 10H3V8H5V4H7V8H9V10ZM7 22H5V12H7L7 22Z'
        fill='black'
        fillOpacity={0.85}
      />
    </g>
  </svg>
);
const Memo = memo(TuneIcon);
export { Memo as TuneIcon };
