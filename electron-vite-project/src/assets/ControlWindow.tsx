import React from 'react';

interface ControlWindowProps {
  className: string;
  height: number;
  defaultB?: boolean;
  defaultC?: boolean;
}

const ControlWindow: React.FC<ControlWindowProps> = ({ className, height, defaultB, defaultC }) => {
  const variableHeight = height - 10;

  const CommonDefs = () => (
    <defs>
      <filter
        id='filter0_b_873_8277'
        x='-90'
        y='-93'
        width='2040'
        height='1110'
        filterUnits='userSpaceOnUse'
        colorInterpolationFilters='sRGB'
      >
        <feFlood floodOpacity='0' result='BackgroundImageFix' />
        <feGaussianBlur in='BackgroundImageFix' stdDeviation='50' />
        <feComposite in2='SourceAlpha' operator='in' result='effect1_backgroundBlur_873_8277' />
        <feBlend in='SourceGraphic' in2='effect1_backgroundBlur_873_8277' result='shape' />
      </filter>
      <filter
        id='filter1_d_873_8277'
        x='0'
        y='0'
        width='1860'
        height='930'
        filterUnits='userSpaceOnUse'
        colorInterpolationFilters='sRGB'
      >
        <feFlood floodOpacity='0' result='BackgroundImageFix' />
        <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' />
        <feOffset dy='3' />
        <feGaussianBlur stdDeviation='5' />
        <feComposite in2='hardAlpha' operator='out' />
        <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0' />
        <feBlend in2='BackgroundImageFix' result='effect1_dropShadow_873_8277' />
        <feBlend in='SourceGraphic' in2='effect1_dropShadow_873_8277' result='shape' />
      </filter>
    </defs>
  );

  return (
    <>
      {defaultB ? (
        // This is the defaultB case
        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <svg
            className={className.replace('controlMain', '')}
            width='1840'
            height='910'
            viewBox='0 0 1840 910'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g id='Main-Background'>
              <g filter='url(#filter0_ii_0_1)'>
                <path
                  d={`M0 10C0 4.47715 4.47715 0 10 0H1830C1835.52 0 1840 4.47715 1840 10V900C1840 905.523 1835.52 910 1830 910L414 910C408.477 910 404 905.523 404 900V${variableHeight}.5C404 ${
                    variableHeight - 4.523
                  } 399.523 ${variableHeight - 10} 394 ${variableHeight - 10}H10C4.47716 ${variableHeight - 10} 0 ${variableHeight - 14.477} 0 ${variableHeight - 20}V10Z`}
                  fill='var(--fillMedium)'
                />
              </g>
              <path
                d={`M1839.5 10V900C1839.5 905.247 1835.25 909.5 1830 909.5L414 909.5C408.753 909.5 404.5 905.247 404.5 900V${variableHeight}.5C404.5 ${variableHeight - 5.299} 399.799 ${
                  variableHeight - 10
                } 394 ${variableHeight - 10}H10C4.7533 ${variableHeight - 10} 0.5 ${variableHeight - 14.253} 0.5 ${
                  variableHeight - 19.5
                }V10C0.5 4.75329 4.75329 0.5 10 0.5H1830C1835.25 0.5 1839.5 4.7533 1839.5 10Z`}
                stroke='var(--fillMedium)'
              />
            </g>
            <defs>
              <filter
                id='filter0_ii_0_1'
                x='-4'
                y='-4'
                width='1848'
                height='918'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'
              >
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha' />
                <feOffset dx='4' dy='4' />
                <feGaussianBlur stdDeviation='6' />
                <feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
                <feColorMatrix
                  type='matrix'
                  values={'0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ' + (typeof window !== 'undefined' ? getComputedStyle(document.body).getPropertyValue('--controlDark') : '0.1') + ' 0'}
                />
                <feBlend mode='normal' in2='shape' result='effect1_innerShadow_0_1' />
                <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha' />
                <feOffset dx='-4' dy='-4' />
                <feGaussianBlur stdDeviation='6' />
                <feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
                <feColorMatrix
                  type='matrix'
                  values={'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ' + (typeof window !== 'undefined' ? getComputedStyle(document.body).getPropertyValue('--controlBright') : '0.1') + ' 0'}
                />
                <feBlend mode='normal' in2='effect1_innerShadow_0_1' result='effect2_innerShadow_0_1' />
              </filter>
            </defs>
          </svg>
        </div>
      ) : (
        // This is the combined case for the original default and defaultC
        <svg
          className={className}
          width='1860'
          height='930'
          viewBox='0 0 1860 930'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <g filter={!defaultC ? 'url(#filter0_b_873_8277)' : undefined}>
            <g
              filter={!defaultC ? 'url(#filter1_d_873_8277)' : undefined}
              shapeRendering='geometricPrecision'
            >
              <path
                d={`M10 17A10 10 0 0120 7h1820a10 10 0 0110 10v890a10 10 0 01-10 10H424a10 10 0 01-10-10V${height}a10 10 0 00-10-10H20a10 10 0 01-10-10V17z`}
                fill={defaultC ? 'var(--backgroundAverage)' : 'var(--fillMedium)'}
              />
              <path
                d={`M1849.5 17v890a9.5 9.5 0 01-9.5 9.5H424a9.5 9.5 0 01-9.5-9.5V${height}c0-5.8-4.7-10.5-10.5-10.5H20a9.5 9.5 0 01-9.5-9.5V17A9.5 9.5 0 0120 7.5h1820a9.5 9.5 0 019.5 9.5z`}
                stroke='var(--onepStroke)'
              />
            </g>
          </g>
          <CommonDefs />
        </svg>
      )}
    </>
  );
};

export default ControlWindow;
