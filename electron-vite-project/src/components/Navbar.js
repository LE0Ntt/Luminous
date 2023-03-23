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
          <h1 className="text-5xl OhmBold mr-4 sm:text-6xl">BRAND.</h1>
          <ul className="hidden md:flex">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'is-active-white' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/Contact" className={location.pathname === '/Contact' ? 'is-active-white' : ''}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/Map" className={location.pathname === '/Map' ? 'is-active-black' : ''}>
                Map
              </Link>
            </li>
            <li>
              <Link to="/Information" className={location.pathname === '/Information' ? 'is-active-white' : ''}>
                Information
              </Link>
            </li>
          </ul>
        </div>
        <button className="md:hidden" onClick={handleClick} type="">
          MENU
        </button>
      </div>
      <ul className={!nav ? 'hidden' : 'absolute milk-glass w-full px-8'}>
        <li className="border-b-2 border-zinc-200 w-full">
          <Link to="/">Home</Link>
        </li>
        <li className="border-b-2 border-zinc-200 w-full">
          <Link to="/Contact">Contact</Link>
        </li>
        <li className="border-b-2 border-zinc-200 w-full">
          <Link to="/Map">Map</Link>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
