import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [nav, setNav] = useState(false);
  const handleClick = () => setNav(!nav);
  let location = useLocation();

  return (
    <div className="w-screen h-[80px] z-10  drop-shadow-lg milk-glass fixed">
      <div className="px-2 flex justify-between items-center w-full h-full">
        <div className="flex items-center">
          <h1 className="text-5xl OhmBold mr-4 sm:text-6xl">LUMINOUS.</h1>
          <ul className="hidden md:flex">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'is-active-white' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/Test1" className={location.pathname === '/Test1' ? 'is-active-white' : ''}>
                Test1
              </Link>
            </li>
            <li>
              <Link to="/Test2" className={location.pathname === '/Map' ? 'is-active-black' : ''}>
                Test2
              </Link>
            </li>
            <li>
              <Link to="/Test3" className={location.pathname === '/Information' ? 'is-active-white' : ''}>
                Test3
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
