import { ThemeKey } from '../hooks/useSettings';

// ── Reusable SVG shapes ────────────────────────────────────────────────────

const A = 'var(--color-accent-caramel)';   // accent (changes per theme)
const D = 'var(--color-primary-dark)';     // dark   (changes per theme)

const Snowflake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="1.5" strokeLinecap="round" width="100%" height="100%">
    <line x1="12" y1="2"   x2="12" y2="22" />
    <line x1="2"  y1="12"  x2="22" y2="12" />
    <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
    <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
    <line x1="12" y1="6"  x2="9.5"  y2="3.5" /><line x1="12" y1="6"  x2="14.5" y2="3.5" />
    <line x1="12" y1="18" x2="9.5"  y2="20.5" /><line x1="12" y1="18" x2="14.5" y2="20.5" />
    <line x1="6"  y1="12" x2="3.5"  y2="9.5"  /><line x1="6"  y1="12" x2="3.5"  y2="14.5" />
    <line x1="18" y1="12" x2="20.5" y2="9.5"  /><line x1="18" y1="12" x2="20.5" y2="14.5" />
  </svg>
);

const Star5 = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const Star8 = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <polygon points="12,2 13.8,8.2 20,6 15.8,10.2 22,12 15.8,13.8 20,18 13.8,15.8 12,22 10.2,15.8 4,18 8.2,13.8 2,12 8.2,10.2 4,6 10.2,8.2" />
  </svg>
);

const Heart = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const Lantern = () => (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <line x1="9" y1="2" x2="15" y2="2" stroke={A} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="2" x2="12" y2="4.5" stroke={A} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7.5 5 Q7 4 12 4 Q17 4 16.5 5 L17 18 Q17 21 12 21 Q7 21 7 18 Z" fill={A} opacity="0.85" />
    <path d="M9 10.5 Q12 8.5 15 10.5 Q12 12.5 9 10.5Z" fill="white" opacity="0.25" />
    <line x1="10" y1="7"  x2="14" y2="7"  stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
    <line x1="10" y1="17" x2="14" y2="17" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
    <line x1="12" y1="21" x2="12" y2="23.5" stroke={A} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Lotus = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <path d="M12 20 Q8.5 15 10.5 10 Q12 13.5 12 20Z" opacity="0.9" />
    <path d="M12 20 Q15.5 15 13.5 10 Q12 13.5 12 20Z" opacity="0.9" />
    <path d="M12 20 Q5 16.5 6.5 11.5 Q9.5 14.5 12 20Z" opacity="0.65" />
    <path d="M12 20 Q19 16.5 17.5 11.5 Q14.5 14.5 12 20Z" opacity="0.65" />
    <path d="M12 20 Q3 17 5 13 Q8 16 12 20Z" opacity="0.4" />
    <path d="M12 20 Q21 17 19 13 Q16 16 12 20Z" opacity="0.4" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const Crescent = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <circle cx="12" cy="12" r="10" fill={A} opacity="0.9" />
    <circle cx="15" cy="9" r="3.5" fill={D} opacity="0.15" />
    <circle cx="9" cy="15" r="2" fill={D} opacity="0.1" />
  </svg>
);

const Sparkle = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <path d="M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z" />
    <path d="M5 5 L5.7 8 L8.7 8.7 L5.7 9.4 L5 12.4 L4.3 9.4 L1.3 8.7 L4.3 8 Z" opacity="0.55" />
    <path d="M19 16 L19.5 18.5 L22 19 L19.5 19.5 L19 22 L18.5 19.5 L16 19 L18.5 18.5 Z" opacity="0.45" />
  </svg>
);

const PlumBlossom = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <circle cx="12" cy="7.5" r="3" />
    <circle cx="17" cy="10.8" r="3" />
    <circle cx="15.1" cy="16.5" r="3" />
    <circle cx="8.9" cy="16.5" r="3" />
    <circle cx="7" cy="10.8" r="3" />
    <circle cx="12" cy="12" r="2.2" fill={D} opacity="0.25" />
  </svg>
);

const Diya = () => (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <path d="M4 16 Q4 14 12 14 Q20 14 20 16 L19 19.5 Q12 21.5 5 19.5 Z" fill={D} opacity="0.75" />
    <ellipse cx="12" cy="14.5" rx="5.5" ry="1.5" fill={D} opacity="0.4" />
    <path d="M12 14 Q11 9.5 12 7 Q13.5 9.5 12 14Z" fill={A} opacity="0.95" />
    <path d="M12 13 Q11.6 10.5 12 9 Q12.4 10.5 12 13Z" fill="white" opacity="0.5" />
  </svg>
);

const Flower = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <ellipse cx="12" cy="7" rx="2.5" ry="4.5" />
    <ellipse cx="12" cy="7" rx="2.5" ry="4.5" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="7" rx="2.5" ry="4.5" transform="rotate(120 12 12)" />
    <ellipse cx="12" cy="7" rx="2.5" ry="4.5" transform="rotate(180 12 12)" />
    <ellipse cx="12" cy="7" rx="2.5" ry="4.5" transform="rotate(240 12 12)" />
    <ellipse cx="12" cy="7" rx="2.5" ry="4.5" transform="rotate(300 12 12)" />
    <circle cx="12" cy="12" r="3" fill="white" opacity="0.5" />
  </svg>
);

const Diamond = () => (
  <svg viewBox="0 0 24 24" fill={A} width="100%" height="100%">
    <polygon points="12,2 22,12 12,22 2,12" opacity="0.8" />
    <polygon points="12,6 18,12 12,18 6,12" fill={D} opacity="0.15" />
  </svg>
);

const Wave = () => (
  <svg viewBox="0 0 60 24" fill="none" stroke={A} strokeWidth="2.5" strokeLinecap="round" width="100%" height="100%">
    <path d="M0 12 Q7.5 2 15 12 Q22.5 22 30 12 Q37.5 2 45 12 Q52.5 22 60 12" />
    <path d="M0 17 Q7.5 7 15 17 Q22.5 27 30 17 Q37.5 7 45 17 Q52.5 27 60 17" opacity="0.45" />
  </svg>
);

// ── Decoration item helper ──────────────────────────────────────────────────

const OPACITY_SCALE = 1.5;

interface D {
  el: JSX.Element;
  size: number;
  top?: string; bottom?: string; left?: string; right?: string;
  opacity: number;
  anim: string;
  delay?: string;
  desktop?: boolean; // hide on mobile when true
}

function pos(d: D) {
  return {
    position: 'absolute' as const,
    width: d.size,
    height: d.el.type === Wave ? d.size * 0.4 : d.size,
    top: d.top,
    bottom: d.bottom,
    left: d.left,
    right: d.right,
    opacity: Math.min(d.opacity * OPACITY_SCALE, 0.55),
    animation: d.anim,
    animationDelay: d.delay ?? '0s',
    pointerEvents: 'none' as const,
    zIndex: 1,
  };
}

// ── Theme decoration map ────────────────────────────────────────────────────

const DECOS: Partial<Record<ThemeKey, D[]>> = {

  christmas: [
    { el: <Snowflake />, size: 48, top: '8%',   left: '3%',  opacity: 0.22, anim: 'deco-spin 14s linear infinite' },
    { el: <Snowflake />, size: 28, top: '52%',  left: '6%',  opacity: 0.16, anim: 'deco-spin 20s linear infinite', delay: '2s' },
    { el: <Snowflake />, size: 20, top: '24%',  left: '30%', opacity: 0.13, anim: 'deco-spin 24s linear infinite', delay: '1s', desktop: true },
    { el: <Star5 />,     size: 38, bottom: '14%', left: '4%', opacity: 0.24, anim: 'deco-float 5s ease-in-out infinite' },
    { el: <Star5 />,     size: 16, top: '12%',  left: '40%', opacity: 0.18, anim: 'deco-twinkle 3s ease-in-out infinite', delay: '1.5s', desktop: true },
  ],

  'new-year': [
    { el: <Sparkle />,   size: 52, top: '6%',   left: '2%',  opacity: 0.28, anim: 'deco-pulse 3s ease-in-out infinite' },
    { el: <Sparkle />,   size: 32, bottom: '18%', left: '5%', opacity: 0.2,  anim: 'deco-pulse 4s ease-in-out infinite', delay: '1s' },
    { el: <Star5 />,     size: 22, top: '40%',  left: '4%',  opacity: 0.18, anim: 'deco-twinkle 2.5s ease-in-out infinite', delay: '0.5s' },
    { el: <Star5 />,     size: 14, top: '20%',  left: '35%', opacity: 0.15, anim: 'deco-twinkle 3.5s ease-in-out infinite', delay: '1.8s', desktop: true },
    { el: <Sparkle />,   size: 18, bottom: '30%', left: '28%', opacity: 0.14, anim: 'deco-drift 6s ease-in-out infinite', desktop: true },
  ],

  cny: [
    { el: <Lantern />,     size: 52, top: '8%',   left: '3%',  opacity: 0.3,  anim: 'deco-sway 4s ease-in-out infinite' },
    { el: <Lantern />,     size: 38, bottom: '12%', left: '7%', opacity: 0.24, anim: 'deco-sway 5s ease-in-out infinite', delay: '1.2s' },
    { el: <PlumBlossom />, size: 42, top: '45%',  left: '4%',  opacity: 0.2,  anim: 'deco-float 6s ease-in-out infinite', delay: '0.8s' },
    { el: <PlumBlossom />, size: 26, top: '18%',  left: '32%', opacity: 0.15, anim: 'deco-drift 7s ease-in-out infinite', desktop: true },
    { el: <Star5 />,       size: 18, bottom: '28%', left: '26%', opacity: 0.16, anim: 'deco-twinkle 3s ease-in-out infinite', delay: '2s', desktop: true },
  ],

  thaipusam: [
    { el: <Lotus />, size: 50, top: '10%',   left: '3%',  opacity: 0.24, anim: 'deco-float 5s ease-in-out infinite' },
    { el: <Lotus />, size: 34, bottom: '15%', left: '5%', opacity: 0.18, anim: 'deco-float 6.5s ease-in-out infinite', delay: '1.5s' },
    { el: <Diya />,  size: 44, top: '48%',   left: '4%',  opacity: 0.22, anim: 'deco-pulse 3.5s ease-in-out infinite', delay: '0.5s' },
    { el: <Lotus />, size: 22, top: '22%',   left: '34%', opacity: 0.14, anim: 'deco-drift 7s ease-in-out infinite', desktop: true },
    { el: <Star8 />, size: 16, bottom: '26%', left: '30%', opacity: 0.13, anim: 'deco-spin 18s linear infinite', desktop: true },
  ],

  valentines: [
    { el: <Heart />, size: 46, top: '8%',    left: '3%',  opacity: 0.28, anim: 'deco-float 4s ease-in-out infinite' },
    { el: <Heart />, size: 28, bottom: '14%', left: '6%', opacity: 0.22, anim: 'deco-float 5.5s ease-in-out infinite', delay: '1s' },
    { el: <Heart />, size: 20, top: '46%',   left: '4%',  opacity: 0.18, anim: 'deco-drift 6s ease-in-out infinite', delay: '0.8s' },
    { el: <Heart />, size: 16, top: '20%',   left: '32%', opacity: 0.14, anim: 'deco-pulse 3s ease-in-out infinite', delay: '1.5s', desktop: true },
    { el: <Heart />, size: 12, bottom: '30%', left: '26%', opacity: 0.12, anim: 'deco-twinkle 4s ease-in-out infinite', delay: '2.2s', desktop: true },
  ],

  raya: [
    { el: <Crescent />, size: 50, top: '6%',   left: '2%',  opacity: 0.26, anim: 'deco-float 5s ease-in-out infinite' },
    { el: <Star5 />,    size: 20, top: '10%',  left: '14%', opacity: 0.22, anim: 'deco-twinkle 3s ease-in-out infinite', delay: '0.5s' },
    { el: <Diamond />,  size: 36, bottom: '16%', left: '4%', opacity: 0.2,  anim: 'deco-float 6s ease-in-out infinite', delay: '1s' },
    { el: <Diamond />,  size: 22, top: '44%',  left: '5%',  opacity: 0.15, anim: 'deco-pulse 4s ease-in-out infinite', delay: '1.8s' },
    { el: <Star5 />,    size: 16, top: '22%',  left: '36%', opacity: 0.14, anim: 'deco-twinkle 4s ease-in-out infinite', delay: '2s', desktop: true },
  ],

  'raya-haji': [
    { el: <Crescent />, size: 50, top: '7%',   left: '2%',  opacity: 0.26, anim: 'deco-float 5.5s ease-in-out infinite' },
    { el: <Star5 />,    size: 22, top: '11%',  left: '15%', opacity: 0.22, anim: 'deco-twinkle 3s ease-in-out infinite', delay: '0.4s' },
    { el: <Diamond />,  size: 38, bottom: '14%', left: '4%', opacity: 0.2,  anim: 'deco-float 6.5s ease-in-out infinite', delay: '1.2s' },
    { el: <Star8 />,    size: 28, top: '45%',  left: '5%',  opacity: 0.16, anim: 'deco-spin 22s linear infinite' },
    { el: <Star5 />,    size: 14, top: '24%',  left: '34%', opacity: 0.13, anim: 'deco-twinkle 4.5s ease-in-out infinite', delay: '2s', desktop: true },
  ],

  'maulidur-rasul': [
    { el: <Star8 />,    size: 52, top: '7%',   left: '2%',  opacity: 0.24, anim: 'deco-spin 20s linear infinite' },
    { el: <Crescent />, size: 36, bottom: '15%', left: '5%', opacity: 0.22, anim: 'deco-float 5s ease-in-out infinite', delay: '1s' },
    { el: <Star8 />,    size: 28, top: '48%',  left: '4%',  opacity: 0.16, anim: 'deco-spin 28s linear infinite', delay: '0.5s' },
    { el: <Star5 />,    size: 16, top: '24%',  left: '36%', opacity: 0.13, anim: 'deco-twinkle 3.5s ease-in-out infinite', delay: '1.5s', desktop: true },
    { el: <Star8 />,    size: 14, bottom: '28%', left: '30%', opacity: 0.12, anim: 'deco-pulse 4s ease-in-out infinite', delay: '2s', desktop: true },
  ],

  deepavali: [
    { el: <Diya />,    size: 48, top: '8%',    left: '3%',  opacity: 0.3,  anim: 'deco-pulse 3s ease-in-out infinite' },
    { el: <Diya />,    size: 34, bottom: '14%', left: '6%', opacity: 0.24, anim: 'deco-pulse 4s ease-in-out infinite', delay: '1s' },
    { el: <Sparkle />, size: 36, top: '46%',   left: '4%',  opacity: 0.2,  anim: 'deco-twinkle 2.5s ease-in-out infinite', delay: '0.5s' },
    { el: <Lotus />,   size: 30, top: '20%',   left: '33%', opacity: 0.15, anim: 'deco-float 6s ease-in-out infinite', desktop: true },
    { el: <Sparkle />, size: 18, bottom: '28%', left: '28%', opacity: 0.14, anim: 'deco-drift 7s ease-in-out infinite', delay: '1.5s', desktop: true },
  ],

  'mid-autumn': [
    { el: <Moon />,    size: 56, top: '5%',    left: '2%',  opacity: 0.2,  anim: 'deco-float 7s ease-in-out infinite' },
    { el: <Lantern />, size: 44, bottom: '10%', left: '4%', opacity: 0.26, anim: 'deco-sway 5s ease-in-out infinite', delay: '1s' },
    { el: <Lantern />, size: 30, top: '44%',   left: '6%',  opacity: 0.2,  anim: 'deco-sway 6s ease-in-out infinite', delay: '2s' },
    { el: <Star5 />,   size: 18, top: '18%',   left: '35%', opacity: 0.15, anim: 'deco-twinkle 4s ease-in-out infinite', delay: '1.5s', desktop: true },
    { el: <Star5 />,   size: 12, bottom: '30%', left: '28%', opacity: 0.13, anim: 'deco-twinkle 3s ease-in-out infinite', delay: '3s', desktop: true },
  ],

  wesak: [
    { el: <Lotus />,  size: 52, top: '7%',    left: '2%',  opacity: 0.24, anim: 'deco-float 6s ease-in-out infinite' },
    { el: <Lotus />,  size: 36, bottom: '14%', left: '5%', opacity: 0.18, anim: 'deco-float 7.5s ease-in-out infinite', delay: '1.2s' },
    { el: <Sparkle />, size: 30, top: '46%',  left: '4%',  opacity: 0.2,  anim: 'deco-pulse 3.5s ease-in-out infinite', delay: '0.6s' },
    { el: <Lotus />,  size: 22, top: '22%',   left: '34%', opacity: 0.14, anim: 'deco-drift 8s ease-in-out infinite', desktop: true },
    { el: <Star5 />,  size: 14, bottom: '26%', left: '28%', opacity: 0.12, anim: 'deco-twinkle 4s ease-in-out infinite', delay: '2s', desktop: true },
  ],

  'mothers-day': [
    { el: <Flower />, size: 50, top: '7%',    left: '3%',  opacity: 0.26, anim: 'deco-float 5s ease-in-out infinite' },
    { el: <Flower />, size: 32, bottom: '14%', left: '6%', opacity: 0.2,  anim: 'deco-drift 7s ease-in-out infinite', delay: '1s' },
    { el: <Heart />,  size: 28, top: '46%',   left: '4%',  opacity: 0.22, anim: 'deco-pulse 4s ease-in-out infinite', delay: '0.5s' },
    { el: <Flower />, size: 20, top: '20%',   left: '34%', opacity: 0.14, anim: 'deco-float 6.5s ease-in-out infinite', delay: '1.5s', desktop: true },
    { el: <Heart />,  size: 14, bottom: '28%', left: '28%', opacity: 0.12, anim: 'deco-twinkle 3.5s ease-in-out infinite', delay: '2.2s', desktop: true },
  ],

  'dragon-boat': [
    { el: <Wave />,   size: 80, bottom: '16%', left: '0%',  opacity: 0.2,  anim: 'deco-drift 8s ease-in-out infinite' },
    { el: <Diamond />, size: 40, top: '10%',   left: '3%',  opacity: 0.22, anim: 'deco-float 5s ease-in-out infinite' },
    { el: <Diamond />, size: 26, top: '48%',   left: '5%',  opacity: 0.18, anim: 'deco-float 6.5s ease-in-out infinite', delay: '1.2s' },
    { el: <Star5 />,  size: 18, top: '22%',    left: '34%', opacity: 0.14, anim: 'deco-twinkle 3.5s ease-in-out infinite', delay: '1s', desktop: true },
    { el: <Wave />,   size: 60, top: '12%',    left: '2%',  opacity: 0.12, anim: 'deco-drift 10s ease-in-out infinite', delay: '2s', desktop: true },
  ],

  'fathers-day': [
    { el: <Star5 />,   size: 46, top: '8%',    left: '3%',  opacity: 0.22, anim: 'deco-float 6s ease-in-out infinite' },
    { el: <Star8 />,   size: 32, bottom: '16%', left: '5%', opacity: 0.18, anim: 'deco-spin 24s linear infinite' },
    { el: <Sparkle />, size: 30, top: '46%',   left: '4%',  opacity: 0.16, anim: 'deco-pulse 4s ease-in-out infinite', delay: '1s' },
    { el: <Star5 />,   size: 18, top: '22%',   left: '34%', opacity: 0.13, anim: 'deco-twinkle 3.5s ease-in-out infinite', delay: '1.5s', desktop: true },
    { el: <Star8 />,   size: 14, bottom: '28%', left: '28%', opacity: 0.12, anim: 'deco-spin 30s linear infinite', desktop: true },
  ],

  merdeka: [
    { el: <Star8 />,   size: 50, top: '7%',    left: '2%',  opacity: 0.24, anim: 'deco-pulse 4s ease-in-out infinite' },
    { el: <Crescent />, size: 34, bottom: '14%', left: '5%', opacity: 0.2,  anim: 'deco-float 6s ease-in-out infinite', delay: '1s' },
    { el: <Star5 />,   size: 22, top: '46%',   left: '4%',  opacity: 0.18, anim: 'deco-twinkle 3s ease-in-out infinite', delay: '0.5s' },
    { el: <Star5 />,   size: 16, top: '18%',   left: '35%', opacity: 0.15, anim: 'deco-twinkle 4s ease-in-out infinite', delay: '2s', desktop: true },
    { el: <Sparkle />, size: 20, bottom: '26%', left: '28%', opacity: 0.14, anim: 'deco-pulse 3.5s ease-in-out infinite', delay: '1.5s', desktop: true },
  ],

  'malaysia-day': [
    { el: <Star8 />,   size: 50, top: '7%',    left: '2%',  opacity: 0.24, anim: 'deco-pulse 4s ease-in-out infinite' },
    { el: <Crescent />, size: 34, bottom: '14%', left: '5%', opacity: 0.2,  anim: 'deco-float 6.5s ease-in-out infinite', delay: '1s' },
    { el: <Star5 />,   size: 22, top: '47%',   left: '4%',  opacity: 0.18, anim: 'deco-twinkle 3.5s ease-in-out infinite', delay: '0.6s' },
    { el: <Star5 />,   size: 16, top: '18%',   left: '36%', opacity: 0.15, anim: 'deco-twinkle 4.5s ease-in-out infinite', delay: '2.2s', desktop: true },
    { el: <Sparkle />, size: 20, bottom: '27%', left: '29%', opacity: 0.14, anim: 'deco-drift 6s ease-in-out infinite', delay: '1.5s', desktop: true },
  ],
};

// ── Main component ──────────────────────────────────────────────────────────

export default function ThemeDecorations({ theme }: { theme: ThemeKey }) {
  const items = DECOS[theme];
  if (!items) return null;

  return (
    <>
      {items.map((d, i) => (
        <div
          key={i}
          className={d.desktop ? 'hidden md:block' : undefined}
          style={pos(d)}
        >
          {d.el}
        </div>
      ))}
    </>
  );
}
