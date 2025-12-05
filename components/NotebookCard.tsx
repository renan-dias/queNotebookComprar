import React from 'react';
import { Notebook } from '../types';
import { Cpu, HardDrive, Monitor, Battery, Truck } from 'lucide-react';

interface NotebookCardProps {
  notebook: Notebook;
}

const NotebookCard: React.FC<NotebookCardProps> = ({ notebook }) => {
  return (
    <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 shadow-lg hover:border-blue-500/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{notebook.name}</h3>
          <p className="text-2xl font-light text-green-400 mt-1">
            R$ {notebook.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        {notebook.estimatedShipping && (
          <div className="flex items-center text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
            <Truck size={12} className="mr-1" />
            {notebook.estimatedShipping}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <Cpu size={16} className="text-blue-500" />
          <span>{notebook.specs.cpu}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <div className="w-4 h-4 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px]">R</div>
          <span>{notebook.specs.ram}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <HardDrive size={16} className="text-purple-500" />
          <span>{notebook.specs.storage}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          <Monitor size={16} className="text-cyan-500" />
          <span>{notebook.specs.screen}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-green-300 bg-green-900/20 p-2 rounded border border-green-900/50">
          <span className="font-bold">Prós:</span> {notebook.pros.join(', ')}
        </div>
      </div>
    </div>
  );
};

export default NotebookCard;
