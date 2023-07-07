/**
 * Luminous - A Web-Based Lighting Control System
 * 
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 * 
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 * 
 * @file Add.tsx
 */
import '../Color.css';
import '../index.css';

function Add() {
  return (
    <div>
        <svg 
            className='addIcon'
            xmlns="http://www.w3.org/2000/svg" 
            height="24" 
            viewBox="0 -960 960 960" 
            width="24">
            <path d="M480-200q-17 0-28.5-11.5T440-240v-200H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200Z"/>
        </svg>
    </div>
  )
}

export default Add