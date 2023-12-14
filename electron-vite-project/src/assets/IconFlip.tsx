interface IconFlipProps {
  color?: string; // Optional prop for color+
  size?: string; // Optional prop for size
}

const IconFlip: React.FC<IconFlipProps> = ({ color = 'currentColor', size = '24px' }) => {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox='0 0 29 29'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0_2207_37020)'>
          <path
            d='M2.1549 20.6054C1.68615 22.4804 2.61193 23.6523 4.70958 23.6523H23.2838C25.3931 23.6523 26.3072 22.4804 25.8502 20.6054L22.5924 7.375C22.1588 5.60547 21.1744 4.66797 19.2759 4.66797H8.72911C6.81895 4.66797 5.8463 5.60547 5.40098 7.375L2.1549 20.6054ZM3.93614 20.6054L7.08848 7.62109C7.2877 6.8125 7.76817 6.4375 8.64708 6.4375H19.358C20.2369 6.4375 20.7174 6.8125 20.9166 7.62109L24.0572 20.6054C24.2564 21.3789 23.8697 21.8828 23.108 21.8828H4.88536C4.13536 21.8828 3.74864 21.3789 3.93614 20.6054ZM14.0142 28.1757C14.5533 28.1757 14.8931 27.8125 14.8931 27.2383V1.08203C14.8931 0.496093 14.5533 0.144531 14.0142 0.144531C13.4634 0.144531 13.1236 0.496093 13.1236 1.08203V27.2383C13.1236 27.8125 13.4634 28.1757 14.0142 28.1757Z'
            fill={color}
            /* fill-opacity='0.85' */
          />
        </g>
        <defs>
          <clipPath id='clip0_2207_37020'>
            <rect
              width='23.9296'
              height='28.1602'
              fill={color}
              transform='translate(2.03564 0.144531)'
            />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};

export default IconFlip;
