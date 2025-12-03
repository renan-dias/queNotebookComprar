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
    <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 shadow-lg hover:border-blue-500/50 transition-all group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">{notebook.name || 'Notebook Sem Nome'}</h3>
          <p className="text-2xl font-light text-green-400 mt-1">
            R$ {formatPrice(notebook.price)}
          </p>
        </div>
        {notebook.estimatedShipping && (
          <div className="flex items-center text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded whitespace-nowrap ml-2">
            <Truck size={12} className="mr-1" />
            {notebook.estimatedShipping}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <Cpu size={16} className="text-blue-500 flex-shrink-0" />
          <span className="truncate">{typeof notebook.specs?.cpu === 'string' ? notebook.specs.cpu : '-'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <div className="w-4 h-4 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px] flex-shrink-0">R</div>
          <span className="truncate">{typeof notebook.specs?.ram === 'string' ? notebook.specs.ram : '-'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <HardDrive size={16} className="text-purple-500 flex-shrink-0" />
          <span className="truncate">{typeof notebook.specs?.storage === 'string' ? notebook.specs.storage : '-'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <Monitor size={16} className="text-cyan-500 flex-shrink-0" />
          <span className="truncate">{typeof notebook.specs?.screen === 'string' ? notebook.specs.screen : '-'}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 flex-grow">
        {notebook.pros && Array.isArray(notebook.pros) && notebook.pros.length > 0 && (
            <div className="text-xs text-green-300 bg-green-900/20 p-2 rounded border border-green-900/50">
            <span className="font-bold">Prós:</span> {notebook.pros.filter(p => typeof p === 'string').join(', ')}
            </div>
        )}
      </div>

      {/* Footer with Store Link */}
      <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
         <div className="flex items-center text-slate-400 text-xs">
            <ShoppingBag size={14} className="mr-1.5" />
            <span className="truncate max-w-[100px]">{typeof notebook.store === 'string' ? notebook.store : 'Loja Parceira'}</span>
         </div>
         
         {notebook.url && typeof notebook.url === 'string' ? (
            <a 
              href={notebook.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
            >
              <span>Ver na Loja</span>
              <ExternalLink size={14} />
            </a>
         ) : (
            <button disabled className="text-slate-500 text-sm cursor-not-allowed">
              Indisponível
            </button>
         )}
      </div>
    </div>
  );
};

export default NotebookCard;