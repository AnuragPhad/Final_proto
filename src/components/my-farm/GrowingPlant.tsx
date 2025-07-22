
'use client';

interface GrowingPlantProps {
  progress: number; // 0-100
}

export default function GrowingPlant({ progress }: GrowingPlantProps) {
  const stage = progress / 100; // 0 to 1

  // Stem grows from progress 5% to 70%
  const stemHeight = Math.max(0, Math.min(1, (stage - 0.05) / 0.65)) * 60;

  // Leaves appear at different stages
  const leaf1Opacity = Math.max(0, Math.min(1, (stage - 0.2) / 0.2)); // Appears between 20-40%
  const leaf2Opacity = Math.max(0, Math.min(1, (stage - 0.4) / 0.2)); // Appears between 40-60%
  const leaf3Opacity = Math.max(0, Math.min(1, (stage - 0.6) / 0.2)); // Appears between 60-80%
  const leaf4Opacity = Math.max(0, Math.min(1, (stage - 0.7) / 0.2)); // Appears between 70-90%
  
  const hasLeaves = leaf1Opacity > 0;

  return (
    <div className="flex flex-col items-center justify-end h-32 w-full">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-auto"
        preserveAspectRatio="xMidYMax"
      >
        <g 
          style={{
            animation: hasLeaves ? 'sparkle 4s infinite ease-in-out' : 'none',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Plant components with transition styles */}
          <g 
            style={{ 
              transition: 'opacity 0.5s ease',
              animation: hasLeaves ? 'sway 6s infinite ease-in-out' : 'none',
              animationDelay: '-1s',
              transformOrigin: 'bottom center'
            }}
          >
            {/* Leaf 3 */}
            <path d="M 50 40 Q 30 30 35 15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" style={{ opacity: leaf3Opacity }} />
            {/* Leaf 4 */}
            <path d="M 50 40 Q 70 30 65 15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" style={{ opacity: leaf4Opacity }} />
            {/* Leaf 1 */}
            <path d="M 50 60 Q 35 55 30 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" style={{ opacity: leaf1Opacity }} />
            {/* Leaf 2 */}
            <path d="M 50 60 Q 65 55 70 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" style={{ opacity: leaf2Opacity }} />
          </g>
          
          {/* Stem */}
          <line
            x1="50"
            y1="85"
            x2="50"
            y2={85 - stemHeight}
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ transition: 'all 0.5s ease-out' }}
          />
        </g>

        {/* Ground */}
        <line x1="20" y1="85" x2="80" y2="85" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
