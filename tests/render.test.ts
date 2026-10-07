import { describe, it, expect } from 'vitest';
import { renderReport } from '../src/report/render';
import type { Registry } from '../src/model/registry/types';

const reg: Registry = {
  sources: [
    { id: 'alpha2005', type: 'article', authors: 'Alpha, A.', year: 2005, title: 'Alpha <paper>',
      container: 'J. Test', volume: '40', pages: '1–2', doi: '10.1111/abc', peerReviewed: true, verified: true },
    { id: 'beta2010', type: 'article', authors: 'Beta, B.', year: 2010, title: 'Beta paper',
      container: 'J. Test', doi: '10.2222/def', peerReviewed: true, verified: true },
  ],
  parameters: [
    { id: 'impactor.diameter', group: 'impactor', label: 'Średnica impaktora', value: 10, unit: 'km',
      range: [8, 15], certainty: 'extrapolation', method: 'model:alpha2005', sources: ['alpha2005'] },
  ],
};

describe('renderReport', () => {
  it('renders parameter value with certainty mark and citation number', () => {
    const { html, issues } = renderReport('<p>{{p:impactor.diameter}}</p>{{bib}}', reg);
    expect(issues).toEqual([]);
    expect(html).toContain('10 km');
    expect(html).toContain('◐');
    expect(html).toContain('href="#ref-1"');
  });
  it('reuses citation numbers and numbers new sources in order of first use', () => {
    const { html } = renderReport('{{cite:beta2010}} {{p:impactor.diameter}} {{cite:beta2010}}{{bib}}', reg);
    expect(html.match(/\[1\]/g)?.length).toBeGreaterThanOrEqual(2); // beta2010 = [1]
    expect(html).toContain('[2]');                                  // alpha2005 = [2]
  });
  it('renders range', () => {
    expect(renderReport('{{r:impactor.diameter}}', reg).html).toBe('8–15 km');
  });
  it('renders a group table', () => {
    const { html } = renderReport('{{table:impactor}}', reg);
    expect(html).toContain('<table');
    expect(html).toContain('Średnica impaktora');
  });
  it('renders bibliography with DOI links and escapes HTML', () => {
    const { html } = renderReport('{{cite:alpha2005}}{{bib}}', reg);
    expect(html).toContain('https://doi.org/10.1111/abc');
    expect(html).toContain('Alpha &lt;paper&gt;');
    expect(html).toContain('id="ref-1"');
  });
  it('reports unknown parameter and source ids', () => {
    const { issues } = renderReport('{{p:nope.x}} {{cite:ghost}} {{table:emptygroup}}', reg);
    expect(issues).toHaveLength(3);
  });
});

describe('renderReport figures', () => {
  it('inserts figure output and reports unknown figures', () => {
    const { html, issues } = renderReport('{{fig:demo}}{{fig:nope}}', reg, { demo: () => '<svg id="d"></svg>' });
    expect(html).toContain('<svg id="d"></svg>');
    expect(issues).toEqual(['unknown figure "nope"']);
  });
  it('flags figures containing NaN', () => {
    expect(renderReport('{{fig:bad}}', reg, { bad: () => '<svg x="NaN"></svg>' }).issues).toHaveLength(1);
  });
});

describe('renderReport chronology and sites', () => {
  const reg2: Registry = {
    sources: reg.sources,
    parameters: [
      ...reg.parameters,
      { id: 'crater.t_a', group: 'crater', label: 'Zdarzenie A', value: 180, unit: 's', certainty: 'extrapolation', method: 'model:alpha2005', sources: ['alpha2005'], time: { t: 180 } },
      { id: 'crater.t_b', group: 'crater', label: 'Zdarzenie B', value: 5, unit: 's', certainty: 'fact', method: 'measured', sources: ['beta2010'], time: { t: -5 } },
      { id: 'crater.t_c', group: 'crater', label: 'Zdarzenie C', value: 2, unit: 'd', certainty: 'fact', method: 'measured', sources: ['beta2010'], time: { t: 172800 } },
    ],
  };
  it('lists events sorted by time and cuts at the limit', () => {
    const { html } = renderReport('{{chrono:86400}}', reg2);
    expect(html.indexOf('Zdarzenie B')).toBeLessThan(html.indexOf('Zdarzenie A'));
    expect(html).toContain('T−5 s');
    expect(html).toContain('T+3 min');
    expect(html).not.toContain('Zdarzenie C');
  });
  it('renders sites with citations and pending paleo coordinates', () => {
    const { html, issues } = renderReport('{{sites:all}}{{bib}}', reg2, {}, [
      { id: 's1', name: 'Stanowisko X', lat: 40, lon: 10, coordSource: 'beta2010', observations: [{ text: 'warstwa 2 mm', sources: ['alpha2005'], certainty: 'fact' }] },
    ]);
    expect(issues).toEqual([]);
    expect(html).toContain('Stanowisko X');
    expect(html).toContain('oczekuje na rekonstrukcję');
    expect(html).toContain('warstwa 2 mm');
  });
});

describe('renderReport compact value token', () => {
  it('renders value with mark but without citation', () => {
    const { html } = renderReport('{{v:impactor.diameter}}', reg);
    expect(html).toContain('10 km');
    expect(html).toContain('◐');
    expect(html).not.toContain('cite');
  });
});
