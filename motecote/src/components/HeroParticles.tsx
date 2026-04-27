import { useCallback, useMemo, useState } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';

export default function HeroParticles() {
  const [init, setInit] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    setInit(true);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: false,
      particles: {
        number: { value: isMobile ? 0 : 55 },
        color: { value: '#ffffff' },
        opacity: { value: { min: 0.05, max: 0.25 } },
        size: { value: { min: 1, max: 3 } },
        move: { enable: true, speed: 0.4, direction: 'top' as const },
      },
      detectRetina: true,
    }),
    [isMobile],
  );

  if (isMobile) return null;

  return (
    <Particles
      id="hero-particles"
      className="pointer-events-none absolute inset-0 z-[1]"
      init={particlesInit}
      options={options}
      style={{ display: init ? undefined : 'none' }}
    />
  );
}
