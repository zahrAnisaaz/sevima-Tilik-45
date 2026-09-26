const TZ = 'Asia/Jakarta';

// Tanggal hari ini (WIB) dalam format YYYY-MM-DD
function todayJakarta() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function isWeekend(dateStr) {
  const day = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

function prevSchoolDay(dateStr) {
  let d = addDays(dateStr, -1);
  while (isWeekend(d)) d = addDays(d, -1);
  return d;
}

// `count` hari sekolah (Senin–Jumat) terakhir s.d. fromDate, urutan terbaru dulu
function previousSchoolDays(fromDate, count) {
  const out = [];
  let d = fromDate;
  while (out.length < count) {
    if (!isWeekend(d)) out.push(d);
    d = addDays(d, -1);
  }
  return out;
}

module.exports = { todayJakarta, addDays, isWeekend, prevSchoolDay, previousSchoolDays };
