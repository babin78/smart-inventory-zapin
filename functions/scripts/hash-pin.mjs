import { createHash, randomBytes, scryptSync } from 'node:crypto';

const pin = process.argv[2];
if (!pin) {
  console.error('Usage: npm run hash-pin -- <pin>');
  process.exit(1);
}

const salt = randomBytes(16);
const digest = scryptSync(pin, salt, 32);
const hash = `scrypt$${salt.toString('hex')}$${digest.toString('hex')}`;
const check = createHash('sha256').update(pin).digest('hex').slice(0, 8);
console.log(hash);
console.error(`# check prefix ${check} (not the PIN)`);
