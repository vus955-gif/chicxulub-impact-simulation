import { describe, it, expect } from 'vitest';
import { formatNumber, formatParam, formatRange, CERTAINTY_MARK } from '../src/model/registry/format';
import type { Parameter } from '../src/model/registry/types';

const NBSP = ' ';
const p = (over: Partial<Parameter>): Parameter => ({
  id: 'x.y', group: 'x', label: 'L', value: 1, unit: 'km', certainty: 'fact',
  method: 'measured', sources: ['s'], ...over,
});

describe('formatNumber (pl-PL)', () => {
  it('uses decimal comma', () => expect(formatNumber(0.5)).toBe('0,5'));
  it('keeps small integers', () => expect(formatNumber(180)).toBe('180'));
  it('groups thousands from 5 digits with NBSP and rounds to 3 sig. digits', () =>
    expect(formatNumber(12345)).toBe(`12${NBSP}300`));
  it('uses scientific notation for large numbers', () =>
    expect(formatNumber(4.2e23)).toBe('4,2 × 10²³'));
  it('normalizes mantissa that rounds up to 10', () =>
    expect(formatNumber(9.996e23)).toBe('1 × 10²⁴'));
  it('uses scientific notation for tiny numbers', () =>
    expect(formatNumber(3.2e-5)).toBe('3,2 × 10⁻⁵'));
  it('formats zero', () => expect(formatNumber(0)).toBe('0'));
});

describe('formatParam / formatRange', () => {
  it('appends unit with space', () => expect(formatParam(p({ value: 180 }))).toBe('180 km'));
  it('appends degree without space', () => expect(formatParam(p({ value: 60, unit: '°' }))).toBe('60°'));
  it('shows dash for null', () => expect(formatParam(p({ value: null }))).toBe('—'));
  it('passes strings through', () => expect(formatParam(p({ value: 'chondryt węglisty', unit: '' }))).toBe('chondryt węglisty'));
  it('formats range', () => expect(formatRange(p({ range: [150, 200] }))).toBe('150–200 km'));
  it('dash for missing range', () => expect(formatRange(p({ range: null }))).toBe('—'));
  it('has a mark for each certainty', () =>
    expect(Object.values(CERTAINTY_MARK)).toEqual(['●', '◐', '○', '⚑', '△']));
});
