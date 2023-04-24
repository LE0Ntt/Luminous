import { memo, SVGProps } from 'react';

const Camera_indoorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg preserveAspectRatio='none' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <mask
      id='mask0_369_2197'
      style={{
        maskType: 'alpha',
      }}
      maskUnits='userSpaceOnUse'
      x={0}
      y={0}
      width={24}
      height={24}
    >
      <rect width={24} height={24} fill='#D9D9D9' />
    </mask>
    <g mask='url(#mask0_369_2197)'>
      <path
        d='M13 17H17C17.2833 17 17.5208 16.9042 17.7125 16.7125C17.9042 16.5208 18 16.2833 18 16V15L20 16.05V11.95L18 13V12C18 11.7167 17.9042 11.4792 17.7125 11.2875C17.5208 11.0958 17.2833 11 17 11H13C12.7167 11 12.4792 11.0958 12.2875 11.2875C12.0958 11.4792 12 11.7167 12 12V16C12 16.2833 12.0958 16.5208 12.2875 16.7125C12.4792 16.9042 12.7167 17 13 17ZM8 21V9L16 3L24 9V21H8ZM10 19H22V10L16 5.5L10 10V19Z'
        fill='black'
        fillOpacity={0.85}
      />
    </g>
  </svg>
);
const Memo = memo(Camera_indoorIcon);
export { Memo as Camera_indoorIcon };
