#!/usr/bin/env node
/**
 * Coverage-threshold ratchet (issue #140).
 *
 * The jest coverage floor in jest.config.ts used to be bumped by hand every
 * time coverage rose. This script automates that so the floor can only ever go
 * UP, and fails CI if it silently drifts out of sync with real coverage.
 *
 * Reads the measured totals from coverage/coverage-summary.json (produced by
 * `jest --coverage --coverageReporters=json-summary`) and the committed floor
 * from jest.config.ts, then:
 *
 *   --check   (default) Exit non-zero if coverage regressed below the committed
 *             floor, OR if coverage has risen far enough above the floor that it
 *             should be ratcheted up. Used in CI.
 *   --apply   Rewrite the floor in jest.config.ts to `floor(measured) - MARGIN`
 *             for any metric that improved. Never lowers a floor. Run this (and
 *             commit jest.config.ts) after coverage improves.
 *
 * MARGIN keeps the floor a hair below the current number so normal run-to-run
 * jitter doesn't trip the build; DRIFT_SLACK is how far the floor may lag real
 * coverage before --check demands a ratchet.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = join(ROOT, 'jest.config.ts');
const SUMMARY_PATH = join(ROOT, 'coverage', 'coverage-summary.json');

const METRICS = ['statements', 'branches', 'functions', 'lines'];
const MARGIN = 1; // floor sits this many points below current coverage
const DRIFT_SLACK = 2; // floor may lag current by up to MARGIN + DRIFT_SLACK before a ratchet is required

const clamp = (n) => Math.max(0, Math.min(100, n));
/** The floor we'd set for a given measured pct: a whole number, MARGIN below. */
const targetFloor = (pct) => clamp(Math.floor(pct) - MARGIN);

function readMeasured() {
  let raw;
  try {
    raw = JSON.parse(readFileSync(SUMMARY_PATH, 'utf8'));
  } catch {
    console.error(
      `coverage-ratchet: could not read ${SUMMARY_PATH}.\n` +
        'Run coverage first, e.g. `npm run test:coverage`.'
    );
    process.exit(2);
  }
  const total = raw.total || {};
  const out = {};
  for (const m of METRICS) {
    if (typeof total[m]?.pct !== 'number') {
      console.error(`coverage-ratchet: missing "${m}.pct" in coverage summary.`);
      process.exit(2);
    }
    out[m] = total[m].pct;
  }
  return out;
}

/** Pull the committed floor out of the coverageThreshold.global block. */
function readCommitted(configText) {
  const block = configText.match(/coverageThreshold:\s*\{[\s\S]*?global:\s*\{([\s\S]*?)\}/);
  if (!block) {
    console.error('coverage-ratchet: could not find coverageThreshold.global in jest.config.ts.');
    process.exit(2);
  }
  const committed = {};
  for (const m of METRICS) {
    const hit = block[1].match(new RegExp(`${m}:\\s*(\\d+(?:\\.\\d+)?)`));
    if (!hit) {
      console.error(`coverage-ratchet: could not find "${m}" threshold in jest.config.ts.`);
      process.exit(2);
    }
    committed[m] = Number(hit[1]);
  }
  return committed;
}

/** Rewrite only the numbers inside coverageThreshold.global, leaving formatting intact. */
function writeCommitted(configText, next) {
  return configText.replace(
    /(coverageThreshold:\s*\{[\s\S]*?global:\s*\{)([\s\S]*?)(\})/,
    (_all, head, body, tail) => {
      let updated = body;
      for (const m of METRICS) {
        updated = updated.replace(new RegExp(`(${m}:\\s*)(\\d+(?:\\.\\d+)?)`), `$1${next[m]}`);
      }
      return head + updated + tail;
    }
  );
}

const fmt = (n) => `${n}`.padStart(6);

function main() {
  const apply = process.argv.includes('--apply');
  const measured = readMeasured();
  const configText = readFileSync(CONFIG_PATH, 'utf8');
  const committed = readCommitted(configText);

  const rows = METRICS.map((m) => {
    const cur = measured[m];
    const floor = committed[m];
    const target = targetFloor(cur);
    return {
      m,
      cur,
      floor,
      target,
      regressed: cur < floor,
      stale: target - floor > DRIFT_SLACK,
      raise: target > floor,
    };
  });

  console.log('metric      current   floor  target');
  for (const r of rows) {
    console.log(
      `${r.m.padEnd(11)} ${fmt(r.cur.toFixed(2))} ${fmt(r.floor)} ${fmt(r.target)}` +
        (r.regressed ? '  ✗ below floor' : r.stale ? '  ↑ floor is stale' : '')
    );
  }

  if (apply) {
    const next = {};
    let changed = false;
    for (const r of rows) {
      next[r.m] = Math.max(r.floor, r.target); // monotonic — never lowers
      if (next[r.m] !== r.floor) changed = true;
    }
    if (!changed) {
      console.log('\ncoverage-ratchet: floor already up to date, nothing to raise.');
      return;
    }
    writeFileSync(CONFIG_PATH, writeCommitted(configText, next));
    console.log('\ncoverage-ratchet: raised floor ->', METRICS.map((m) => `${m} ${next[m]}`).join(', '));
    console.log('Commit jest.config.ts to lock in the new floor.');
    return;
  }

  // --check
  const regressed = rows.filter((r) => r.regressed);
  const stale = rows.filter((r) => r.stale);
  if (regressed.length) {
    console.error(
      '\ncoverage-ratchet: coverage dropped below the committed floor: ' +
        regressed.map((r) => `${r.m} ${r.cur.toFixed(2)} < ${r.floor}`).join(', ')
    );
    process.exit(1);
  }
  if (stale.length) {
    console.error(
      '\ncoverage-ratchet: floor is stale for ' +
        stale.map((r) => `${r.m} (floor ${r.floor}, coverage ${r.cur.toFixed(2)})`).join(', ') +
        '\nRun `npm run coverage:ratchet` and commit jest.config.ts to ratchet the floor up.'
    );
    process.exit(1);
  }
  console.log('\ncoverage-ratchet: floor is in sync with coverage. ✓');
}

main();
