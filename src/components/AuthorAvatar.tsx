import React, { useState } from 'react';
import type { AuthorProfile } from '../types/content';

interface AuthorAvatarProps {
  author: AuthorProfile;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ringClassName?: string;
}

const SIZE_CLASSES: Record<NonNullable<AuthorAvatarProps['size']>, string> = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl',
};

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({
  author,
  size = 'md',
  ringClassName = 'ring-1 ring-slate-900/10 dark:ring-white/15',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const sizeClass = SIZE_CLASSES[size];

  // Respectful classical geometric medallion for Prophet Muhammad ﷺ (never an ordinary portrait)
  if (author.kind === 'religious_hadith') {
    return (
      <div
        role="img"
        aria-label="Calligraphic emblem for Prophet Muhammad peace be upon him"
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-amber-100 ${sizeClass} ${ringClassName}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
          aria-hidden="true"
        >
          <polygon
            points="50,6 62,24 84,24 74,44 94,50 74,56 84,76 62,76 50,94 38,76 16,76 26,56 6,50 26,44 16,24 38,24"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.6"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1"
          />
        </svg>
        <span
          className="font-arabic relative z-10 leading-none select-none"
          style={{
            fontSize:
              size === 'xl'
                ? '2.1rem'
                : size === 'lg'
                  ? '1.35rem'
                  : size === 'xs'
                    ? '0.85rem'
                    : '1.05rem',
          }}
        >
          ﷺ
        </span>
      </div>
    );
  }

  const showImage = Boolean(author.portraitSrc) && !imgFailed;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-slate-100 ${sizeClass} ${ringClassName}`}
      style={{
        backgroundColor: showImage ? undefined : author.accentHue,
      }}
    >
      {showImage ? (
        <img
          src={author.portraitSrc}
          alt={`Portrait of ${author.displayName}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full scale-[1.12] object-cover object-center"
        />
      ) : (
        <span
          aria-label={author.displayName}
          className="font-editorial font-semibold tracking-wider text-white/95 select-none"
        >
          {author.monogram}
        </span>
      )}
    </div>
  );
};
