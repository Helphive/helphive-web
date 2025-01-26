import React, { useEffect, useState } from 'react';

const Cursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Event listener for mouse movement
    const handleMouseMove = (e) => {
      setCursorPosition({
        x: e.clientX, // Offset to center the cursor
        y: e.clientY, // Offset to center the cursor
      });
    };

    // Add mousemove event listener to the window
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div>
      {/* Custom Circle Cursor with inline styling */}
      <div
        style={{
          position: 'absolute',
          width: '30px',  // Size of the circle
          height: '30px', // Size of the circle
          backgroundColor: 'orange', // Background color
          borderRadius: '50%', // Makes it a circle
          pointerEvents: 'none', // Prevents interference with other elements
          transform: 'translate(-50%, -50%)', // Centers the cursor over the mouse
          left: `${cursorPosition.x}px`, // Position the cursor horizontally
          top: `${cursorPosition.y}px`,  // Position the cursor vertically
    
        }}
      ></div>
    </div>
  );
};

export default Cursor;
