import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PricePoint } from '../types';

interface ChartsProps {
  data: PricePoint[];
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-64 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
      <h3 className="text-slate-300 text-sm font-semibold mb-4">Comparativo de Preços Estimados</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" tickFormatter={(v) => `R$${v}`} />
          <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 10}} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#60a5fa' }}
            formatter={(value) => [`R$ ${value}`, 'Preço']}
          />
          <Bar dataKey="price" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#06b6d4'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
