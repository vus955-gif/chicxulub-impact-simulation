import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Timeline from '../src/app/components/Timeline.svelte';
import { ui } from '../src/app/state.svelte';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { formatClock, T_MAX } from '../src/time/axis';
import type { AppData } from '../src/app/data';

describe('timeline slider is announced with its range and a readable time', () => {
  const reg = new RegistryIndex(loadRegistry('research'));
  const data = { reg, events: [] } as unknown as AppData; // Timeline czyta tylko rejestr i zdarzenia
  it('has aria-valuemin/max and aria-valuetext with the clock', () => {
    ui.t = 3725.5;
    const { body } = render(Timeline, { props: { data } });
    const svg = body.match(/<svg[^>]*role="slider"[^>]*>/)?.[0] ?? '';
    expect(svg).toContain(`aria-valuemin="${-reg.num('impactor.entry_duration')}"`);
    expect(svg).toContain(`aria-valuemax="${T_MAX}"`);
    expect(svg).toContain('aria-valuenow="3725.5"');
    expect(svg).toContain(`aria-valuetext="${formatClock(3725.5)}"`);
  });
  it('keeps aria-valuenow inside the range when the clock starts before the entry (default T−5.8 s)', () => {
    ui.t = -5.8; // domyślny start jest zaokrąglony, a przelot trwa ~5,77 s
    const { body } = render(Timeline, { props: { data } });
    const svg = body.match(/<svg[^>]*role="slider"[^>]*>/)?.[0] ?? '';
    expect(svg).toContain(`aria-valuenow="${-reg.num('impactor.entry_duration')}"`);
    expect(svg).toContain(`aria-valuetext="${formatClock(-5.8)}"`);
  });
});
