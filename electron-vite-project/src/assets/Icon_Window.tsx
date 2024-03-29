interface IconWindowProps {
  color?: string; // Optional prop for color+
  size?: string; // Optional prop for size
}

const IconWindow: React.FC<IconWindowProps> = ({ color = 'currentColor', size = '24px' }) => {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox='0 0 28 29'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0_2207_37536)'>
          <path
            d='M5.11573 12.6326H11.6196C12.8149 12.6326 13.5063 11.9294 13.5063 10.7341V4.24194C13.5063 3.63257 13.0493 3.1521 12.4282 3.1521C11.8071 3.1521 11.3618 3.62085 11.3618 4.24194V5.22632L11.6079 9.31616L8.51416 6.07007L4.91651 2.43726C4.71729 2.22632 4.44776 2.12085 4.16651 2.12085C3.49854 2.12085 3.00635 2.56616 3.00635 3.22241C3.00635 3.5271 3.12354 3.82007 3.33447 4.031L6.94385 7.64038L10.1899 10.7224L6.1001 10.488H5.11573C4.49463 10.488 4.01416 10.9216 4.01416 11.5544C4.01416 12.1756 4.48291 12.6326 5.11573 12.6326ZM16.354 24.5271C16.9751 24.5271 17.4204 24.0701 17.4204 23.4373V22.324L17.1743 18.2459L20.268 21.492L23.9477 25.1951C24.1469 25.406 24.4047 25.5115 24.6977 25.5115C25.354 25.5115 25.8461 25.0662 25.8461 24.4099C25.8461 24.1052 25.7407 23.8123 25.5297 23.6013L21.8383 19.9099L18.5805 16.8279L22.6821 17.0623H23.7954C24.4165 17.0623 24.8969 16.6287 24.8969 16.0076C24.8969 15.3748 24.4282 14.9295 23.7954 14.9295H17.1625C15.9672 14.9295 15.2758 15.6209 15.2758 16.8162V23.4373C15.2758 24.0584 15.7211 24.5271 16.354 24.5271Z'
            fill={color}
            /* fill-opacity='0.85' */
          />
        </g>
        <defs>
          <clipPath id='clip0_2207_37536'>
            <rect
              width='22.8398'
              height='23.4961'
              fill={color}
              transform='translate(3.00635 2.01538)'
            />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};

export default IconWindow;
