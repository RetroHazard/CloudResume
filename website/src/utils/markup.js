// The summary paragraphs in personal_data.json carry a two-token markup — **bold**
// and *italic* — because the same strings are also typeset into the downloadable
// CV. infrastructure/codebase/renderResume.py (parse_markup) reads them with the
// same pattern; change one and the site and the PDF stop agreeing on emphasis.
const MARKUP = /(\*\*.+?\*\*|\*.+?\*)/;

export function parseMarkup(text) {
    return String(text ?? '')
        .split(MARKUP)
        .filter(Boolean)
        .map((part) => {
            if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
                return { style: 'bold', text: part.slice(2, -2) };
            }
            if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
                return { style: 'italic', text: part.slice(1, -1) };
            }
            return { style: 'plain', text: part };
        });
}
