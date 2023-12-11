interface IconNoteProps {
  color?: string; // Optional prop for color+
  size?: string; // Optional prop for size
}

const IconNote: React.FC<IconNoteProps> = ({ color = 'currentColor', size = '24px' }) => {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox='0 0 29 29'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0_2207_34606)'>
          <path
            d='M8.28906 26.8076C8.86328 26.8076 9.26172 26.5029 9.97656 25.8701L14.0195 22.2724H21.5429C25.0351 22.2724 26.9101 20.3388 26.9101 16.9053V7.92871C26.9101 4.49511 25.0351 2.56152 21.5429 2.56152H6.44922C2.95703 2.56152 1.08203 4.4834 1.08203 7.92871V16.9053C1.08203 20.3506 2.95703 22.2724 6.44922 22.2724H7.01172V25.3193C7.01172 26.2217 7.46875 26.8076 8.28906 26.8076ZM8.76953 24.6631V21.2646C8.76953 20.6318 8.52344 20.3857 7.89062 20.3857H6.44922C4.08203 20.3857 2.96875 19.1787 2.96875 16.8935V7.92871C2.96875 5.64355 4.08203 4.44824 6.44922 4.44824H21.5429C23.8984 4.44824 25.0234 5.64355 25.0234 7.92871V16.8935C25.0234 19.1787 23.8984 20.3857 21.5429 20.3857H13.9492C13.2929 20.3857 12.9648 20.4795 12.5195 20.9365L8.76953 24.6631Z'
            fill={color}
            /* fill-opacity='0.85' */
          />
          <path
            d='M13.9962 14.5263C14.5587 14.5263 14.8868 14.2099 14.8985 13.6006L15.0626 7.41309C15.0743 6.82715 14.6055 6.37012 13.9844 6.37012C13.3516 6.37012 12.9063 6.81544 12.918 7.40137L13.0704 13.6006C13.0821 14.1982 13.4102 14.5263 13.9962 14.5263ZM13.9962 18.3349C14.6759 18.3349 15.2618 17.8076 15.2618 17.1162C15.2618 16.4365 14.6876 15.9092 13.9962 15.9092C13.3048 15.9092 12.7305 16.4482 12.7305 17.1162C12.7305 17.7959 13.3165 18.3349 13.9962 18.3349Z'
            fill={color}
            /* fill-opacity='0.85' */
          />
        </g>
        <defs>
          <clipPath id='clip0_2207_34606'>
            <rect
              width='25.8281'
              height='25.7461'
              fill={color}
              transform='translate(1.08203 1.06152)'
            />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};

export default IconNote;