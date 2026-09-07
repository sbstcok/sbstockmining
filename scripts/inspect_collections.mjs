import admin from 'firebase-admin';
import fs from 'fs';

const keyPath = process.env.SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error('Service account key path not set. Set SERVICE_ACCOUNT_KEY_PATH or GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

let serviceAccount;
try { serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8')); } catch (e) { console.error('Failed to read service account key:', e.message); process.exit(1); }

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function sampleCollection(name, limit = 5) {
  const snap = await db.collection(name).limit(limit).get();
  console.log(`\nCollection: ${name} — docs: ${snap.size}`);
  snap.docs.forEach((d, i) => {
    console.log(`  Doc ${i+1}: id=${d.id} data=`, d.data());
  });
}

async function counts(name) {
  // count by iterating (simple but may be slow for huge collections)
  const snap = await db.collection(name).get();
  return snap.size;
}

async function main() {
  console.log('Inspecting collections (this is read-only)');
  for (const col of ['deposits','withdrawals','investments']) {
    const c = await counts(col);
    console.log(`\n${col}: ${c} documents`);
    await sampleCollection(col, 5);
  }
}

main().catch(e => { console.error('Inspect failed:', e); process.exit(1); });
