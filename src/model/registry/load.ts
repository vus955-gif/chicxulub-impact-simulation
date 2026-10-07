import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Parameter, Registry, Source } from './types';

export function loadRegistry(dir: string): Registry {
  const read = <T>(f: string): T => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T;
  const lit = read<{ parameters: Parameter[] }>('parameters.json').parameters;
  const derived = existsSync(join(dir, 'derived.json'))
    ? read<{ parameters: Parameter[] }>('derived.json').parameters
    : [];
  const sources = read<{ sources: Source[] }>('sources.json').sources;
  return { parameters: [...lit, ...derived], sources };
}
