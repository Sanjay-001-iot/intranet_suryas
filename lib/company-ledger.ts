import fs from 'fs';
import path from 'path';

export type LedgerTransactionType = 'credited' | 'debited';

export interface LedgerTransaction {
  id: string;
  date: string;
  amount: number;
  purpose: string;
  remarks?: string;
  type: LedgerTransactionType;
  balanceAfter: number;
  requestId?: string;
  requestType?: string;
}

export interface CompanyLedger {
  balance: number;
  transactions: LedgerTransaction[];
}

const LEDGER_FILE = path.join(process.cwd(), '.data', 'company-ledger.json');

function ensureLedgerFile(): void {
  const dir = path.dirname(LEDGER_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LEDGER_FILE)) {
    const initial: CompanyLedger = { balance: 0, transactions: [] };
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(initial, null, 2));
  }
}

function readLedger(): CompanyLedger {
  try {
    ensureLedgerFile();
    const raw = fs.readFileSync(LEDGER_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as CompanyLedger;
    return {
      balance: typeof parsed.balance === 'number' ? parsed.balance : 0,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    };
  } catch (error) {
    console.error('Error reading company ledger:', error);
    return { balance: 0, transactions: [] };
  }
}

function writeLedger(ledger: CompanyLedger): void {
  try {
    ensureLedgerFile();
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
  } catch (error) {
    console.error('Error writing company ledger:', error);
  }
}

export function getCompanyLedger(): CompanyLedger {
  return readLedger();
}

export function addLedgerTransaction(input: {
  amount: number;
  purpose: string;
  remarks?: string;
  type: LedgerTransactionType;
  requestId?: string;
  requestType?: string;
}): CompanyLedger {
  const ledger = readLedger();
  const normalizedAmount = Number(input.amount);
  const delta = input.type === 'credited' ? normalizedAmount : -normalizedAmount;
  const nextBalance = Number((ledger.balance + delta).toFixed(2));

  const transaction: LedgerTransaction = {
    id: `txn-${Date.now()}`,
    date: new Date().toISOString(),
    amount: normalizedAmount,
    purpose: input.purpose,
    remarks: input.remarks,
    type: input.type,
    balanceAfter: nextBalance,
    requestId: input.requestId,
    requestType: input.requestType,
  };

  const nextLedger: CompanyLedger = {
    balance: nextBalance,
    transactions: [transaction, ...ledger.transactions],
  };

  writeLedger(nextLedger);
  return nextLedger;
}