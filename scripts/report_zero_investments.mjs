import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
if (!keyPath) {
  console.error('Please set SERVICE_ACCOUNT_KEY_PATH env var to your service account JSON');
  process.exit(2);
}

const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(key) });
const db = admin.firestore();

function nowTs() { return Date.now(); }

async function sumCollectionForUser(colName, uid) {
  const snap = await db.collection(colName).where('userId','==',uid).get();
  let approved = 0, pending = 0, count = 0;
  snap.forEach(d => {
    const data = d.data();
    const amt = Number(data.amount || 0);
    const st = (data.status || '').toLowerCase();
    if (st === 'completed' || st === 'approved' || st === 'done') approved += amt;
    else pending += amt;
    count += 1;
  });
  return { approved, pending, count };
}

async function main(){
  console.log('Loading users...');
  const usersSnap = await db.collection('users').get();
  const report = [];
  for (const udoc of usersSnap.docs) {
    const d = udoc.data();
    const totalInvest = typeof d.totalInvestments === 'number' ? d.totalInvestments : 0;
    if (totalInvest !== 0) continue; // only inspect zeroes

    const uid = udoc.id;
    const deposits = await sumCollectionForUser('deposits', uid);
    const investments = await sumCollectionForUser('investments', uid);
    const withdrawals = await sumCollectionForUser('withdrawals', uid);

    report.push({
      uid,
      displayName: d.fullName || d.displayName || null,
      email: d.email || null,
      currentTotalInvestments: totalInvest,
      deposits,
      investments,
      withdrawals
    });
  }

  const outDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `zero_investment_report_${nowTs()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Report written to', outPath);
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e); process.exit(2)});
