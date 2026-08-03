import { useSyncExternalStore } from 'react';
import { getServiceLevel } from './serviceStatus';

// One clock for the whole site.
//
// The header's ticking JST readout, its service badge, the concourse board's
// status pill and the trains on the background map are all the same claim about
// Tokyo's timetable. They used to each run their own interval at their own rate
// — the header every second, everything else every thirty — so at a band
// boundary the board could still read "All Lines Running" for another half
// minute after the badge had gone to Reduced Service. Now a single ticking
// source feeds all of them, and they flip on the same tick.
//
// Every subscriber is notified each tick, but `useSyncExternalStore` compares
// the snapshot it hands back: a component re-renders only when the value it
// actually reads has changed. So the header's clock re-renders once a second,
// the pill and the map only when the band flips, and the certification list
// only when the calendar day turns over.

const TICK_MS = 1000;

const listeners = new Set();
let timer = null;

let now = new Date();
let level = getServiceLevel(now);
let today = now;

// Snapshots are compared by identity, so each one is only replaced when the
// thing it describes has actually moved: `now` once a second, `today` at
// midnight. Re-reading the clock is therefore cheap enough to do freely.
const dayStamp = (date) => date.toDateString();
const secondOf = (date) => Math.floor(date.getTime() / 1000);

function read() {
    const sample = new Date();
    if (secondOf(sample) !== secondOf(now)) now = sample;
    level = getServiceLevel(sample);
    if (dayStamp(sample) !== dayStamp(today)) today = sample;
}

function tick() {
    read();
    for (const listener of listeners) listener();
}

// A hidden tab has its timers throttled — Chrome drops them to once a minute
// after five minutes out of sight, and a frozen or discarded tab does not run
// them at all. That much is the browser's call, but the moment the tab is
// looked at again it has to be right, so re-read the clock on the way back in
// instead of waiting for whatever the next tick would have been. `pageshow`
// covers the same for a restore from the back/forward cache.
function resync() {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') tick();
}

function start() {
    timer = setInterval(tick, TICK_MS);
    document.addEventListener('visibilitychange', resync);
    window.addEventListener('pageshow', resync);
}

function stop() {
    clearInterval(timer);
    timer = null;
    document.removeEventListener('visibilitychange', resync);
    window.removeEventListener('pageshow', resync);
}

function subscribe(listener) {
    listeners.add(listener);
    if (!timer) start();
    // Whoever just mounted may be doing so long after the last tick — a tab
    // restored from sleep, a route rendered on a page that has been open all
    // night. Re-read rather than serve them the stale snapshot, and let the
    // components already mounted catch up on the same read so no two readouts
    // are ever a tick apart.
    tick();
    return () => {
        listeners.delete(listener);
        if (!listeners.size && timer) stop();
    };
}

// The current instant, reissued every second — for readouts that show the time.
export function useNow() {
    return useSyncExternalStore(
        subscribe,
        () => now,
        () => now,
    );
}

// The Tokyo service band. Stable between bands, so subscribers re-render only
// when service actually changes.
export function useServiceLevel() {
    return useSyncExternalStore(
        subscribe,
        () => level,
        () => level,
    );
}

// Today's date, stable until midnight — for anything that ages by the day
// rather than by the second, so a tab left open overnight still tells the truth.
export function useToday() {
    return useSyncExternalStore(
        subscribe,
        () => today,
        () => today,
    );
}
