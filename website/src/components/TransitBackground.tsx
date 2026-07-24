import { useReducedMotion } from 'motion/react';

// Ambient wayfinding backdrop: deep transit ink, a faint route-map grid, soft
// signal glows, and (motion permitting) a slow light sweep like a passing train.
// Calm on purpose — the split-flap board is where the motion budget is spent.
export default function TransitBackground() {
    const prefersReduced = useReducedMotion();
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
        >
            {/* route-map grid */}
            <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(46,224,138,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(46,224,138,0.05) 1px, transparent 1px)',
                    backgroundSize: '46px 46px',
                    maskImage: 'radial-gradient(ellipse at 50% -10%, black 30%, transparent 78%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse at 50% -10%, black 30%, transparent 78%)',
                }}
            />
            {/* signal glows */}
            <div className="absolute -top-48 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-neon/[0.08] blur-[130px]" />
            <div className="absolute bottom-[-10rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-glow/[0.06] blur-[130px]" />
            {/* passing-train light sweep */}
            {!prefersReduced && (
                <div
                    className="absolute inset-x-0 top-0 h-px opacity-70"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(46,224,138,0.55), transparent)',
                        animation: 'railsweep 9s linear infinite',
                    }}
                />
            )}
            <style>{`
                @keyframes railsweep {
                    0%   { transform: translateY(0) scaleX(0.6); opacity: 0; }
                    8%   { opacity: 0.8; }
                    50%  { transform: translateY(48vh) scaleX(1); opacity: 0.5; }
                    92%  { opacity: 0.6; }
                    100% { transform: translateY(96vh) scaleX(0.6); opacity: 0; }
                }
                @media (prefers-reduced-motion: reduce) {
                    [style*="railsweep"] { animation: none !important; }
                }
            `}</style>
        </div>
    );
}
