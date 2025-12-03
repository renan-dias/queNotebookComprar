import React from 'react';
import { Notebook } from '../types';
import { Cpu, HardDrive, Monitor, Truck, ExternalLink, ShoppingBag } from 'lucide-react';

interface NotebookCardProps {
  notebook: Notebook;
}

const NotebookCard: React.FC<NotebookCardProps> = ({ notebook }) => {
  if (!notebook) return null;

  const formatPrice = (price: any) => {
    if (price === null || price === undefined) return 'Sob consulta';
    
    // If it's a number, format it
    if (typeof price === 'number') {
      return price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    
    // If it's a string that looks like a number
    const num = Number(price);
    if (!isNaN(num) && typeof price !== 'object') {
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }

    // If it's an object (error case), return placeholder to avoid React crash
    if (typeof price === 'object') {
        return 'Ver na loja';
    }
    
    return String(price);
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 shadow-xl hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all group flex flex-col h-full relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">{notebook.name || 'Notebook Sem Nome'}</h3>
          <div className="mt-2 flex items-baseline gap-1">
             <span className="text-xs text-slate-400 font-medium">R$</span>
             <p className="text-2xl font-bold text-green-400 tracking-tight">
               {formatPrice(notebook.price)}
             </p>
          </div>
        </div>
        {notebook.estimatedShipping && (
          <div className="flex flex-col items-end">
            <div className="flex items-center text-[10px] uppercase font-bold tracking-wider text-blue-300 bg-blue-900/30 px-2 py-1 rounded-full whitespace-nowrap border border-blue-500/20">
                <Truck size={10} className="mr-1" />
                {notebook.estimatedShipping}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <Cpu size={16} className="text-blue-500 flex-shrink-0" />
          <span className="truncate font-medium">{typeof notebook.specs?.cpu === 'string' ? notebook.specs.cpu : '-'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <div className="w-4 h-4 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px] flex-shrink-0">R</div>
          <span className="truncate font-medium">{typeof notebook.specs?.ram === 'string' ? notebook.specs.ram : '-'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <HardDrive size={16} className="text-purple-500 flex-shrink-0" />
          <span className="truncate font-medium">{typeof notebook.specs?.storage === 'string' ? notebook.specs.storage : '-'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <Monitor size={16} className="text-cyan-500 flex-shrink-0" />
          <span className="truncate font-medium">{typeof notebook.specs?.screen === 'string' ? notebook.specs.screen : '-'}</span>
        </div>
      </div>

      <div className="space-y-2 mb-6 flex-grow">
        {notebook.pros && Array.isArray(notebook.pros) && notebook.pros.length > 0 && (
            <div className="text-xs text-emerald-300 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/50 leading-relaxed">
            <span className="font-bold text-emerald-400 block mb-1">Destaques:</span> {notebook.pros.filter(p => typeof p === 'string').join(', ')}
            </div>
        )}
      </div>

      {/* Footer with Store Link */}
      <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
         <div className="flex items-center text-slate-400 text-xs font-medium">
            <ShoppingBag size={14} className="mr-1.5" />
            <span className="truncate max-w-[120px]">{typeof notebook.store === 'string' ? notebook.store : 'Loja Parceira'}</span>
         </div>
         
         {notebook.url && typeof notebook.url === 'string' ? (
            <a 
              href={notebook.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              <span>Ver na Loja</span>
              <ExternalLink size={14} />
            </a>
         ) : (
            <button disabled className="bg-slate-800 text-slate-500 px-4 py-2 rounded-xl text-sm font-medium cursor-not-allowed border border-slate-700">
              Indisponível
            </button>
         )}
      </div>
    </div>
  );
};

export default NotebookCard;