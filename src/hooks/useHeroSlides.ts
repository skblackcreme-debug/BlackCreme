import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface HeroSlide {
  id: string;
  image_url: string;
}

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    supabase
      .from('hero_slides')
      .select('id, image_url')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        setSlides((data ?? []).filter((s: HeroSlide) => s.image_url));
      });
  }, []);

  const goTo = (newIndex: number) => {
    setVisible(false);
    setTimeout(() => {
      setIndex(newIndex);
      setVisible(true);
    }, 350);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setTimeout(() => goTo((index + 1) % slides.length), 4000);
    return () => clearTimeout(t);
  }, [slides, index, visible]);

  const currentSrc = slides.length > 0 ? slides[index].image_url : '/hero-product.png';
  return { slides, index, visible, goTo, currentSrc };
}
