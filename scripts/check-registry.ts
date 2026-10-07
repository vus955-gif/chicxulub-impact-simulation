import { loadRegistry } from '../src/model/registry/load';
import { validateRegistry } from '../src/model/registry/validate';
const issues = validateRegistry(loadRegistry('research'));
console.log(`issues: ${issues.length}`);
for (const i of issues) console.log('  ' + i);
process.exit(issues.length ? 1 : 0);
