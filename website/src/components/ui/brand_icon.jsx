import { useEffect, useState } from 'react';
import { Icon, iconLoaded, loadIcon } from '@iconify-icon/react';
import { cn } from '@/lib/utils';

// ══ Brand icons ══════════════════════════════════════════════════════════════
// Iconify stays the primary source: `logo` in the JSON is an Iconify name and is
// rendered as-is. What Iconify can't promise is coverage. Simple Icons drops
// marks when a vendor's trademark policy says to — CrowdStrike and Zscaler both
// went that way — and smaller vendors (Kandji) were never in any of the 200+
// sets to begin with.
//
// The previous workaround was to borrow an unrelated glyph from another set:
// `ph:shield-check-fill` for Qualys, `ph:devices-fill` for Kandji. That reads as
// a category symbol sitting in a row of brand marks, and it put a third icon
// language (Phosphor duotone) next to the full-colour skill-icons tiles and the
// flat simple-icons silhouettes.
//
// So: anything Iconify can't resolve falls back to a monogram plate — a signage
// tile in exactly the footprint of the icon it stands in for. It reads as a
// deliberate "no mark published" state rather than a wrong one. Because the
// check is a runtime resolve rather than a hardcoded list, it also covers marks
// that get pulled from a set later, and the case where api.iconify.design is
// unreachable altogether — which used to leave every tile on the page blank.

const WORD_SPLIT = /[\s./_-]+/;
const NOISE = /[^\p{L}\p{N}+#]/gu;
const UPPER = /\p{Lu}/gu;
const LEADS_UPPER = /^\p{Lu}/u;
const EM = /^\s*([\d.]+)\s*em\s*$/;

// "CrowdStrike Falcon" → CF, "Zscaler" → ZS, "OpenTofu" → OT.
export function monogramFor(name) {
    const words = String(name ?? '')
        .split(WORD_SPLIT)
        .map((word) => word.replace(NOISE, ''))
        .filter(Boolean);
    if (words.length === 0) return '??';
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    // A PascalCase word carries its own initials. Gated on the leading capital,
    // because in `macOS` and `tailwindCSS` the inner capitals are a suffix, not
    // a word boundary — those want the first two letters like anything else.
    const word = words[0];
    if (LEADS_UPPER.test(word)) {
        const caps = word.match(UPPER);
        if (caps && caps.length > 1) return (caps[0] + caps[1]).toUpperCase();
    }
    return word.slice(0, 2).toUpperCase();
}

// Sizes are passed in `em` so icons track the type scale of the row they sit in.
const scaleEm = (size, factor, fallback) => {
    const match = EM.exec(String(size));
    return match ? `${Number((parseFloat(match[1]) * factor).toFixed(3))}em` : fallback;
};

// 'ok' — resolved; 'missing' — no such icon, or the API is unreachable.
// 'pending' renders the icon optimistically: `iconify-icon` holds the space
// itself while it loads, so betting on success avoids a monogram flash on every
// cold load. Only a settled failure swaps in the plate.
function useIconStatus(icon) {
    const [status, setStatus] = useState(() => {
        if (!icon) return 'missing';
        return iconLoaded(icon) ? 'ok' : 'pending';
    });

    useEffect(() => {
        if (!icon) {
            setStatus('missing');
            return undefined;
        }
        if (iconLoaded(icon)) {
            setStatus('ok');
            return undefined;
        }
        let active = true;
        setStatus('pending');
        Promise.resolve(loadIcon(icon)).then(
            () => active && setStatus('ok'),
            () => active && setStatus('missing'),
        );
        return () => {
            active = false;
        };
    }, [icon]);

    return status;
}

// Square plate carrying the monogram. Sized and radiused to sit in the icon slot
// without disturbing the grid — the same crisp signage geometry as `.skill-block`.
function MonogramPlate({ text, size, className }) {
    return (
        <span
            aria-hidden='true'
            className={cn(
                'inline-grid shrink-0 place-items-center rounded-sm border border-border bg-secondary-700 text-content-accent',
                className,
            )}
            style={{ width: size, height: size }}
        >
            <span
                className='font-mono font-semibold leading-none tracking-tight'
                style={{ fontSize: scaleEm(size, 0.42, '0.5em') }}
            >
                {text}
            </span>
        </span>
    );
}

// `icon` may be null/absent — that is the explicit "no mark published" signal
// from the data, and skips the network round-trip a known-dead name would cost.
// `monogram` overrides the derived initials where the derivation reads badly.
export function BrandIcon({ icon, name, monogram, size = '1.25em', className }) {
    const status = useIconStatus(icon);

    if (status === 'missing') {
        return <MonogramPlate text={monogram || monogramFor(name)} size={size} className={className} />;
    }
    return <Icon className={className} icon={icon} width={size} height={size} aria-hidden='true' />;
}

export default BrandIcon;
