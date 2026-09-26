/* =====================================================================
   TILIK — Ajar Sesuai Tingkat (frontend, vanilla JS tanpa build step)
   ===================================================================== */
(() => {
  'use strict';

  // ------------------------------------------------------------------
  // Isi tes diagnostik (disusun sendiri, gaya ASER/TaRL)
  // ------------------------------------------------------------------
  const TEST = {
    literasi: {
      start: 'paragraf',
      nodes: {
        paragraf: { title: 'Membaca paragraf', ask: 'Minta siswa membaca paragraf ini dengan suara keras.', pass: 'Membaca dengan lancar, paling banyak 3 kesalahan.', yes: 'cerita', no: 'kata' },
        cerita: { title: 'Membaca cerita', ask: 'Minta siswa membaca cerita ini, lalu ajukan dua pertanyaan di bawah.', pass: 'Membaca dengan lancar dan menjawab minimal 1 pertanyaan dengan benar.', yes: 5, no: 4 },
        kata: { title: 'Membaca kata', ask: 'Minta siswa membaca kelima kata ini.', pass: 'Membaca minimal 4 dari 5 kata dengan benar.', yes: 3, no: 'huruf' },
        huruf: { title: 'Mengenal huruf', ask: 'Tunjuk huruf satu per satu dan minta siswa menyebutkannya.', pass: 'Mengenali minimal 4 dari 5 huruf.', yes: 2, no: 1 },
      },
      sets: [
        {
          huruf: ['m', 'a', 'k', 's', 'u'],
          kata: ['buku', 'sapi', 'meja', 'kaki', 'rumah'],
          paragraf: 'Rina pergi ke pasar bersama ibu. Mereka membeli sayur dan ikan. Pasar itu sangat ramai. Rina membawa keranjang kecil.',
          cerita: 'Pagi itu hujan turun deras. Doni lupa membawa payung. Ia menunggu di teras sekolah bersama temannya, Sari. Sari punya payung besar berwarna kuning. "Ayo, kita pulang bersama," kata Sari. Mereka berjalan pelan di bawah satu payung. Sesampainya di rumah, Doni mengucapkan terima kasih. Ibu Doni lalu memberi Sari segelas teh hangat.',
          questions: [['Mengapa Doni tidak bisa pulang sendiri?', 'Karena ia lupa membawa payung saat hujan deras.'], ['Apa yang diberikan ibu Doni kepada Sari?', 'Segelas teh hangat.']],
        },
        {
          huruf: ['r', 'e', 'b', 'l', 'o'],
          kata: ['bola', 'kursi', 'ikan', 'topi', 'daun'],
          paragraf: 'Ayah menanam pohon mangga di halaman. Setiap pagi Budi menyiram pohon itu. Sekarang pohonnya sudah tinggi. Buahnya manis sekali.',
          cerita: 'Nani memelihara seekor kucing bernama Belang. Suatu sore, Belang tidak pulang. Nani mencarinya di kebun dan di bawah rumah, tetapi tidak ketemu. Ia merasa sedih. Malam harinya, terdengar suara mengeong dari atas lemari dapur. Ternyata Belang tertidur di dalam kardus bekas. Nani tertawa lega dan memeluk kucingnya.',
          questions: [['Di mana saja Nani mencari Belang?', 'Di kebun dan di bawah rumah.'], ['Di mana Belang akhirnya ditemukan?', 'Di dalam kardus di atas lemari dapur.']],
        },
      ],
    },
    numerasi: {
      start: 'pengurangan',
      nodes: {
        pengurangan: { title: 'Pengurangan bersusun', ask: 'Minta siswa mengerjakan ketiga soal ini. Siswa boleh menulis di kertas.', pass: 'Benar minimal 2 dari 3 soal.', yes: 'pembagian', no: 'angka2' },
        pembagian: { title: 'Pembagian', ask: 'Minta siswa mengerjakan ketiga soal ini. Siswa boleh menulis di kertas.', pass: 'Benar minimal 2 dari 3 soal.', yes: 5, no: 4 },
        angka2: { title: 'Mengenal angka 10–99', ask: 'Tunjuk angka satu per satu dan minta siswa menyebutkannya.', pass: 'Menyebut minimal 4 dari 5 angka dengan benar.', yes: 3, no: 'angka1' },
        angka1: { title: 'Mengenal angka 1–9', ask: 'Tunjuk angka satu per satu dan minta siswa menyebutkannya.', pass: 'Menyebut minimal 4 dari 5 angka dengan benar.', yes: 2, no: 1 },
      },
      sets: [
        { angka1: ['3', '8', '1', '6', '9'], angka2: ['27', '84', '51', '39', '62'], pengurangan: [['52 − 27', 25], ['81 − 46', 35], ['70 − 38', 32]], pembagian: [['84 : 4', 21], ['96 : 3', 32], ['75 : 5', 15]] },
        { angka1: ['5', '2', '7', '4', '9'], angka2: ['43', '18', '95', '60', '76'], pengurangan: [['63 − 28', 35], ['90 − 54', 36], ['44 − 19', 25]], pembagian: [['68 : 2', 34], ['91 : 7', 13], ['72 : 6', 12]] },
      ],
    },
  };

  const ROLE_LABEL = { teacher: 'Guru', admin: 'Kepala sekolah' };

  // ------------------------------------------------------------------
  // Utilitas
  // ------------------------------------------------------------------
  const $app = document.getElementById('app');
  const $toast = document.getElementById('toast');
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toDate = (d) => new Date(String(d).length === 10 ? `${d}T00:00:00` : d);
  const fmtDate = (d, opts = { day: 'numeric', month: 'short' }) => (d ? toDate(d).toLocaleDateString('id-ID', opts) : '–');
  const fmtPct = (v) => (v === null || v === undefined ? '–' : `${String(v).replace('.', ',')}%`);
  const richText = (text) => {
    const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
    let html = ''; let inList = false;
    lines.forEach((line) => {
      const item = line.match(/^[-•*]\s+(.*)$/) || line.match(/^\d+[.)]\s+(.*)$/);
      if (item) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${esc(item[1].replace(/\*\*/g, ''))}</li>`; } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p>${esc(line.replace(/\*\*/g, '').replace(/^#+\s*/, ''))}</p>`;
      }
    });
    if (inList) html += '</ul>';
    return html;
  };
  const delta = (from, to) => {
    if (from === null || to === null || from === undefined || to === undefined) return '';
    const d = Math.round((to - from) * 10) / 10;
    if (!d) return '<span class="delta">tetap</span>';
    return `<span class="delta${d < 0 ? ' down' : ''}">${d > 0 ? 'naik' : 'turun'} ${String(Math.abs(d)).replace('.', ',')} poin</span>`;
  };

  let toastTimer;
  function toast(message, isError = false) {
    $toast.textContent = message;
    $toast.classList.toggle('error', isError);
    $toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $toast.hidden = true; }, 4000);
  }
  function setBusy(form, busy) {
    form.querySelectorAll('button, input, select, textarea').forEach((el) => { el.disabled = busy; });
  }
  function showFormError(form, message) {
    const el = form.querySelector('.form-error');
    if (el) { el.textContent = message; el.hidden = !message; }
  }

  // ------------------------------------------------------------------
  // Sesi & API
  // ------------------------------------------------------------------
  const SESSION_KEY = 'tilik_session_v3';
  const getSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } };
  const saveSession = (s) => localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  const clearSession = () => { localStorage.removeItem(SESSION_KEY); META = null; };

  async function refreshSession() {
    const s = getSession();
    if (!s?.refresh_token) return false;
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
      if (!res.ok) return false;
      saveSession({ ...s, ...(await res.json()) });
      return true;
    } catch { return false; }
  }

  async function api(path, { method = 'GET', body } = {}, retry = true) {
    const s = getSession();
    const headers = { 'Content-Type': 'application/json' };
    if (s?.access_token) headers.Authorization = `Bearer ${s.access_token}`;
    const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data = {};
    try { data = await res.json(); } catch { /* kosong */ }
    if (res.status === 401 && retry && !path.startsWith('/auth/login')) {
      if (await refreshSession()) return api(path, { method, body }, false);
      clearSession();
      location.hash = '#/masuk';
      throw new Error('Sesi berakhir. Silakan masuk lagi.');
    }
    if (!res.ok) {
      const err = new Error(data.error || 'Terjadi kesalahan. Coba lagi.');
      err.status = res.status; err.code = data.code;
      throw err;
    }
    return data;
  }

  let META = null;
  async function getMeta(force = false) {
    if (!META || force) META = await api('/meta');
    return META;
  }
  const levelOf = (subject, level) => META?.levels[subject].find((l) => l.level === level) || { level, name: `Tingkat ${level}`, desc: '' };

  // ------------------------------------------------------------------
  // Elemen visual
  // ------------------------------------------------------------------
  const sunMark = () => '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="17" r="8" fill="#F4B63F"/><path d="M0 21 Q8 17 16 20 T32 19 V32 H0Z" fill="#2F8A74"/></svg>';

  function authSky() {
    return `<svg class="sky" viewBox="0 0 400 170" aria-hidden="true">
      <g class="sun" style="transform: translateY(-66px)"><circle cx="200" cy="158" r="34"/></g>
      <path class="hill-back" d="M0 128 Q90 104 190 122 T400 112 V170 H0Z"/>
      <path class="hill-front" d="M0 146 Q120 126 230 142 T400 136 V170 H0Z"/></svg>`;
  }

  // Grafik batang bertumpuk: sebaran tingkat per putaran
  function progressChart(subject, perRound) {
    const rows = perRound.filter((r) => r.assessed > 0);
    if (!rows.length) return '<p class="empty">Belum ada hasil tes untuk ditampilkan.</p>';
    const bars = rows.map((r) => `
      <div class="pc-row">
        <div class="pc-label">${esc(r.name)}<small>${r.assessed} siswa dites</small></div>
        <div class="pc-bar" role="img" aria-label="${esc(r.name)}: ${r.counts.map((c, i) => `${c} siswa ${levelOf(subject, i + 1).name}`).join(', ')}">
          ${r.counts.map((c, i) => (c ? `<div class="pc-seg lv-${i + 1}" style="flex:${c}" title="${esc(levelOf(subject, i + 1).name)}: ${c} siswa">${c}</div>` : '')).join('')}
        </div>
        <div class="pc-pct">${fmtPct(r.pct_at_target)}<small>capai target</small></div>
      </div>`).join('');
    const legend = META.levels[subject].map((l) => `<span class="lv-${l.level}">${esc(l.name)}</span>`).join('');
    return `<figure class="progress-chart">${bars}<figcaption class="lv-legend">${legend}</figcaption></figure>`;
  }

  // Grafik tangga tingkat seorang siswa
  function stepChart(subject, points) {
    if (!points.length) return '<p class="empty">Belum pernah dites.</p>';
    const W = 420; const H = 170; const P = { l: 92, r: 16, t: 14, b: 28 };
    const n = points.length;
    const x = (i) => (n === 1 ? (P.l + W - P.r) / 2 : P.l + (i * (W - P.l - P.r)) / (n - 1));
    const y = (v) => P.t + ((5 - v) * (H - P.t - P.b)) / 4;
    const grid = META.levels[subject].map((l) => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(l.level)}" y2="${y(l.level)}"/><text x="${P.l - 8}" y="${y(l.level) + 4}" text-anchor="end">${esc(l.name)}</text>`).join('');
    const labels = points.map((p, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(p.label)}</text>`).join('');
    const line = n > 1 ? `<polyline points="${points.map((p, i) => `${x(i)},${y(p.level)}`).join(' ')}"/>` : '';
    const dots = points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.level)}" r="6" fill="var(--lv${p.level})"><title>${esc(p.label)}: ${esc(levelOf(subject, p.level).name)}</title></circle>`).join('');
    return `<figure class="step-chart chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Perkembangan tingkat ${esc(META.subject_label[subject])}"><g class="grid">${grid}</g>${labels}${line}${dots}</svg></figure>`;
  }

  // ------------------------------------------------------------------
  // Kerangka halaman
  // ------------------------------------------------------------------
  const homeFor = (p) => (p.role === 'admin' ? '#/sekolah' : '#/kelas');
  function navFor(role) {
    if (role === 'admin') return [['#/sekolah', 'Sekolah'], ['#/kelas', 'Kelas'], ['#/kelola', 'Kelola']];
    return [['#/kelas', 'Kelas saya']];
  }
  function renderShell(kind) {
    const s = getSession();
    if (!s) { $app.innerHTML = '<main id="view"></main>'; return document.getElementById('view'); }
    const current = location.hash.split('?')[0];
    const nav = navFor(s.profile.role).map(([href, label]) => {
      const active = current === href || current.startsWith(`${href}/`);
      return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
    }).join('');
    $app.innerHTML = `
      <header class="topbar">
        <a class="brand" href="${homeFor(s.profile)}">${sunMark()}Tilik</a>
        <nav class="nav" aria-label="Menu utama">${nav}</nav>
        <div class="who"><span>${esc(s.profile.full_name)} <span class="muted">(${ROLE_LABEL[s.profile.role]})</span></span>
          <button class="btn link" id="logout" type="button">Keluar</button></div>
      </header>
      <main id="view" class="view view-${kind}"><p class="loading">Memuat…</p></main>`;
    document.getElementById('logout').addEventListener('click', () => { clearSession(); location.hash = '#/masuk'; });
    return document.getElementById('view');
  }

  // ------------------------------------------------------------------
  // Masuk
  // ------------------------------------------------------------------
  const DEMO = [['guru4a@tilik.demo', 'Guru kelas 4A'], ['guru5a@tilik.demo', 'Guru kelas 5A'], ['kepsek@tilik.demo', 'Kepala sekolah']];

  function viewLogin(el) {
    el.outerHTML = `<div class="auth">
      <section class="auth-brand">
        <div class="auth-words">
          <h1 class="wordmark">Tilik</h1>
          <p>Ajar sesuai tingkat kemampuan siswa, bukan sekadar sesuai kelasnya.</p>
        </div>${authSky()}
      </section>
      <section class="auth-form">
        <form class="panel" id="login-form" novalidate>
          <h2 class="no-top">Masuk</h2>
          <label class="field">Email<input type="email" name="email" required autocomplete="email"></label>
          <label class="field">Kata sandi<input type="password" name="password" required autocomplete="current-password"></label>
          <p class="form-error" hidden></p>
          <div class="actions"><button class="btn primary" type="submit">Masuk</button></div>
          <p class="muted small">Akun guru dibuat oleh kepala sekolah.</p>
          <details class="demo"><summary>Akun demo untuk juri</summary>
            <ul>${DEMO.map(([email, label]) => `<li><span><strong>${label}</strong><br><span class="muted">${email}</span></span>
              <button type="button" class="btn ghost small" data-demo="${email}">Pakai</button></li>`).join('')}</ul>
            <p class="muted small">Kata sandi semua akun demo: tilik12345</p>
          </details>
        </form>
      </section></div>`;
    const form = document.getElementById('login-form');
    form.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => {
      form.email.value = b.dataset.demo; form.password.value = 'tilik12345';
      form.querySelector('[type="submit"]').focus();
    }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = { email: form.email.value.trim(), password: form.password.value };
      if (!body.email || !body.password) return showFormError(form, 'Isi email dan kata sandi.');
      setBusy(form, true);
      try {
        const data = await api('/auth/login', { method: 'POST', body });
        saveSession(data);
        location.hash = homeFor(data.profile);
      } catch (err) { showFormError(form, err.message); setBusy(form, false); }
    });
  }

  // ------------------------------------------------------------------
  // Daftar kelas
  // ------------------------------------------------------------------
  async function viewClasses(el) {
    await getMeta(true);
    const { classes, active_round } = await api('/classes');
    const metric = (c, subject) => {
      const s = c.subjects[subject];
      return `<dt>${esc(META.subject_label[subject])}</dt>
        <dd><span class="big-pct">${fmtPct(s.current_pct)}</span> <span class="muted small">capai target</span><br>
          ${s.baseline_pct !== null && s.baseline_round ? `<span class="small muted">Tes ${esc(s.baseline_round)}: ${fmtPct(s.baseline_pct)}</span> ${delta(s.baseline_pct, s.current_pct)}` : ''}</dd>`;
    };
    el.innerHTML = `
      <div class="head-row"><div><h1>Kelas</h1>
        <p class="muted">${active_round ? `Putaran tes aktif: <strong>${esc(active_round.name)}</strong>, mulai ${esc(fmtDate(active_round.started_on, { day: 'numeric', month: 'long' }))}.` : 'Belum ada putaran tes. Kepala sekolah perlu memulai putaran tes.'}</p></div></div>
      ${classes.length ? `<div class="class-grid">${classes.map((c) => `
        <article class="class-card">
          <h2>${esc(c.name)}</h2>
          <p class="muted small">Kelas ${c.grade}, ${c.total_students} siswa. Dites putaran ini: literasi ${c.subjects.literasi.assessed_this_round}, numerasi ${c.subjects.numerasi.assessed_this_round}.</p>
          <dl class="metric">${metric(c, 'literasi')}${metric(c, 'numerasi')}</dl>
          <div class="actions"><a class="btn primary" href="#/kelas/${c.id}">Lihat kelas</a><a class="btn ghost" href="#/kelas/${c.id}/tes">Mulai tes</a></div>
        </article>`).join('')}</div>`
    : '<p class="empty">Anda belum memegang kelas. Minta kepala sekolah menetapkan Anda sebagai guru kelas.</p>'}`;
  }

  // ------------------------------------------------------------------
  // Halaman kelas
  // ------------------------------------------------------------------
  async function viewClass(el, id, query) {
    await getMeta();
    const subject = query.get('mapel') === 'numerasi' ? 'numerasi' : 'literasi';
    const o = await api(`/classes/${id}`);
    const s = o.subjects[subject];
    const target = levelOf(subject, META.target_level);
    const stuckIds = new Set(s.stuck.map((x) => x.id));

    el.innerHTML = `
      <div class="head-row">
        <div><h1>Kelas ${esc(o.class.name)}</h1>
          <p class="muted">Kelas ${o.class.grade}, ${o.total_students} siswa. ${o.active_round ? `Putaran aktif: ${esc(o.active_round.name)}.` : ''}</p></div>
        <div class="actions" style="margin:0">
          <a class="btn primary" href="#/kelas/${id}/tes?mapel=${subject}">Mulai tes</a>
          <a class="btn ghost" href="#/kelas/${id}/siswa">Kelola siswa</a>
        </div>
      </div>
      <div class="tabs" role="group" aria-label="Mata uji">
        ${['literasi', 'numerasi'].map((m) => `<button type="button" data-mapel="${m}" aria-pressed="${m === subject}">${META.subject_label[m]}</button>`).join('')}
      </div>

      <p class="headline" style="margin-top:1.25rem">
        ${s.current_pct === null ? 'Belum ada hasil tes untuk mata uji ini.'
    : `<strong>${fmtPct(s.current_pct)}</strong> siswa sudah mencapai kemampuan dasar (tingkat ${esc(target.name)})${s.baseline_round && s.baseline_round !== s.latest_round ? `, dari ${fmtPct(s.baseline_pct)} pada tes ${esc(s.baseline_round)}` : ''}. ${s.improved} siswa sudah naik tingkat sejak tes pertama.`}
      </p>
      ${progressChart(subject, s.per_round)}

      <section class="ai-panel" style="margin-top:1.5rem">
        <div class="ai-head"><div><h2>Ringkasan asisten</h2>
          <p class="muted small">Membaca kemajuan literasi dan numerasi kelas ini. Nama siswa tidak dikirim ke AI.</p></div>
          <button class="btn ghost small" id="ai-summary" type="button">Buat ringkasan</button></div>
        <div id="ai-summary-body"></div>
      </section>

      <h2>Kelompok belajar sesuai tingkat</h2>
      <p class="muted">Kelompokkan siswa berdasarkan tingkat kemampuannya saat jam belajar ${esc(META.subject_label[subject].toLowerCase())}, lalu gunakan aktivitas yang sesuai untuk tiap kelompok.</p>
      <div class="groups">${s.groups.map((g) => {
    const info = levelOf(subject, g.level);
    return `<section class="group lv-${g.level}" data-level="${g.level}">
          <div class="group-head"><h3>Tingkat ${esc(info.name)} <span class="muted small">(${g.students.length} siswa)</span></h3><p>${esc(info.desc)}</p></div>
          ${g.students.length ? `<ul class="names">${g.students.map((st) => `<li><a href="#/siswa/${st.id}"${stuckIds.has(st.id) ? ' class="stuck" title="Belum naik tingkat dalam tiga tes terakhir"' : ''}>${esc(st.full_name)}</a></li>`).join('')}</ul>
            <div class="actions" style="margin-top:.75rem"><button class="btn ghost small" type="button" data-plan="${g.level}">Rencana aktivitas</button></div>
            <div class="plan" hidden></div>` : '<p class="muted small" style="margin:.5rem 0 0">Tidak ada siswa di tingkat ini.</p>'}
        </section>`;
  }).join('')}</div>

      <div class="two-col" style="margin-top:2rem">
        <section><h2 class="no-top">Perlu pendampingan</h2>
          <p class="muted small">Belum naik tingkat dalam tiga tes terakhir. Pertimbangkan pendampingan individual.</p>
          ${s.stuck.length ? `<ul class="plain-list">${s.stuck.map((x) => `<li><a href="#/siswa/${x.id}">${esc(x.full_name)}</a><span class="chip lv-${x.level}">${esc(levelOf(subject, x.level).name)}</span></li>`).join('')}</ul>` : '<p class="empty">Tidak ada. Semua siswa yang dites ulang menunjukkan kemajuan atau sudah mencapai target.</p>'}
        </section>
        <section><h2 class="no-top">Belum dites di ${esc(o.active_round?.name || 'putaran ini')}</h2>
          <p class="muted small">${s.not_assessed.length} siswa.</p>
          ${s.not_assessed.length ? `<ul class="plain-list">${s.not_assessed.map((x) => `<li><span>${esc(x.full_name)}</span><a class="btn ghost small" href="#/kelas/${id}/tes?mapel=${subject}&siswa=${x.id}">Tes sekarang</a></li>`).join('')}</ul>` : '<p class="empty">Semua siswa sudah dites pada putaran ini.</p>'}
        </section>
      </div>`;

    el.querySelectorAll('[data-mapel]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/kelas/${id}?mapel=${b.dataset.mapel}`; }));

    const aiBtn = el.querySelector('#ai-summary');
    aiBtn.addEventListener('click', async () => {
      const body = el.querySelector('#ai-summary-body');
      aiBtn.disabled = true;
      body.innerHTML = '<p class="muted">Menyusun ringkasan…</p>';
      try {
        const r = await api(`/classes/${id}/ai-summary`, { method: 'POST' });
        body.innerHTML = `${richText(r.text)}<p class="muted small">${r.mode === 'ai' ? 'Disusun asisten AI' : 'Disusun dari aturan bawaan karena asisten AI belum aktif'}.${r.note ? ` ${esc(r.note)}` : ''} Tinjau sebelum digunakan.</p>`;
        aiBtn.textContent = 'Perbarui ringkasan';
      } catch (err) { body.innerHTML = `<p class="form-error">${esc(err.message)}</p>`; }
      aiBtn.disabled = false;
    });

    el.querySelectorAll('[data-plan]').forEach((btn) => btn.addEventListener('click', () => {
      const group = btn.closest('.group');
      const box = group.querySelector('.plan');
      if (!box.hidden) { box.hidden = true; return; }
      box.hidden = false;
      box.innerHTML = `
        <form class="plan-form">
          <label>Durasi<select name="minutes"><option value="30">30 menit</option><option value="45" selected>45 menit</option><option value="60">60 menit</option></select></label>
          <label>Konteks sekolah <span class="muted">(opsional)</span><input name="context" maxlength="200" placeholder="Contoh: sekolah dekat pantai, banyak siswa anak nelayan"></label>
          <button class="btn primary small" type="submit">Susun rencana</button>
        </form>
        <div class="plan-output"></div>`;
      const form = box.querySelector('form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const out = box.querySelector('.plan-output');
        const fd = new FormData(form);
        setBusy(form, true);
        out.innerHTML = '<p class="muted">Menyusun rencana aktivitas…</p>';
        try {
          const r = await api('/activities/plan', { method: 'POST', body: { class_id: id, subject, level: Number(btn.dataset.plan), minutes: Number(fd.get('minutes')), context: fd.get('context') || null } });
          out.innerHTML = `${richText(r.text)}
            <p class="muted small">${r.mode === 'ai' ? 'Disusun asisten AI untuk kelompok ini' : 'Dari pustaka aktivitas bawaan Tilik'}.${r.note ? ` ${esc(r.note)}` : ''}</p>
            ${r.alternatives?.length ? `<details><summary>Aktivitas lain untuk tingkat ini</summary>${r.alternatives.map(richText).join('<hr>')}</details>` : ''}`;
        } catch (err) { out.innerHTML = `<p class="form-error">${esc(err.message)}</p>`; }
        setBusy(form, false);
      });
    }));
  }

  // ------------------------------------------------------------------
  // Tes diagnostik terpandu
  // ------------------------------------------------------------------
  async function viewTest(el, id, query) {
    await getMeta(true);
    let subject = query.get('mapel') === 'numerasi' ? 'numerasi' : 'literasi';
    const preselect = query.get('siswa');
    let o = await api(`/classes/${id}`);
    let state = null; // { student, node, path: [], set }

    const statusOf = (studentId) => o.subjects[subject].students.find((x) => x.student_id === studentId);
    const nextUntested = (afterId) => {
      const list = o.subjects[subject].students;
      const start = list.findIndex((x) => x.student_id === afterId);
      const ordered = [...list.slice(start + 1), ...list.slice(0, start + 1)];
      return ordered.find((x) => !x.assessed_this_round);
    };

    function renderRoster() {
      const list = o.subjects[subject].students;
      const done = list.filter((x) => x.assessed_this_round).length;
      return `<aside>
        <p class="muted small" style="margin:0 0 .5rem">${done} dari ${list.length} siswa sudah dites di ${esc(o.active_round?.name || '–')}.</p>
        <div class="roster plain-list">${list.map((x) => `
          <button type="button" data-student="${x.student_id}" aria-current="${state?.student.student_id === x.student_id}">
            <span>${esc(x.full_name)}</span>
            ${x.assessed_this_round ? `<span class="done">${esc(levelOf(subject, x.level).name)}</span>` : '<span class="todo">Belum</span>'}
          </button>`).join('')}</div>
      </aside>`;
    }

    function showContent(nodeId, set) {
      if (subject === 'literasi') {
        if (nodeId === 'huruf') return `<div class="tokens">${set.huruf.map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
        if (nodeId === 'kata') return `<div class="tokens small">${set.kata.map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
        if (nodeId === 'paragraf') return `<p class="reading">${esc(set.paragraf)}</p>`;
        return `<p class="reading">${esc(set.cerita)}</p>`;
      }
      if (nodeId === 'angka1' || nodeId === 'angka2') return `<div class="tokens">${set[nodeId].map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
      return `<div class="tokens small">${set[nodeId].map(([q]) => `<span>${esc(q)} =</span>`).join('')}</div>`;
    }

    function teacherExtra(nodeId, set) {
      if (subject === 'literasi' && nodeId === 'cerita') {
        return `<p><strong>Pertanyaan (bacakan setelah siswa selesai membaca):</strong></p><ol>${set.questions.map(([q, a]) => `<li>${esc(q)}<br><span class="muted small">Jawaban: ${esc(a)}</span></li>`).join('')}</ol>`;
      }
      if (subject === 'numerasi' && (nodeId === 'pengurangan' || nodeId === 'pembagian')) {
        return `<p class="small"><strong>Kunci:</strong> ${set[nodeId].map(([q, a]) => `${esc(q)} = ${a}`).join('; ')}</p>`;
      }
      return '';
    }

    function renderStage() {
      if (!o.active_round) return '<section class="stage"><h2 class="no-top">Belum ada putaran tes</h2><p>Minta kepala sekolah memulai putaran tes terlebih dahulu.</p></section>';
      if (!state) {
        return `<section class="stage"><h2 class="no-top">Pilih siswa</h2>
          <p>Pilih nama siswa di daftar untuk memulai tes ${esc(META.subject_label[subject].toLowerCase())}. Tes dilakukan satu per satu dan butuh sekitar 1–3 menit.</p>
          <p class="muted small">Tes dimulai dari soal tingkat menengah, lalu naik atau turun sesuai jawaban siswa, sehingga tidak semua soal perlu dikerjakan.</p></section>`;
      }
      const st = state.student;
      const prev = statusOf(st.student_id);
      if (typeof state.node === 'number') {
        const info = levelOf(subject, state.node);
        return `<section class="stage">
          <div class="stage-top"><h2 class="no-top">${esc(st.full_name)}</h2><span class="steps">Hasil tes ${esc(META.subject_label[subject].toLowerCase())}</span></div>
          <div class="lv-${info.level}"><span class="result-level">Tingkat ${esc(info.name)}</span></div>
          <p>${esc(info.desc)}.</p>
          ${prev?.level ? `<p class="muted small">Hasil sebelumnya: ${esc(levelOf(subject, prev.level).name)}.</p>` : ''}
          <form id="save-form">
            <label class="field">Catatan guru <span class="muted">(opsional)</span><input name="note" maxlength="300" placeholder="Contoh: sering tertukar huruf b dan d"></label>
            <p class="form-error" hidden></p>
            <div class="actions">
              <button class="btn primary" type="submit">Simpan dan lanjut</button>
              <button class="btn ghost" type="button" id="undo">Ulangi langkah terakhir</button>
            </div>
          </form></section>`;
      }
      const node = TEST[subject].nodes[state.node];
      return `<section class="stage">
        <div class="stage-top"><h2 class="no-top">${esc(st.full_name)}</h2><span class="steps">Langkah ${state.path.length + 1}: ${esc(node.title)}</span></div>
        <div class="teacher-note"><p><strong>Untuk guru:</strong> ${esc(node.ask)}</p><p class="small">Dianggap bisa jika: ${esc(node.pass)}</p>${teacherExtra(state.node, state.set)}</div>
        <div class="show-card" aria-label="Tunjukkan ke siswa">${showContent(state.node, state.set)}</div>
        <div class="decide">
          <button class="btn no" type="button" data-answer="no">Belum bisa</button>
          <button class="btn yes" type="button" data-answer="yes">Bisa</button>
        </div>
        <div class="actions">
          ${state.path.length ? '<button class="btn link" type="button" id="undo">Kembali ke langkah sebelumnya</button>' : ''}
          <button class="btn link" type="button" id="manual">Isi tingkat secara manual</button>
        </div></section>`;
    }

    function startFor(studentId) {
      const student = o.subjects[subject].students.find((x) => x.student_id === studentId);
      if (!student) return;
      const sets = TEST[subject].sets;
      state = { student, node: TEST[subject].start, path: [], set: sets[Math.floor(Math.random() * sets.length)] };
    }

    function render() {
      el.innerHTML = `
        <p><a href="#/kelas/${id}?mapel=${subject}">Kelas ${esc(o.class.name)}</a></p>
        <h1>Tes ${esc(META.subject_label[subject].toLowerCase())}</h1>
        <div class="tabs" role="group" aria-label="Mata uji" style="margin-bottom:1rem">${['literasi', 'numerasi'].map((m) => `<button type="button" data-mapel="${m}" aria-pressed="${m === subject}">${META.subject_label[m]}</button>`).join('')}</div>
        <div class="test-layout">${renderRoster()}<div id="stage">${renderStage()}</div></div>`;
      bind();
    }

    function bind() {
      el.querySelectorAll('[data-mapel]').forEach((b) => b.addEventListener('click', () => {
        subject = b.dataset.mapel; state = null; render();
      }));
      el.querySelectorAll('[data-student]').forEach((b) => b.addEventListener('click', () => {
        startFor(b.dataset.student); render();
        if (window.innerWidth < 900) window.scrollTo({ top: 0, behavior: 'smooth' });
      }));
      el.querySelectorAll('[data-answer]').forEach((b) => b.addEventListener('click', () => {
        const node = TEST[subject].nodes[state.node];
        state.path.push(state.node);
        state.node = b.dataset.answer === 'yes' ? node.yes : node.no;
        render();
      }));
      el.querySelector('#undo')?.addEventListener('click', () => {
        if (state.path.length) { state.node = state.path.pop(); render(); }
      });
      el.querySelector('#manual')?.addEventListener('click', () => {
        const stage = el.querySelector('#stage');
        stage.innerHTML = `<section class="stage"><h2 class="no-top">${esc(state.student.full_name)}</h2>
          <p>Pilih tingkat berdasarkan tes yang sudah Anda lakukan di luar aplikasi.</p>
          <div class="choices">${META.levels[subject].map((l) => `<label class="pick"><input type="radio" name="manual" value="${l.level}"><span>${esc(l.name)}</span></label>`).join('')}</div>
          <div class="actions"><button class="btn primary" type="button" id="manual-ok">Lanjut</button><button class="btn link" type="button" id="manual-cancel">Batal</button></div></section>`;
        stage.querySelector('#manual-ok').addEventListener('click', () => {
          const v = stage.querySelector('input[name="manual"]:checked');
          if (!v) return toast('Pilih salah satu tingkat.', true);
          state.path.push(state.node); state.node = Number(v.value); render();
        });
        stage.querySelector('#manual-cancel').addEventListener('click', render);
      });
      const form = el.querySelector('#save-form');
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        setBusy(form, true);
        try {
          const studentId = state.student.student_id;
          await api('/assessments', { method: 'POST', body: { student_id: studentId, subject, level: state.node, note: form.note.value || null } });
          toast(`Tersimpan: ${state.student.full_name}, tingkat ${levelOf(subject, state.node).name}.`);
          o = await api(`/classes/${id}`);
          const next = nextUntested(studentId);
          if (next) startFor(next.student_id); else { state = null; toast(`Semua siswa sudah dites ${META.subject_label[subject].toLowerCase()} di putaran ini.`); }
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) { showFormError(form, err.message); setBusy(form, false); }
      });
    }

    if (preselect) startFor(preselect);
    render();
  }

  // ------------------------------------------------------------------
  // Detail siswa
  // ------------------------------------------------------------------
  async function viewStudent(el, id) {
    await getMeta();
    const d = await api(`/students/${id}`);
    const roundName = new Map(d.rounds.map((r) => [r.id, r.name]));
    const order = new Map(d.rounds.map((r, i) => [r.id, i]));
    const bySubject = (subject) => d.assessments.filter((a) => a.subject === subject)
      .sort((a, b) => order.get(a.round_id) - order.get(b.round_id));

    el.innerHTML = `
      <p><a href="#/kelas/${d.class.id}">Kelas ${esc(d.class.name)}</a></p>
      <h1>${esc(d.student.full_name)}</h1>
      <p class="muted">Kelas ${d.class.grade}${d.student.active ? '' : ', tidak aktif'}.</p>
      <div class="two-col">${['literasi', 'numerasi'].map((subject) => {
    const rows = bySubject(subject);
    const last = rows[rows.length - 1];
    return `<section>
          <h2 class="no-top">${esc(META.subject_label[subject])}</h2>
          <p>${last ? `Tingkat saat ini: <span class="chip lv-${last.level}">${esc(levelOf(subject, last.level).name)}</span>${last.level >= META.target_level ? ' Sudah mencapai kemampuan dasar.' : ''}` : 'Belum pernah dites.'}</p>
          ${stepChart(subject, rows.map((a) => ({ label: roundName.get(a.round_id), level: a.level })))}
          ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Putaran</th><th>Tingkat</th><th>Catatan</th></tr></thead><tbody>
            ${rows.map((a) => `<tr><td>${esc(roundName.get(a.round_id))}<br><span class="muted small">${esc(fmtDate(a.assessed_on))}${a.assessed_by_name ? `, ${esc(a.assessed_by_name)}` : ''}</span></td>
              <td>${esc(levelOf(subject, a.level).name)}</td><td>${esc(a.note || '–')}</td></tr>`).join('')}</tbody></table></div>` : ''}
        </section>`;
  }).join('')}</div>`;
  }

  // ------------------------------------------------------------------
  // Kelola siswa di kelas
  // ------------------------------------------------------------------
  async function viewManageStudents(el, id) {
    await getMeta();
    const o = await api(`/classes/${id}`);
    const students = o.subjects.literasi.students;
    el.innerHTML = `
      <p><a href="#/kelas/${id}">Kelas ${esc(o.class.name)}</a></p>
      <h1>Siswa kelas ${esc(o.class.name)}</h1>
      <div class="two-col">
        <section>
          <h2 class="no-top">Daftar siswa (${students.length})</h2>
          ${students.length ? `<ul class="plain-list">${students.map((s) => `<li><a href="#/siswa/${s.student_id}">${esc(s.full_name)}</a>
            <button class="btn link" type="button" data-deactivate="${s.student_id}">Keluarkan dari kelas</button></li>`).join('')}</ul>` : '<p class="empty">Belum ada siswa.</p>'}
        </section>
        <section>
          <h2 class="no-top">Tambah siswa</h2>
          <form id="add-form" class="panel">
            <label class="field">Nama siswa, satu nama per baris<textarea name="names" rows="8" placeholder="Aditya Pratama&#10;Aisyah Putri"></textarea></label>
            <p class="form-error" hidden></p>
            <button class="btn primary" type="submit">Tambahkan</button>
          </form>
        </section>
      </div>`;
    const form = el.querySelector('#add-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setBusy(form, true);
      try {
        const r = await api(`/classes/${id}/students`, { method: 'POST', body: { names: form.names.value } });
        toast(`${r.students.length} siswa ditambahkan.`);
        viewManageStudents(el, id);
      } catch (err) { showFormError(form, err.message); setBusy(form, false); }
    });
    el.querySelectorAll('[data-deactivate]').forEach((b) => b.addEventListener('click', async () => {
      if (!window.confirm('Keluarkan siswa ini dari kelas? Riwayat tesnya tetap tersimpan.')) return;
      try {
        await api(`/students/${b.dataset.deactivate}`, { method: 'PATCH', body: { active: false } });
        toast('Siswa dikeluarkan dari kelas.');
        viewManageStudents(el, id);
      } catch (err) { toast(err.message, true); }
    }));
  }

  // ------------------------------------------------------------------
  // Dashboard kepala sekolah
  // ------------------------------------------------------------------
  async function viewSchool(el, query) {
    await getMeta(true);
    const subject = query.get('mapel') === 'numerasi' ? 'numerasi' : 'literasi';
    const d = await api('/admin/overview');
    const s = d.school?.subjects[subject];
    const ref = d.national_reference;
    const target = levelOf(subject, META.target_level);

    el.innerHTML = `
      <div class="head-row"><div><h1>Sekolah</h1>
        <p class="muted">${d.school ? `${d.school.total_students} siswa di ${d.classes.length} kelas.` : 'Belum ada kelas.'} ${d.rounds.length ? `Putaran aktif: ${esc(d.rounds[d.rounds.length - 1].name)}.` : ''}</p></div>
        <a class="btn ghost" href="#/kelola">Mulai putaran tes baru</a></div>
      <div class="tabs" role="group" aria-label="Mata uji">
        ${['literasi', 'numerasi'].map((m) => `<button type="button" data-mapel="${m}" aria-pressed="${m === subject}">${META.subject_label[m]}</button>`).join('')}
      </div>
      ${s ? `
        <p class="headline" style="margin-top:1.25rem"><strong>${fmtPct(s.current_pct)}</strong> siswa sudah mencapai kemampuan dasar ${esc(META.subject_label[subject].toLowerCase())} (tingkat ${esc(target.name)})${s.baseline_round ? `, dari ${fmtPct(s.baseline_pct)} pada tes ${esc(s.baseline_round)}` : ''}. ${s.improved} siswa naik tingkat, ${s.stuck} siswa perlu pendampingan.</p>
        ${progressChart(subject, s.per_round)}
        <p class="ref-note">Sebagai konteks: menurut ${esc(ref.source)}, ${fmtPct(ref[subject])} murid SD secara nasional mencapai kompetensi minimum ${esc(META.subject_label[subject].toLowerCase())}. ${esc(ref.note)}</p>` : ''}

      <h2>Per kelas</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Kelas</th><th>Guru</th><th class="num">Siswa</th><th class="num">Tes pertama</th><th class="num">Saat ini</th><th class="num">Dites putaran ini</th><th class="num">Perlu pendampingan</th></tr></thead>
        <tbody>${d.classes.map((c) => {
    const cs = c.subjects[subject];
    return `<tr><td><a href="#/kelas/${c.id}?mapel=${subject}">${esc(c.name)}</a></td><td>${esc(c.teacher_name || '–')}</td>
            <td class="num">${c.total_students}</td><td class="num">${fmtPct(cs.baseline_pct)}</td>
            <td class="num"><strong>${fmtPct(cs.current_pct)}</strong></td>
            <td class="num">${cs.assessed_this_round}/${c.total_students}</td><td class="num">${cs.stuck}</td></tr>`;
  }).join('') || '<tr><td colspan="7" class="muted">Belum ada kelas.</td></tr>'}</tbody>
      </table></div>`;
    el.querySelectorAll('[data-mapel]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/sekolah?mapel=${b.dataset.mapel}`; }));
  }

  // ------------------------------------------------------------------
  // Kelola (kepala sekolah)
  // ------------------------------------------------------------------
  async function viewManage(el) {
    const [{ rounds }, { classes }, { teachers }] = await Promise.all([api('/admin/rounds'), api('/admin/classes'), api('/admin/teachers')]);
    const teacherOptions = (selected) => `<option value="">Belum ada</option>${teachers.map((t) => `<option value="${t.id}"${t.id === selected ? ' selected' : ''}>${esc(t.full_name)}</option>`).join('')}`;
    el.innerHTML = `
      <h1>Kelola sekolah</h1>

      <h2>Putaran tes</h2>
      <p class="muted">Pendekatan ajar sesuai tingkat menganjurkan tes ulang sekitar tiap dua minggu, lalu kelompok disusun ulang. Hasil tes guru selalu tersimpan di putaran terbaru.</p>
      <div class="two-col">
        <ul class="plain-list">${rounds.map((r, i) => `<li><span><strong>${esc(r.name)}</strong>${i === 0 ? ' <span class="chip">aktif</span>' : ''}</span><span class="muted small">mulai ${esc(fmtDate(r.started_on, { day: 'numeric', month: 'long', year: 'numeric' }))}</span></li>`).join('') || '<li class="muted">Belum ada putaran.</li>'}</ul>
        <form id="round-form" class="panel">
          <label class="field">Nama putaran baru<input name="name" required maxlength="60" value="Putaran ${rounds.length + 1}"></label>
          <p class="form-error" hidden></p>
          <button class="btn primary" type="submit">Mulai putaran baru</button>
        </form>
      </div>

      <h2>Kelas</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Kelas</th><th class="num">Tingkat</th><th>Guru kelas</th><th class="num">Siswa</th></tr></thead>
        <tbody>${classes.map((c) => `<tr><td><a href="#/kelas/${c.id}">${esc(c.name)}</a></td><td class="num">${c.grade}</td>
          <td><label class="sr-only" for="t-${c.id}">Guru kelas ${esc(c.name)}</label><select id="t-${c.id}" data-class="${c.id}">${teacherOptions(c.teacher_id)}</select></td>
          <td class="num">${c.total_students}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Belum ada kelas.</td></tr>'}</tbody>
      </table></div>
      <form id="class-form" class="inline-form" style="margin-top:1rem">
        <label class="field">Nama kelas<input name="name" required placeholder="Contoh: 3B"></label>
        <label class="field">Tingkat<select name="grade">${[1, 2, 3, 4, 5, 6].map((g) => `<option value="${g}"${g === 3 ? ' selected' : ''}>Kelas ${g}</option>`).join('')}</select></label>
        <label class="field">Guru kelas<select name="teacher_id">${teacherOptions(null)}</select></label>
        <button class="btn primary" type="submit">Buat kelas</button>
      </form>

      <h2>Guru</h2>
      <ul class="plain-list">${teachers.map((t) => `<li><span>${esc(t.full_name)}</span><span class="muted small">${ROLE_LABEL[t.role]}</span></li>`).join('')}</ul>
      <form id="teacher-form" class="panel" style="margin-top:1rem">
        <h3 class="no-top">Tambah akun guru</h3>
        <div class="inline-form">
          <label class="field">Nama lengkap<input name="full_name" required></label>
          <label class="field">Email<input name="email" type="email" required></label>
          <label class="field">Kata sandi awal<input name="password" type="password" minlength="8" required></label>
        </div>
        <p class="form-error" hidden></p>
        <div class="actions"><button class="btn primary" type="submit">Buat akun</button></div>
      </form>`;

    const bindForm = (sel, path, bodyFn, msg) => {
      const form = el.querySelector(sel);
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setBusy(form, true);
        try { await api(path, { method: 'POST', body: bodyFn(new FormData(form)) }); toast(msg); viewManage(el); } catch (err) {
          if (form.querySelector('.form-error')) showFormError(form, err.message); else toast(err.message, true);
          setBusy(form, false);
        }
      });
    };
    bindForm('#round-form', '/admin/rounds', (fd) => ({ name: fd.get('name') }), 'Putaran baru dimulai. Guru bisa mulai tes ulang.');
    bindForm('#class-form', '/admin/classes', (fd) => ({ name: fd.get('name'), grade: Number(fd.get('grade')), teacher_id: fd.get('teacher_id') || null }), 'Kelas dibuat.');
    bindForm('#teacher-form', '/admin/teachers', (fd) => Object.fromEntries(fd), 'Akun guru dibuat.');
    el.querySelectorAll('[data-class]').forEach((sel) => sel.addEventListener('change', async () => {
      try { await api(`/admin/classes/${sel.dataset.class}`, { method: 'PATCH', body: { teacher_id: sel.value || null } }); toast('Guru kelas diperbarui.'); } catch (err) { toast(err.message, true); }
    }));
  }

  // ------------------------------------------------------------------
  // Router
  // ------------------------------------------------------------------
  const ALL = ['teacher', 'admin'];
  const routes = [
    [/^#\/masuk$/, viewLogin, 'guest'],
    [/^#\/kelas$/, viewClasses, ALL],
    [/^#\/kelas\/([\w-]+)$/, viewClass, ALL],
    [/^#\/kelas\/([\w-]+)\/tes$/, viewTest, ALL],
    [/^#\/kelas\/([\w-]+)\/siswa$/, viewManageStudents, ALL],
    [/^#\/siswa\/([\w-]+)$/, viewStudent, ALL],
    [/^#\/sekolah$/, viewSchool, ['admin']],
    [/^#\/kelola$/, viewManage, ['admin']],
  ];

  async function route() {
    const [path, qs = ''] = (location.hash || '').split('?');
    const session = getSession();
    const match = routes.find(([re]) => re.test(path));
    if (!match) { location.hash = session ? homeFor(session.profile) : '#/masuk'; return; }
    const [re, view, access] = match;
    if (access === 'guest' && session) { location.hash = homeFor(session.profile); return; }
    if (access !== 'guest' && !session) { location.hash = '#/masuk'; return; }
    if (access !== 'guest' && !access.includes(session.profile.role)) { location.hash = homeFor(session.profile); return; }

    const el = renderShell(access === 'guest' ? 'guest' : 'staff');
    const params = path.match(re).slice(1);
    try {
      await view(el, ...params, new URLSearchParams(qs));
      if (access !== 'guest') document.title = `Tilik — ${document.querySelector('#view h1')?.textContent || 'Ajar sesuai tingkat'}`;
      window.scrollTo(0, 0);
    } catch (err) {
      const target = document.getElementById('view') || $app;
      target.innerHTML = `<section class="panel"><h1>Halaman belum bisa dimuat</h1><p>${esc(err.message)}</p>
        <button class="btn primary" type="button" id="retry">Coba lagi</button></section>`;
      target.querySelector('#retry')?.addEventListener('click', route);
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
