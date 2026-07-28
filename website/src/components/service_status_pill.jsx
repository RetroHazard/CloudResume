import { StatusPill } from './ui/primitives';
import useServiceLevel from '../utils/useServiceLevel';

// The concourse board's status pill. It used to be hard-coded to "All Lines
// Running", which contradicted the header badge and the stabled trains on the
// background map whenever Tokyo was off-peak or shut for the night. It now reads
// off the same JST timetable as both, so the whole page tells one story.

// Signal colour per band, matching the header badge.
const LEVEL_TONES = {
    full: 'on',
    reduced: 'reduced',
    last: 'alert',
    closed: 'past',
};

export default function ServiceStatusPill() {
    const level = useServiceLevel();
    return (
        <StatusPill tone={LEVEL_TONES[level.key] ?? 'on'} title={level.detail}>
            {level.board}
        </StatusPill>
    );
}
