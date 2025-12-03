import React from 'react';
import { useLiveGemini } from '../hooks/useLiveGemini';
import { Mic, MicOff, PhoneOff, Activity } from 'lucide-react';

interface LiveSessionProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveSession: React.FC<LiveSessionProps> = ({ isOpen, onClose }) => {
  const { status, connect, disconnect, isMuted, toggleMute, volumeLevel } = useLiveGemini();

  // Auto connect when opened
  React.useEffect(() => {
    if (isOpen && status === 'disconnected') {
      connect();
    }
  }, [isOpen, connect, status]);

  // Auto disconnect when closed
  React.useEffect(() => {
    if (!isOpen && status === 'connected') {
      disconnect();
    }
  }, [isOpen, disconnect, status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700 flex flex-col items-center">
        
        <div className="absolute top-4 right-4">
           <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-white">
             <span className="sr-only">Fechar</span>
             ✕
           </button>
        </div>

        <div className="mb-8 mt-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
             {/* Visualizer Circle */}
             <div 
               className="absolute inset-0 rounded-full bg-blue-500 opacity-20 transition-all duration-75"
               style={{ transform: `scale(${1 + volumeLevel * 5})` }}
             ></div>
             <div 
               className="absolute inset-2 rounded-full bg-blue-400 opacity-20 transition-all duration-75"
               style={{ transform: `scale(${1 + volumeLevel * 3})` }}
             ></div>
             
             <div className="relative z-10 w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-inner">
               {status === 'connecting' ? (
                 <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
               ) : (
                 <Activity className={`w-10 h-10 ${status === 'connected' ? 'text-blue-500 animate-pulse' : 'text-slate-500'}`} />
               )}
             </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Consultor ao Vivo</h2>
        <p className="text-slate-400 text-center mb-8">
          {status === 'connecting' ? 'Conectando ao especialista...' : 
           status === 'connected' ? 'Pode falar, estou ouvindo.' : 
           'Sessão encerrada.'}
        </p>

        <div className="flex gap-6">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={onClose}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
          >
            <PhoneOff size={24} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default LiveSession;
