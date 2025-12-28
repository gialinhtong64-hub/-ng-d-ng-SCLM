import React, { useState, useRef, useEffect } from "react";

interface FloatingCSKHProps {
  onOpen: () => void;
}

const FloatingCSKH: React.FC<FloatingCSKHProps> = ({ onOpen }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Initialize position (bottom right)
  useEffect(() => {
    const initX = window.innerWidth - 80;
    const initY = window.innerHeight - 150;
    setPosition({ x: initX, y: initY });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setShowTooltip(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep within bounds
      const maxX = window.innerWidth - 70;
      const maxY = window.innerHeight - 70;
      
      setPosition({
        x: Math.max(10, Math.min(newX, maxX)),
        y: Math.max(10, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, dragStart, position]);

  // Update position via transform
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
  }, [position]);

  const handleClick = () => {
    if (!isDragging) {
      onOpen();
    }
  };

  return (
    <>
      <div
        ref={buttonRef}
        className={`fixed z-50 cursor-move ${isDragging ? '' : 'transition-all duration-300'}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => !isDragging && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 blur-xl animate-pulse" />
        
        {/* Main button */}
        <button
          onClick={handleClick}
          className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 border-4 border-white/20 ${isDragging ? 'pointer-events-none' : ''}`}
        >
          {/* Chat icon with animation */}
          <div className="relative">
            <svg 
              className="w-8 h-8 text-white drop-shadow-lg" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <circle cx="8" cy="10" r="1.5" fill="white"/>
              <circle cx="12" cy="10" r="1.5" fill="white"/>
              <circle cx="16" cy="10" r="1.5" fill="white"/>
            </svg>
            
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-bounce" />
          </div>
        </button>

        {/* Tooltip */}
        {showTooltip && !isDragging && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap">
            <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-medium">
              Chăm sóc khách hàng
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="border-8 border-transparent border-l-slate-800" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag hint on first render */}
      {!isDragging && (
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}
        </style>
      )}
    </>
  );
};

export default FloatingCSKH;
