import React from 'react';

interface BrandLogoPlaceholderProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'auto' | 'light';
}

/**
 * Structured architectural brand-logo slot ready for the approved SILENT THOUGHTS
 * logo asset to be dropped in later. Intentionally avoids generic quotation-mark icons.
 */
export const BrandLogoPlaceholder: React.FC<BrandLogoPlaceholderProps> = ({
  size = 'md',
  tone = 'auto',
}) => {
  const dimensions =
    size === 'sm'
      ? 'h-9 w-9 rounded-xl'
      : size === 'lg'
        ? 'h-14 w-14 rounded-2xl'
        : 'h-11 w-11 rounded-xl';

  const textSize =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';

  const frameClasses =
    tone === 'light'
      ? 'border-white/30 bg-white/10 text-white'
      : 'border-slate-300/90 bg-slate-900 text-white dark:border-slate-700 dark:bg-slate-800';

  return (
    <div
      data-logo-slot="silent-thoughts-brand-mark"
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center border ${dimensions} ${frameClasses} shadow-xs`}
    >
      <div className="pointer-events-none absolute inset-1 rounded-[inherit] border border-white/15" />
      <span
        className={`font-editorial font-semibold tracking-[0.14em] ${textSize}`}
      >
        ST
      </span>
    </div>
  );
};
