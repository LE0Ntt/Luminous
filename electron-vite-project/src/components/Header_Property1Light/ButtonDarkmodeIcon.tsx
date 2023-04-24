import { memo, SVGProps } from 'react';

const ButtonDarkmodeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg preserveAspectRatio='none' viewBox='0 0 39 38' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <mask
      id='mask0_369_2193'
      style={{
        maskType: 'alpha',
      }}
      maskUnits='userSpaceOnUse'
      x={1}
      y={1}
      width={37}
      height={37}
    >
      <rect x={1} y={1} width={37} height={37} fill='#D9D9D9' />
    </mask>
    <g mask='url(#mask0_369_2193)'>
      <path
        d='M19.5 33.375C15.6458 33.375 12.3698 32.026 9.67187 29.3281C6.97396 26.6302 5.625 23.3542 5.625 19.5C5.625 15.6458 6.97396 12.3698 9.67187 9.67187C12.3698 6.97396 15.6458 5.625 19.5 5.625C19.8597 5.625 20.213 5.63785 20.5599 5.66354C20.9068 5.68924 21.2472 5.72778 21.5813 5.77917C20.5278 6.52431 19.6863 7.49427 19.0568 8.68906C18.4273 9.88385 18.1125 11.175 18.1125 12.5625C18.1125 14.875 18.9219 16.8406 20.5406 18.4594C22.1594 20.0781 24.125 20.8875 26.4375 20.8875C27.8507 20.8875 29.1483 20.5727 30.3302 19.9432C31.5122 19.3137 32.4757 18.4722 33.2208 17.4187C33.2722 17.7528 33.3108 18.0932 33.3365 18.4401C33.3622 18.787 33.375 19.1403 33.375 19.5C33.375 23.3542 32.026 26.6302 29.3281 29.3281C26.6302 32.026 23.3542 33.375 19.5 33.375ZM19.5 30.2917C21.7611 30.2917 23.791 29.6686 25.5896 28.4224C27.3882 27.1762 28.6986 25.551 29.5208 23.5469C29.0069 23.6753 28.4931 23.7781 27.9792 23.8552C27.4653 23.9323 26.9514 23.9708 26.4375 23.9708C23.2771 23.9708 20.5856 22.8595 18.363 20.637C16.1405 18.4144 15.0292 15.7229 15.0292 12.5625C15.0292 12.0486 15.0677 11.5347 15.1448 11.0208C15.2219 10.5069 15.3247 9.99306 15.4531 9.47917C13.449 10.3014 11.8238 11.6118 10.5776 13.4104C9.33142 15.209 8.70833 17.2389 8.70833 19.5C8.70833 22.4806 9.76181 25.0243 11.8688 27.1312C13.9757 29.2382 16.5194 30.2917 19.5 30.2917Z'
        fill='black'
        fillOpacity={0.85}
      />
    </g>
  </svg>
);
const Memo = memo(ButtonDarkmodeIcon);
export { Memo as ButtonDarkmodeIcon };