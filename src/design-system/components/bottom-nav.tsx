import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export interface BottomNavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

export interface BottomNavProps {
    items: BottomNavItem[];
    className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, className = '' }) => {
    const location = useLocation();

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 h-[72px] bg-[var(--color-surface)] border-t border-[var(--color-border)] px-2 pb-safe-area pt-2 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] sm:hidden ${className}`}
        >
            <div className="flex justify-between items-center max-w-md mx-auto">
                {items.map((item) => {
                    // Simple active path matching
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2 px-1 relative transition-colors"
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <div
                                className={`flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'text-[var(--color-primary-500)] bg-[var(--color-primary-50)] scale-110' : 'text-[var(--color-muted-text)] hover:text-[var(--color-text)]'
                                    }`}
                            >
                                {item.icon}
                            </div>
                            <span
                                className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-muted-text)]'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
