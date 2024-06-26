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
 * @file ScrollButton.tsx
 */
import React, { useState, useEffect } from 'react';

interface ScrollButtonProps {
  scrollRef: React.RefObject<HTMLElement>;
  elementWidth: number;
  elementsInView: number;
  direction: 'prev' | 'next';
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ scrollRef, elementWidth, elementsInView, direction }) => {
  const [canScroll, setCanScroll] = useState(direction === 'next');

  const updateCanScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (direction === 'prev') {
        setCanScroll(scrollLeft > 0);
      } else {
        setCanScroll(scrollLeft < scrollWidth - clientWidth);
      }
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', updateCanScroll);
    updateCanScroll(); // Initial check

    // MutationObserver to detect changes in the scroll element
    const observer = new MutationObserver(updateCanScroll);
    observer.observe(scrollElement, { childList: true });

    return () => {
      scrollElement.removeEventListener('scroll', updateCanScroll);
      observer.disconnect();
    };
  }, [scrollRef, direction]);

  const calculateScroll = () => {
    if (!scrollRef.current) return;
    const baseScroll = Math.floor(scrollRef.current.scrollLeft / elementWidth) * elementWidth;
    scrollRef.current.scrollTo({
      left: direction === 'next' ? baseScroll + elementWidth * elementsInView : Math.max(0, baseScroll - elementWidth * elementsInView),
      behavior: 'smooth',
    });
  };

  if (!canScroll) return null;

  return (
    <button
      onClick={calculateScroll}
      className='scrollButton'
      style={direction === 'prev' ? { transform: 'rotateY(180deg)', left: '0' } : {}}
    />
  );
};

export default ScrollButton;
