import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: React.ReactNode;
}

export function Card({ children, className = '', title, icon }: CardProps) {
    return (
        <div className={`bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl overflow-hidden ${className}`}>
            {(title || icon) && (
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-3 bg-slate-800/40">
                    {icon && <span className="text-blue-400">{icon}</span>}
                    {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
