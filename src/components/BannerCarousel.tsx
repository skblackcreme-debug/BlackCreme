import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Banner {
  id: string;
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
}

function extractVideoId(embedUrl: string): string | null {
  const match = embedUrl.match(/embed\/([^?&]+)/);
  return match ? match[1] : null;
}

interface Props {
  onLoad?: (hasContent: boolean) => void;
}

export default function BannerCarousel({ onLoad }: Props) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const playerRef = useRef<any>(null);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (document.getElementById('yt-api')) return;
    const tag = document.createElement('script');
    tag.id = 'yt-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {};
  }, []);

  // Fetch banners
  useEffect(() => {
    supabase
      .from('banners')
      .select('id, title, media_url, media_type')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        const filtered = (data ?? []).filter(b => b.media_url);
        setBanners(filtered);
        setLoading(false);
        onLoad?.(filtered.length > 0);
      });
  }, []);

  const current = banners[index];

  // Fade-transition helper — fade out → swap → fade in
  const goTo = (newIndex: number) => {
    setVisible(false);
    setTimeout(() => {
      playerRef.current?.destroy?.();
      playerRef.current = null;
      setIndex(newIndex);
      setVisible(true);
    }, 350);
  };

  const goNext = () => goTo((index + 1) % banners.length);
  const goPrev = () => goTo((index - 1 + banners.length) % banners.length);

  // Image: auto-advance every 5s
  useEffect(() => {
    if (!current || banners.length <= 1) return;
    if (current.media_type !== 'image') return;
    const t = setTimeout(goNext, 5000);
    return () => clearTimeout(t);
  }, [banners, index, visible]);

  // Video: YouTube uses YT.Player API; direct video files use <video> autoplay
  useEffect(() => {
    if (!current || current.media_type !== 'video' || !visible) return;

    const videoId = extractVideoId(current.media_url);

    if (videoId) {
      // YouTube
      const create = () => {
        const container = document.getElementById('yt-player');
        if (!window.YT?.Player || !container) { setTimeout(create, 300); return; }
        playerRef.current?.destroy?.();
        playerRef.current = new window.YT.Player('yt-player', {
          videoId,
          playerVars: { autoplay: 1, mute: 1, rel: 0, controls: 1, modestbranding: 1 },
          events: {
            onStateChange: (e: any) => {
              if (e.data === 0 && banners.length > 1) goNext();
            },
          },
        });
      };
      const t = setTimeout(create, 200);
      return () => clearTimeout(t);
    }
    // Non-YouTube (mp4, etc.) — <video> element handles playback via onEnded
  }, [current?.id, visible]);

  if (loading) {
    return (
      <div className="w-full h-[260px] md:h-[420px] bg-primary-dark/10 animate-pulse rounded-2xl flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary-dark/10" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[260px] md:h-[420px] overflow-hidden bg-primary-dark rounded-2xl shadow-xl">
      {/* Slide content — fade via opacity transition */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {current.media_type === 'image' ? (
          <>
            <img
              src={current.media_url}
              alt={current.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            {current.title && (
              <div className="absolute bottom-10 left-0 right-0 text-center px-6 pointer-events-none">
                <p className="text-white font-serif text-2xl md:text-4xl drop-shadow-lg tracking-wide">
                  {current.title}
                </p>
              </div>
            )}
          </>
        ) : extractVideoId(current.media_url) ? (
          // YouTube — YT API replaces this div with an iframe
          <div id="yt-player" className="w-full h-full" />
        ) : (
          // Direct video file (mp4, webm, etc.)
          <video
            key={current.id}
            src={current.media_url}
            autoPlay
            muted
            playsInline
            controls
            className="w-full h-full object-cover"
            onEnded={() => { if (banners.length > 1) goNext(); }}
          />
        )}
      </div>

      {/* Prev / Next */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all border border-white/10 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all border border-white/10 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
