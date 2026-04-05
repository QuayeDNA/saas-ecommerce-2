// src/design-system/components/section.tsx
import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  background?: 'white' | 'gray' | 'blue' | 'gradient' | 'dark' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({
    children,
    background = 'white',
    padding = 'lg',
    className = '',
    ...props
  }, ref) => {
    const backgroundClasses = {
      white: 'bg-[var(--color-surface)]',
      gray: 'bg-[var(--color-primary-50)]',
      blue: 'bg-[var(--color-primary-50)]',
      gradient: 'bg-[linear-gradient(135deg,var(--color-primary-50),var(--color-surface),var(--color-primary-100))]',
      dark: 'bg-[var(--color-secondary-500)] text-white',
      none: 'bg-transparent',
    };

    const paddingClasses = {
      none: '',
      sm: 'py-4 sm:py-6 md:py-8',
      md: 'py-6 sm:py-8 md:py-10 lg:py-12',
      lg: 'py-8 sm:py-10 md:py-14 lg:py-16',
      xl: 'py-12 sm:py-16 md:py-20 lg:py-24',
    };

    return (
      <section
        ref={ref}
        className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

// Section Header component for consistent section titles
interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, centered = true, className = '', ...props }, ref) => {
    const alignmentClasses = centered ? 'text-center' : 'text-left';
    const subtitleWidthClass = centered ? 'mx-auto max-w-3xl' : 'max-w-3xl';

    return (
      <div
        ref={ref}
        className={`mb-6 sm:mb-8 md:mb-10 ${alignmentClasses} ${className}`}
        {...props}
      >
        <h2 className="mb-2 sm:mb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-secondary-500)]">
          {title}
        </h2>
        {subtitle && (
          <p className={`text-sm sm:text-base md:text-lg text-[var(--color-secondary-500)] opacity-80 ${subtitleWidthClass}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';
