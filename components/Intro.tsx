import React, { useEffect, useState } from 'react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Sequence the animation
    const t1 = setTimeout(() => setIsOpen(true), 500); // Start opening
    const t2 = setTimeout(() => setScreenOn(true), 1500); // Turn screen on
    const t3 = setTimeout(() => setFadeOut(true), 3500); // Start fading out component
    const t4 = setTimeout(onComplete, 4000); // Fully remove

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [onComplete]);

  if (fadeOut) return <div className="fixed inset-0 bg-slate-950 z-50 transition-opacity duration-500 opacity-0 pointer-events-none" />;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center overflow-hidden">
      <div className="text-blue-500 mb-8 font-bold text-2xl tracking-widest opacity-80 animate-pulse">
        QUE NOTEBOOK COMPRAR?
      </div>
      
      <div className="laptop-scene w-64 h-40 md:w-96 md:h-56">
        <div className="laptop-wrapper relative w-full h-full">
          
          {/* Base */}
          <div className="absolute bottom-0 w-full h-4 bg-slate-700 rounded-b-xl shadow-2xl transform translate-z-2 border-b-2 border-slate-600">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-slate-800 rounded-b-md"></div>
          </div>
          
          {/* Keyboard Surface (Flat) */}
          <div className="absolute bottom-4 w-full h-full bg-slate-800 rounded-lg transform rotateX(90deg) origin-bottom translate-y-full">
             {/* Simple Keyboard Visual */}
             <div className="grid grid-cols-12 gap-1 p-2 h-full opacity-30">
               {[...Array(48)].map((_, i) => (
                 <div key={i} className="bg-slate-400 rounded-sm h-1.5"></div>
               ))}
             </div>
          </div>

          {/* Lid */}
          <div 
            className={`laptop-lid absolute top-0 w-full h-full bg-slate-800 rounded-t-xl border-t-2 border-slate-600 origin-bottom shadow-xl flex items-center justify-center ${isOpen ? 'rotate-x-[-100deg]' : 'rotate-x-0'}`}
            style={{ transform: isOpen ? 'rotateX(-100deg)' : 'rotateX(0deg)' }}
          >
            {/* Back of Lid (Logo) */}
            <div className="laptop-logo absolute inset-0 bg-slate-900 rounded-t-xl flex items-center justify-center">
               <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
               </div>
            </div>

            {/* Screen */}
            <div className="laptop-screen absolute inset-1 bg-black rounded-t-lg overflow-hidden border border-slate-700 flex flex-col items-center justify-center">
               <div className={`transition-opacity duration-700 ${screenOn ? 'opacity-100' : 'opacity-0'} w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center`}>
                  <p className="text-white text-xs font-mono">INITIALIZING SYSTEM...</p>
                  <div className="w-3/4 h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-full animate-[width_2s_ease-out]"></div>
                  </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Intro;
