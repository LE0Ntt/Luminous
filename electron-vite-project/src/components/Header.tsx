import React, { useState } from 'react'
import "./Header.modules.css";
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';

function Header() {
    let location = useLocation();

    const handleClick = () => {
      console.log('Changed to Darkmode! (nicht wirklich)');
    };
  
  return (
    <div className='header text-primaryLight flex'>
        <div className='w-90 h-full ml-2 mt-1'>
            Settings Help
        </div>
        <div className='w-20 h-full flex-auto'>
          <ul className="hidden md:flex justify-center items-center h-full ">
            <li>
              <Link to="/Home" className={location.pathname === '/Home' ? 'is-active' : ''}>
                <div className='button flex items-center justify-center'>
                    <div className='fill'></div>
                    <div className='buttonFont'>Studio</div>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Control" className={location.pathname === '/Control' ? 'is-active' : ''}>
              <div className='button flex items-center justify-center'>
                    <div className='fill'></div>
                    <div className='buttonFont'>Control</div>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Scenes" className={location.pathname === '/Scenes' ? 'is-active' : ''}>
              <div className='button flex items-center justify-center'>
                    <div className='fill'></div>
                    <div className='buttonFont'>Scenes</div>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Show" className={location.pathname === '/Show' ? 'is-active' : ''}>
              <div className='button flex items-center justify-center'>
                    <div className='fill'></div>
                    <div className='buttonFont'>Show</div>
                </div>
              </Link>
            </li>
          </ul>
        </div>
        <div className='w-90px bg-pink-200 flex justify-center items-center h-full'>
            <Button onClick={handleClick}>Click me</Button>
        </div>
    </div>
  )
}

export default Header