import type { Parameter, Registry, Source } from '../registry/types';

/** Szybki dostęp do rejestru po identyfikatorach. Brak wymaganej wartości = błąd programisty (rzuca). */
export class RegistryIndex {
  private readonly params: Map<string, Parameter>;
  private readonly sources: Map<string, Source>;

  constructor(readonly registry: Registry) {
    this.params = new Map(registry.parameters.map((p) => [p.id, p]));
    this.sources = new Map(registry.sources.map((s) => [s.id, s]));
  }

  opt(id: string): Parameter | undefined {
    return this.params.get(id);
  }

  param(id: string): Parameter {
    const p = this.params.get(id);
    if (!p) throw new Error(`Rejestr: brak parametru ${id}`);
    return p;
  }

  num(id: string): number {
    const v = this.param(id).value;
    if (typeof v !== 'number') throw new Error(`Rejestr: parametr ${id} nie jest liczbą`);
    return v;
  }

  source(id: string): Source {
    const s = this.sources.get(id);
    if (!s) throw new Error(`Rejestr: brak źródła ${id}`);
    return s;
  }

  all(): Parameter[] {
    return this.registry.parameters;
  }
}
