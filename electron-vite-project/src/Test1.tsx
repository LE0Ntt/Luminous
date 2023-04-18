import React from 'react';
import HSLColorPicker from './components/HSLColorPicker';
import CIEColorPicker from './CIEColorPicker';

const Test1 = () => {
  return (
    <div className='m-20'>
      {/*<HSLColorPicker onColorSelected={undefined}/>*/}
      <CIEColorPicker/>
    </div>
  );
}

export default Test1;
