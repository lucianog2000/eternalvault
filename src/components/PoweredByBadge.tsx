import React, { useState } from 'react';
import { ExternalLink, Zap } from 'lucide-react';

const PoweredByBadge: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open('https://bolt.new', '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed top-4 left-4 z-50 group cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="Powered by Bolt.new - Click to visit Bolt.new"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Main Badge Container */}
      <div className={`
        relative flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2.5
        bg-white/95 backdrop-blur-md rounded-full border border-white/20
        shadow-lg hover:shadow-xl transition-all duration-300 ease-out
        transform hover:scale-105 hover:-translate-y-0.5
        ${isHovered ? 'bg-white' : ''}
      `}>
        {/* Bolt.new Logo Circle */}
        <div className={`
          relative w-6 h-6 lg:w-7 lg:h-7 rounded-full overflow-hidden
          transition-transform duration-300 ease-out
          ${isHovered ? 'rotate-12 scale-110' : ''}
        `}>
          <img 
            src="/white_circle_360x360.png" 
            alt="Bolt.new logo"
            className="w-full h-full object-cover"
          />
          {/* Animated overlay */}
          <div className={`
            absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `} />
        </div>

        {/* Text Content */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-700 font-medium text-xs lg:text-sm whitespace-nowrap">
            Powered by
          </span>
          <span className={`
            font-bold text-xs lg:text-sm transition-colors duration-300
            ${isHovered ? 'text-purple-600' : 'text-slate-900'}
          `}>
            Bolt.new
          </span>
        </div>

        {/* External Link Icon */}
        <div className={`
          transition-all duration-300 ease-out
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}
        `}>
          <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600" />
        </div>

        {/* Animated Lightning Bolt */}
        <div className={`
          absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5
          bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full
          flex items-center justify-center shadow-md
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-110 rotate-12' : 'scale-100'}
        `}>
          <Zap className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white fill-current" />
        </div>

        {/* Hover Glow Effect */}
        <div className={`
          absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `} />
      </div>

      {/* Tooltip */}
      <div className={`
        absolute top-full left-1/2 transform -translate-x-1/2 mt-2
        px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg
        whitespace-nowrap pointer-events-none
        transition-all duration-200 ease-out
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
      `}>
        Built with Bolt.new AI
        {/* Tooltip Arrow */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
      </div>

      {/* Subtle Pulse Animation */}
      <div className={`
        absolute inset-0 rounded-full border-2 border-purple-400/30
        transition-all duration-1000 ease-out
        ${isHovered ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
      `} />
    </div>
  );
};

export default PoweredByBadge;