import React from 'react';

interface Props {
  title:        string;
  description?: string;
  badge?:       string;
  badgeColor?:  string;
}

export function DataHeader({
  title,
  description,
  badge,
  badgeColor = '#FABF2C',
}: Props) {
  return (
    <div className="border-b border-[#1a1a1a] pb-6 mb-8">
      {badge && (
        <p
          className="text-[10px] font-black uppercase tracking-[0.4em] mb-2"
          style={{ color: badgeColor }}
        >
          {badge}
        </p>
      )}
      <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mt-2 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default DataHeader;
