import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

// Shared full-viewport backdrop: static cyber grid + drifting particle network.
// Mounted once in the app shell, sits behind all content, ignores pointer events.
// ponytail: particle count capped by viewport area (see COUNT); it's a decorative
// field, not a simulation — if it ever costs frames, lower CAP or DISTANCE.
const CAP = 90;
const DISTANCE = 130; // px: max length of a connecting line
const MOUSE_DISTANCE = 170;

type Particle = { x: number; y: number; vx: number; vy: number };

export default function CyberBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const prefersReduced = useReducedMotion();

    useEffect(() => {
        if (prefersReduced) return; // static grid only — no canvas animation
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let particles: Particle[] = [];
        let raf = 0;
        const mouse = { x: -9999, y: -9999 };
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const seed = () => {
            const count = Math.min(CAP, Math.floor((width * height) / 18000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
            }));
        };

        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            }
            // links between nearby particles
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < DISTANCE) {
                        ctx.strokeStyle = `rgba(34, 211, 238, ${0.14 * (1 - d / DISTANCE)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
                // link to cursor
                const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
                if (dm < MOUSE_DISTANCE) {
                    ctx.strokeStyle = `rgba(52, 211, 153, ${0.28 * (1 - dm / MOUSE_DISTANCE)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
                // node
                ctx.fillStyle = 'rgba(103, 232, 249, 0.55)';
                ctx.beginPath();
                ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        };

        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        const onLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };
        const onVisibility = () => {
            cancelAnimationFrame(raf);
            if (!document.hidden) raf = requestAnimationFrame(draw);
        };

        resize();
        raf = requestAnimationFrame(draw);
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseout', onLeave);
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseout', onLeave);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [prefersReduced]);

    return (
        <div
            aria-hidden='true'
            className='pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background'
        >
            {/* grid mesh, faded toward edges */}
            <div
                className='absolute inset-0 opacity-[0.35]'
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.06) 1px, transparent 1px)',
                    backgroundSize: '44px 44px',
                    maskImage:
                        'radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)',
                }}
            />
            {/* neon glows */}
            <div className='absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-neon/10 blur-[120px]' />
            <div className='absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-glow/10 blur-[120px]' />
            {/* particle network (skipped entirely under reduced-motion) */}
            {!prefersReduced && <canvas ref={canvasRef} className='absolute inset-0 h-full w-full' />}
        </div>
    );
}
