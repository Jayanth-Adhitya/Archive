import React from 'react';

const FloatingLogos = () => {
  // Generate random positions and animation delays for bubbles
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100, // Random horizontal position (0-100%)
    size: 30 + Math.random() * 60, // Random size between 30-90px
    duration: 15 + Math.random() * 20, // Random duration between 15-35s
    delay: Math.random() * 10, // Random delay between 0-10s
    opacity: 0.2 + Math.random() * 0.1, // Random opacity between 0.2-0.3 (75% transparent)
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute floating-bubble"
          style={{
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
            opacity: bubble.opacity,
          }}
        >
          <img
            src="https://mehh.ae/images/logo2.png"
            alt=""
            className="w-full h-full object-contain"
            style={{ filter: 'brightness(1.5)' }}
          />
        </div>
      ))}
    </div>
  );
};

export default FloatingLogos;
