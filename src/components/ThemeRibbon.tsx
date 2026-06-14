import { ThemeKey } from '../hooks/useSettings';

const GREETINGS: Partial<Record<ThemeKey, string>> = {
  'new-year':       '🎆 Happy New Year! Selamat Tahun Baru!',
  cny:              '🧧 Gong Xi Fa Cai · 新年快乐 · Happy Chinese New Year!',
  thaipusam:        '🪔 Happy Thaipusam! Selamat Hari Thaipusam!',
  valentines:       '💝 Happy Valentine\'s Day!',
  raya:             '🌙 Selamat Hari Raya Aidilfitri · Maaf Zahir dan Batin',
  wesak:            '☸️ Happy Wesak Day · Selamat Hari Wesak',
  'mothers-day':    '🌸 Happy Mother\'s Day · Selamat Hari Ibu',
  'dragon-boat':    '🐉 Happy Dragon Boat Festival · 端午快乐',
  'fathers-day':    '⭐ Happy Father\'s Day · Selamat Hari Bapa',
  'raya-haji':      '🌙 Selamat Hari Raya Aidiladha · Maaf Zahir dan Batin',
  merdeka:          '🇲🇾 Selamat Hari Merdeka · Malaysiaku Tercinta!',
  'malaysia-day':   '🇲🇾 Happy Malaysia Day · Selamat Hari Malaysia!',
  'maulidur-rasul': '☪️ Selamat Menyambut Maulidur Rasul',
  'mid-autumn':     '🏮 Happy Mid-Autumn Festival · 中秋节快乐',
  deepavali:        '🪔 Happy Deepavali · Selamat Hari Deepavali!',
  christmas:        '🎄 Merry Christmas · Selamat Hari Krismas!',
};

export default function ThemeRibbon({ theme }: { theme: ThemeKey }) {
  const greeting = GREETINGS[theme];
  if (!greeting) return null;

  return (
    <div
      className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium tracking-wide"
      style={{ backgroundColor: 'var(--color-accent-caramel)', color: 'var(--color-primary-cream)' }}
    >
      <span className="text-center leading-relaxed">{greeting}</span>
    </div>
  );
}
