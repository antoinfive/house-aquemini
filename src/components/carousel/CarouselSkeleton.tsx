/**
 * Lightweight carousel skeleton for use during dynamic import loading.
 * Does not depend on Framer Motion.
 */
export function CarouselSkeleton() {
  return (
    <div className="relative h-[350px] w-full flex items-center justify-center">
      {[-2, -1, 0, 1, 2].map((offset) => {
        const absOffset = Math.abs(offset);
        const scale = offset === 0 ? 1.15 : absOffset === 1 ? 0.85 : 0.7;
        const opacity = offset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.5;
        const itemSize = 280;
        const spacing = 300;

        return (
          <div
            key={offset}
            className="absolute rounded-lg bg-steel-800 animate-pulse"
            style={{
              width: itemSize,
              height: itemSize,
              left: '50%',
              marginLeft: -itemSize / 2,
              transform: `translateX(${offset * spacing}px) scale(${scale})`,
              opacity,
              zIndex: offset === 0 ? 50 : absOffset === 1 ? 30 : 10,
            }}
          />
        );
      })}
    </div>
  );
}
