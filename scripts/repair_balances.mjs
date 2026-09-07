import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = process.env.SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error('Service account key path not set. Set SERVICE_ACCOUNT_KEY_PATH or GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
} catch (err) {
  console.error('Failed to read service account key:', err.message);
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const argv = process.argv.slice(2);
const doApply = argv.includes('--apply');
const confirm = argv.includes('--confirm');

const ts = Date.now();
const backupsDir = path.join(process.cwd(), 'backups');
fs.mkdirSync(backupsDir, { recursive: true });

async function backupUsers() {
  console.log('Backing up users collection...');
  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const filePath = path.join(backupsDir, `users_backup_${ts}.json`);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  console.log('Users backup written to', filePath);
  return { users, filePath };
}

async function computeForUser(user) {
  const uid = user.id;
  // Sum approved/completed deposits for the user
  const depositsApprovedSnap = await db.collection('deposits')
    .where('userId', '==', uid)
    .where('status', '==', 'completed')
    .get();
  let sumApprovedDeposits = 0;
  depositsApprovedSnap.docs.forEach(d => { const a = Number(d.data().amount) || 0; sumApprovedDeposits += a; });

  // Sum pending deposits for informational purposes
  const depositsPendingSnap = await db.collection('deposits')
    .where('userId', '==', uid)
    .where('status', '==', 'pending')
    .get();
  let sumPendingDeposits = 0;
  depositsPendingSnap.docs.forEach(d => { const a = Number(d.data().amount) || 0; sumPendingDeposits += a; });

  // Sum approved/completed withdrawals
  const withdrawalsApprovedSnap = await db.collection('withdrawals')
    .where('userId', '==', uid)
    .where('status', '==', 'completed')
    .get();
  let sumApprovedWithdrawals = 0;
  withdrawalsApprovedSnap.docs.forEach(d => { const a = Number(d.data().amount) || 0; sumApprovedWithdrawals += a; });

  // Sum pending withdrawals for informational purposes
  const withdrawalsPendingSnap = await db.collection('withdrawals')
    .where('userId', '==', uid)
    .where('status', '==', 'pending')
    .get();
  let sumPendingWithdrawals = 0;
  withdrawalsPendingSnap.docs.forEach(d => { const a = Number(d.data().amount) || 0; sumPendingWithdrawals += a; });

  // Sum approved/completed investments
  const investmentsApprovedSnap = await db.collection('investments')
    .where('userId', '==', uid)
    .where('status', '==', 'completed')
    .get();
  let sumApprovedInvestments = 0;
  investmentsApprovedSnap.docs.forEach(d => { const a = Number(d.data().amount) || 0; sumApprovedInvestments += a; });

  // Sum pending investments for informational purposes
  const investmentsPendingSnap = await db.collection('investments')
    .where('userId', '==', uid)
    .where('status', '==', 'pending')
    .get();
  let sumPendingInvestments = 0;
  investmentsPendingSnap.docs.forEach(d => { const a = Number(d.data().amount) || 0; sumPendingInvestments += a; });

  return {
    uid,
    currentTotalInvestments: Number(user.totalInvestments) || 0,
    currentTotalWithdrawals: Number(user.totalWithdrawals) || 0,
    sumApprovedDeposits,
    sumPendingDeposits,
    sumApprovedWithdrawals,
    sumPendingWithdrawals,
    sumApprovedInvestments,
    sumPendingInvestments,
    // Recompute totals from approved (completed) transactions only
    // totalInvestments := approved deposits + approved investments - approved withdrawals
    recomputedTotalInvestments: sumApprovedDeposits + sumApprovedInvestments - sumApprovedWithdrawals,
    recomputedTotalWithdrawals: sumApprovedWithdrawals,
  };
}

async function main() {
  const { users } = await backupUsers();

  console.log('Computing reconciliation report (dry-run)...');
  const report = [];
  for (const user of users) {
    const res = await computeForUser(user);
    report.push(res);
    console.log(`User ${res.uid}: currentInvest=${res.currentTotalInvestments} computedInvest=${res.recomputedTotalInvestments} delta=${(res.recomputedTotalInvestments - res.currentTotalInvestments).toFixed(2)}, currentWithdraw=${res.currentTotalWithdrawals} computedWithdraw=${res.recomputedTotalWithdrawals} delta=${(res.recomputedTotalWithdrawals - res.currentTotalWithdrawals).toFixed(2)}`);
  }

  const reportPath = path.join(backupsDir, `reconciliation_report_${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('Reconciliation report written to', reportPath);

  // Build a proposed changes list: only users with approved transactions (evidence)
  const proposed = [];
  for (const r of report) {
    const updates = {};
    if ((r.sumApprovedDeposits || 0) > 0 && Number(r.recomputedTotalInvestments || 0) !== Number(r.currentTotalInvestments || 0)) {
      updates.recomputedTotalInvestments = r.recomputedTotalInvestments;
    }
    if ((r.sumApprovedWithdrawals || 0) > 0 && Number(r.recomputedTotalWithdrawals || 0) !== Number(r.currentTotalWithdrawals || 0)) {
      updates.recomputedTotalWithdrawals = r.recomputedTotalWithdrawals;
    }
    if (Object.keys(updates).length > 0) {
      proposed.push({
        uid: r.uid,
        currentTotalInvestments: r.currentTotalInvestments,
        currentTotalWithdrawals: r.currentTotalWithdrawals,
        ...updates,
        sumApprovedDeposits: r.sumApprovedDeposits,
        sumApprovedWithdrawals: r.sumApprovedWithdrawals,
        sumPendingDeposits: r.sumPendingDeposits,
        sumPendingWithdrawals: r.sumPendingWithdrawals
      });
    }
  }

  const proposedPath = path.join(backupsDir, `proposed_changes_${ts}.json`);
  fs.writeFileSync(proposedPath, JSON.stringify(proposed, null, 2));
  console.log('Proposed changes written to', proposedPath);

  if (doApply) {
    if (!confirm) {
      console.error('Applying changes requires --confirm flag for safety. Aborting.');
      process.exit(1);
    }
    console.log('Applying computed totals to users collection...');
    const changes = [];
    for (const r of report) {
      // Only apply when there is evidence of approved transactions for this user
      const hasApproved = (r.sumApprovedDeposits || 0) > 0 || (r.sumApprovedWithdrawals || 0) > 0;
      if (!hasApproved) continue;
      const updates = {};
      if (Number(r.recomputedTotalInvestments || 0) !== Number(r.currentTotalInvestments || 0)) updates.totalInvestments = r.recomputedTotalInvestments;
      if (Number(r.recomputedTotalWithdrawals || 0) !== Number(r.currentTotalWithdrawals || 0)) updates.totalWithdrawals = r.recomputedTotalWithdrawals;
      if (Object.keys(updates).length > 0) {
        updates.repairedAt = admin.firestore.FieldValue.serverTimestamp();
        await db.collection('users').doc(r.uid).update(updates);
        changes.push({ uid: r.uid, updates });
        console.log(`Updated user ${r.uid}:`, updates);
      }
    }
    const changesPath = path.join(backupsDir, `reconciliation_changes_${ts}.json`);
    fs.writeFileSync(changesPath, JSON.stringify(changes, null, 2));
    console.log('Applied changes recorded to', changesPath);
  } else {
    console.log('Dry-run complete. To apply changes, run with --apply --confirm and ensure backups exist.');
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
