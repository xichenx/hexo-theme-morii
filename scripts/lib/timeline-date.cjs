'use strict';

function timelineDate(value) {
  const date = value instanceof Date && Number.isFinite(value.getTime())
    ? value.toISOString().slice(0, 10)
    : typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
  if (!/^\d{4}-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/.test(date) || date.startsWith('0000-')) return { date, datetime: '' };
  const day = date.length === 7 ? date + '-01' : date;
  const parsed = new Date(day + 'T00:00:00Z');
  return { date, datetime: Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day ? date : '' };
}

module.exports = { timelineDate };
