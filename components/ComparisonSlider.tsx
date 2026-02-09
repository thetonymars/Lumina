
import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  original: string;
  current: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, current }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl cursor-col-resize select-none bg-neutral-200"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Generated Image (Right Side) */}
      <img 
        src={current} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Original Image (Left Side) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={original} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (sliderPosition / 100)}%` }}
        />
      </div>

      {/* Slider Divider */}
      <div 
        className="absolute inset-y-0 bg-white w-1 shadow-lg pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
          <i className="fa-solid fa-arrows-left-right text-gray-600 text-sm"></i>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded">ORIGINAL</div>
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded">REIMAGINED</div>
    </div>
  );
};

export default ComparisonSlider;
