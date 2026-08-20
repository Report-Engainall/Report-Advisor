import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/scenarioEngine.ts', 'utf8');
for (const token of ['PRICE_UP','COST_UP','COLLECTION_DOWN','INVENTORY_CHANGE','assumptions','reversible','INVALID']) if (!source.includes(token)) throw new Error(`Scenario contract missing: ${token}`);
console.log('Scenario engine contract: PASS');
