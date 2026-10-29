import { parseMarkup } from '../utils/markup';

// The summary lives in personal_data.json rather than in this component so the
// downloadable CV, which is compiled from the same JSON, always says the same thing.
function PersonalSummary({ paragraphs = [] }) {
    return paragraphs.map((paragraph, index) => (
        <p key={index} className='mb-0 leading-relaxed max-sm:text-xs sm:text-sm'>
            {parseMarkup(paragraph).map((run, runIndex) => {
                if (run.style === 'bold') return <strong key={runIndex}>{run.text}</strong>;
                if (run.style === 'italic') return <em key={runIndex}>{run.text}</em>;
                return run.text;
            })}
        </p>
    ));
}

export default PersonalSummary;
