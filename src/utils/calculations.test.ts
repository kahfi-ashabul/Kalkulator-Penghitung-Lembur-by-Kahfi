import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOvertime,
  formatRupiah,
  parseRupiah,
  formatJam,
  getCutoffDateRange,
  detectAutoDayType,
  getNamaHari,
} from './calculations';

test('PRD Case 1: Rp6.000.000, 5 hari, Minggu, 8 jam -> 16x upah sejam (~Rp554.913)', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: '5_hari',
    jenisHari: 'minggu',
    liburResmi: false,
    jamLembur: 8,
  });

  // Upah sejam = 6.000.000 / 173 = 34.682,08...
  // 8 jam x 2 = 16 pengali
  // 16 x (6.000.000 / 173) = 554.913
  assert.equal(result.jamLembur, 8);
  assert.equal(result.breakdown.length, 8);
  assert.equal(result.breakdown[0].multiplier, 2);
  assert.equal(result.breakdown[7].multiplier, 2);
  // Total nominal should be ~554.913
  assert.ok(Math.abs(result.totalUpahLembur - 554913) <= 2, `Expected ~554913, got ${result.totalUpahLembur}`);
});

test('PRD Case 2: Rp6.000.000, 5 hari, Sabtu, 9 jam -> 19x upah sejam (~Rp658.958)', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: '5_hari',
    jenisHari: 'sabtu',
    liburResmi: false,
    jamLembur: 9,
  });

  // Jam 1-8: 2x (16) + Jam 9: 3x (3) = 19 pengali
  // 19 x 34.682,08 = 658.960 or ~658.958 depending on rounding
  assert.equal(result.breakdown.length, 9);
  assert.equal(result.breakdown[8].multiplier, 3);
  assert.ok(Math.abs(result.totalUpahLembur - 658960) <= 5, `Expected ~658958-658960, got ${result.totalUpahLembur}`);
});

test('PRD Case 3: Rp6.000.000, 6 hari, Minggu, 8 jam -> 17x upah sejam (~Rp589.594)', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: '6_hari',
    jenisHari: 'minggu',
    liburResmi: false,
    jamLembur: 8,
  });

  // Jam 1-7: 2x (14) + Jam 8: 3x (3) = 17 pengali
  // 17 x 34.682,08 = 589.595
  assert.equal(result.breakdown.length, 8);
  assert.equal(result.breakdown[6].multiplier, 2);
  assert.equal(result.breakdown[7].multiplier, 3);
  assert.ok(Math.abs(result.totalUpahLembur - 589595) <= 5, `Expected ~589594, got ${result.totalUpahLembur}`);
});

test('PRD Case 4: Rp6.000.000, 6 hari, Sabtu, 3 jam -> 5.5x upah sejam (~Rp190.751)', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: '6_hari',
    jenisHari: 'sabtu',
    liburResmi: false,
    jamLembur: 3,
  });

  // Pada 6 hari kerja biasa, Sabtu jam 1: 1.5x, jam 2: 2x, jam 3: 2x = 5.5x
  // 5.5 x 34.682,08 = 190.751
  assert.equal(result.breakdown.length, 3);
  assert.equal(result.breakdown[0].multiplier, 1.5);
  assert.equal(result.breakdown[1].multiplier, 2);
  assert.equal(result.breakdown[2].multiplier, 2);
  assert.ok(Math.abs(result.totalUpahLembur - 190751) <= 3, `Expected ~190751, got ${result.totalUpahLembur}`);
});

test('PRD Case 5: Gaji kosong atau 0 -> total 0 dengan warning', () => {
  const result = calculateOvertime({
    gajiPokok: 0,
    tunjanganTetap: 0,
    sistem: '5_hari',
    jenisHari: 'minggu',
    liburResmi: false,
    jamLembur: 8,
  });

  assert.equal(result.totalUpahLembur, 0);
  assert.ok(result.warning?.includes('Gaji pokok'));
});

test('PRD Case 6: Jam > 12 -> gives warning but calculates properly', () => {
  const result = calculateOvertime({
    gajiPokok: 5000000,
    tunjanganTetap: 0,
    sistem: '5_hari',
    jenisHari: 'minggu',
    liburResmi: false,
    jamLembur: 13,
  });

  assert.ok(result.isExcessOvertime);
  assert.ok(result.warning?.includes('12 jam'));
  assert.ok(result.totalUpahLembur > 0);
  assert.equal(result.breakdown.length, 13);
});

test('PRD Case 7: Desimal 2.5 jam -> half hour calculated proportionally at multiplier', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: 'biasa' as any,
    jenisHari: 'biasa',
    liburResmi: false,
    jamLembur: 2.5,
  });

  // Jam 1: 1 jam x 1.5 = 1.5
  // Jam 2: 1 jam x 2.0 = 2.0
  // Jam 3: 0.5 jam x 2.0 = 1.0
  // Total pengali = 4.5x
  // 4.5 x 34.682,08 = 156.069
  assert.equal(result.breakdown.length, 3);
  assert.equal(result.breakdown[2].hoursCount, 0.5);
  assert.equal(result.breakdown[2].multiplier, 2.0);
  assert.ok(Math.abs(result.totalUpahLembur - 156069) <= 3);
});

test('Helper utilities: formatRupiah, parseRupiah, formatJam', () => {
  assert.equal(formatRupiah(5000000), 'Rp 5.000.000');
  assert.equal(parseRupiah('Rp 5.000.000'), 5000000);
  assert.equal(formatJam(2.5), '2,5 jam');
  assert.equal(formatJam(4), '4 jam');
});

test('Cutoff ranges calculation', () => {
  const rangeKalender = getCutoffDateRange(2026, 11, 'kalender');
  assert.equal(rangeKalender.startDate, '2026-11-01');
  assert.equal(rangeKalender.endDate, '2026-11-30');

  const range20 = getCutoffDateRange(2026, 11, 'cut_off_20');
  assert.equal(range20.startDate, '2026-10-21');
  assert.equal(range20.endDate, '2026-11-20');

  const range25 = getCutoffDateRange(2026, 11, 'cut_off_25');
  assert.equal(range25.startDate, '2026-10-26');
  assert.equal(range25.endDate, '2026-11-25');
});

test('Deteksi otomatis hari kerja vs hari libur: detectAutoDayType & getNamaHari', () => {
  // 2026-11-02 = Senin, 2026-11-06 = Jumat, 2026-11-07 = Sabtu, 2026-11-08 = Minggu
  assert.equal(getNamaHari('2026-11-02'), 'Senin');
  assert.equal(getNamaHari('2026-11-06'), 'Jumat');
  assert.equal(getNamaHari('2026-11-07'), 'Sabtu');
  assert.equal(getNamaHari('2026-11-08'), 'Minggu');

  // Sistem 5 hari
  assert.equal(detectAutoDayType('2026-11-02', '5_hari'), 'biasa');
  assert.equal(detectAutoDayType('2026-11-06', '5_hari'), 'biasa');
  assert.equal(detectAutoDayType('2026-11-07', '5_hari'), 'libur');
  assert.equal(detectAutoDayType('2026-11-08', '5_hari'), 'libur');

  // Sistem 6 hari (Sabtu adalah hari kerja)
  assert.equal(detectAutoDayType('2026-11-07', '6_hari'), 'biasa');
  assert.equal(detectAutoDayType('2026-11-08', '6_hari'), 'libur');
});

test('Perhitungan tarif lembur kategori Hari Libur / Istirahat (jenisHari: libur)', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: '5_hari',
    jenisHari: 'libur',
    liburResmi: false,
    jamLembur: 8,
  });

  assert.equal(result.jamLembur, 8);
  assert.equal(result.breakdown.length, 8);
  assert.equal(result.breakdown[0].multiplier, 2);
  assert.equal(result.breakdown[7].multiplier, 2);
  assert.ok(Math.abs(result.totalUpahLembur - 554913) <= 2);
});

test('Kasus Libur Nasional pada Hari Biasa (liburResmi: true) wajib menggunakan tarif libur (2x)', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: '5_hari',
    jenisHari: 'biasa',
    liburResmi: true,
    jamLembur: 1,
  });

  // Upah sejam = 34.682. Pada libur resmi jam ke-1 adalah 2x (bukan 1.5x) = 69.364
  assert.equal(result.breakdown[0].multiplier, 2);
  assert.ok(Math.abs(result.totalUpahLembur - 69364) <= 2, `Expected ~69364, got ${result.totalUpahLembur}`);
});

test('Kasus 6 hari kerja dengan Hari Libur Resmi jatuh pada Hari Terpendek (5 jam pertama 2x, jam 6: 3x)', () => {
  const result = calculateOvertime({
    gajiPokok: 6000000,
    tunjanganTetap: 0,
    sistem: '6_hari',
    jenisHari: 'libur',
    liburResmi: true,
    isHariTerpendek: true,
    jamLembur: 6,
  });

  assert.equal(result.breakdown[0].multiplier, 2);
  assert.equal(result.breakdown[4].multiplier, 2);
  assert.equal(result.breakdown[5].multiplier, 3);
});
