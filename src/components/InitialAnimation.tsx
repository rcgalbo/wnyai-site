import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface Props {
  onComplete: () => void;
}

const InitialAnimation = ({ onComplete }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      complete: onComplete
    });

    timeline
      .add({
        targets: '.logo-line',
        scaleX: [0, 1],
        opacity: [0.5, 1],
        duration: 900,
        delay: anime.stagger(200)
      })
      .add({
        targets: '.logo-text',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800
      })
      .add({
        targets: '.initial-animation',
        translateX: '100%',
        duration: 1000,
        delay: 500
      });
  }, [onComplete]);

  return (
    <div ref={containerRef} className="initial-animation fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="relative">
        <div className="logo-line absolute w-40 h-1 bg-black" style={{ top: '-20px' }} />
        <div className="logo-line absolute w-40 h-1 bg-black" style={{ bottom: '-20px' }} />
        <h1 className="logo-text font-orbitron text-4xl font-bold opacity-0">WNY AI</h1>
      </div>
    </div>
  );
};

export default InitialAnimation;