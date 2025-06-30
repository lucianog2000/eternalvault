import React, { useState } from 'react';
import { X } from 'lucide-react';

const PoweredByRibbon: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const technologies = [
    {
      name: 'Supabase',
      image: '/supabase.svg',
      description: 'Database & Auth',
      color: 'from-slate-600 to-slate-700',
      status: 'active',
      url: 'https://supabase.com'
    },
    {
      name: 'RevenueCat',
      image: '/revenueCat.svg',
      description: 'Subscription Management',
      color: 'from-blue-500 to-cyan-500',
      status: 'active',
      url: 'https://revenuecat.com'
    },
    {
      name: 'Lingo.dev',
      image: '/lingo.svg',
      description: 'AI Translation',
      color: 'from-blue-500 to-cyan-500',
      status: 'active',
      url: 'https://lingo.dev'
    },
    {
      name: 'Netlify',
      image: '/white_netlify.svg',
      description: 'Hosting',
      color: 'from-blue-500 to-cyan-500',
      status: 'active',
      url: 'https://netlify.com'
    },
    {
      name: 'Entri',
      image: '/white_entry.svg',
      description: 'Domain Registration',
      color: 'from-blue-500 to-cyan-500',
      status: 'active',
      url: 'https://www.entri.com/'
    },
    {
      name: 'ElevenLabs',
      image: '/white_elevenLabs.svg',
      description: 'Voice AI',
      color: 'from-orange-500 to-red-500',
      status: 'soon',
      url: 'https://elevenlabs.io'
    }
  ];

  const handleTechClick = (tech: any) => {
    window.open(tech.url, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-black/80 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-visible relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 p-1 text-white/60 hover:text-white hover:bg-red-500/20 rounded-full transition-all z-20"
          title="Close powered by ribbon"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Content */}
        <div className="p-3 min-w-[200px]">
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-white/60 text-xs font-medium">Powered by</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {technologies.map((tech, index) => (
              <div
                key={tech.name}
                className="group relative flex flex-col items-center w-16"
              >
                {/* Technology Icon */}
                <div 
                  className={`w-8 h-8 bg-gradient-to-br ${tech.color} rounded-lg flex items-center justify-center relative transition-all group-hover:scale-110 cursor-pointer hover:shadow-lg p-1`}
                  onClick={() => handleTechClick(tech)}
                  title={tech.description}
                >
                  <img src={tech.image} alt={tech.name} className="w-5 h-5 object-contain" />
                  
                  {/* Soon Badge */}
                  {tech.status === 'soon' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold leading-none">!</span>
                    </div>
                  )}
                </div>
                
                {/* Technology Name */}
                <span 
                  className="text-white/70 text-xs mt-1 font-medium transition-colors group-hover:text-white cursor-pointer hover:text-purple-300 text-center leading-tight"
                  onClick={() => handleTechClick(tech)}
                  title={tech.description}
                >
                  {tech.name}
                </span>
                
                {/* Simple Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] whitespace-nowrap">
                  <div className="bg-black/95 text-white text-xs px-2 py-1 rounded border border-white/20">
                    {tech.description}
                    {tech.status === 'soon' && (
                      <span className="text-yellow-400 ml-1">(Soon)</span>
                    )}
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-black/95"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Separator */}
          <div className="w-full h-px bg-white/10 my-2"></div>
          
          {/* EternalVault Branding */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-white/80 text-xs font-semibold">EternalVault</span>
            <span className="text-white/40 text-xs">2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoweredByRibbon;