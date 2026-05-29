const FIELDS = [
  'id',
  'brand',
  'model',
  'year',
  'type',
  'price',
  'imageUrl',
  'engineCc',
  'engineType',
  'horsepower',
  'torque',
  'transmission',
  'frontBrake',
  'rearBrake',
  'frontSuspension',
  'rearSuspension',
  'weightKg',
  'seatHeightMm',
  'fuelCapacityL',
  'description',
];

function escape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function motorcyclesToCsv(motorcycles) {
  const header = FIELDS.join(',');
  const rows = motorcycles.map((m) => FIELDS.map((f) => escape(m[f])).join(','));
  return [header, ...rows].join('\n');
}

export function downloadCsv(motorcycles, filename = 'motorcycles.csv') {
  const csv = motorcyclesToCsv(motorcycles);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
