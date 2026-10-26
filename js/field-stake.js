/* =========================================================
 * field-stake.js（第三版第 4 階段）— 試題五：單曲線中心樁之測設
 *
 * 流程（依應檢參考資料）：室內計算 40 分鐘（交卷後資料不得更改）
 *   → 實地測設 40 分鐘：於 S 點整置經緯儀、後視 F，測設 A 點與 P 點
 * 放樣步驟（依授課教師說明，以 A 點為例）：
 *   1. 儀器設定 φSF（HSET）並按 HOLD   2. 照準 F，解除 HOLD
 *   3. 轉動至讀數 φSA                    4. 小幫手持測針移至 SA 方位
 *   5. 小幫手蹲下                        6. 望遠鏡中指揮測針左右對準縱絲
 *   7. 測針固定                          8. 捲尺讀數端選定 SA 距離並固定於 S 點
 *   9. 小幫手沿測針方向拉直捲尺         10. 測針移到捲尺零端，打樁完成
 * ========================================================= */
(function (G) {
  'use strict';
  const S = G.SU, F = G.FORMS, esc = F.esc;
  const A = () => G.APP3, FI = () => G.FIELD._, TH = () => G.FIELD_THEO;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const K = 0.4;                         // 望遠鏡：每角秒 0.4 px
  const T_INDOOR = 40 * 60, T_FIELD = 40 * 60;

  /* ---------------- 場地 ---------------- */
  function makeScene() {
    const t = G.TASKS.find(x => x.id === 5);
    const r = t.random(), k = r.known;
    const sol = t.solve(A().makeV(Object.assign({}, k))).ans;
    const base = S.rand(20, 80);
    const pts = {
      S: { x: k.SE, y: k.SN, H: base + 0.02, label: 'S', kind: 'stake' },
      F: { x: k.FE, y: k.FN, H: base + S.rand(-0.15, 0.15), label: 'F', kind: 'stake', fixedTarget: true }
    };
    return {
      kind: 'stake', pts, stations: { S: { x: k.SE, y: k.SN, label: 'S 點（後視 F）' } },
      known: k, perfect: {}, override: {}, trueA: { x: sol.EA, y: sol.NA }, trueP: { x: sol.EP, y: sol.NP }, base,
      hint: '於 S 點整置，HSET 輸入 φSF 並按 HOLD，照準 F 後解除 HOLD；轉至 φSA，請小幫手持測針就位、蹲下，以望遠鏡指揮左右對準縱絲後固定；再以捲尺讀數端在 S 點選定 SA，小幫手將測針移到捲尺零端打樁。P 點同法。'
    };
  }

  /* ---------------- 進入、階段切換 ---------------- */
  const st = () => A().st, fs = () => st().field;
  function enter(t) {
    const app = A(), s = st();
    s.task = t; s.mode = 'field'; s.defs = app.buildDefs(t); s.labels = {}; s.guide = null;
    document.title = `${t.title}｜${app.MODES.field.name}`;
    const d = app.store.get(app.draftKey(), null);
    if (d && d.field && d.field.scene && d.field.scene.kind === 'stake') {
      s.field = d.field; s.vals = d.vals || {}; s.calcText = d.calcText || ''; s.submitted = !!d.submitted;
      s.sc = d.sc || { known: s.field.scene.known, obs: {}, source: 'field' };
      s.timer = { limit: s.field.phase === 'indoor' ? T_INDOOR : T_FIELD, remain: d.remain != null ? d.remain : T_INDOOR, running: false, h: null };
    } else {
      const scene = makeScene();
      s.field = { scene, phase: 'indoor', cur: null, az: 0, visited: [], setups: 0, aimed: null, ended: false, helper: null, placed: {}, point: null };
      s.vals = {}; s.calcText = ''; s.submitted = false;
      s.sc = { known: scene.known, obs: {}, source: 'field' };
      for (const k in s.defs) { const df = s.defs[k]; if (df.role === 'known' && k in scene.known) s.vals[k] = F.fmtVal(df, scene.known[k]); }
      s.timer = { limit: T_INDOOR, remain: T_INDOOR, running: false, h: null };
    }
    s.field.truth = G.FIELD.truthOf(t, s.field.scene);
    s.truth = s.field.truth;
    if (s.field.phase === 'indoor') indoorView();
    else if (s.field.phase === 'field') { FI().renderField(); if (!s.submitted) app.startTimer(); if (!s.field.cur) FI().openMap(true); }
    else { app.renderWork(); }
  }
  function indoorView() {
    const app = A(), s = st();
    app.renderWork();
    const sub = $('.bar h1 small'); if (sub) sub.textContent = '室內計算（40 分鐘）→ 交卷後進入實地測設';
    const note = $('.paper .note'); if (note) note.textContent = '室內計算：請依提供之數據計算切線長、A、P 點樁號與坐標，以及由 S 點（後視 F）測設 A、P 之方位角與水平距離。交卷後資料不得更改，並帶至實地測設使用。';
    // 本題沒有外業記錄表，移除空白的觀測記錄表頁
    $$('.paper').forEach(p => { if (/觀測記錄表/.test(p.querySelector('.paper-title')?.textContent || '') && !p.querySelector('table.f')) p.remove(); });
    const b = $('#btnSubmit'); b.textContent = '交卷（室內計算）'; b.disabled = false;
    b.onclick = () => { if (confirm('交卷後室內計算資料不得更改，並進入實地測設（40 分鐘），確定嗎？')) toField(); };
    if (!s.submitted) app.startTimer();
  }
  function toField() {
    const app = A(), s = st(), f = fs();
    app.stopTimer();
    f.phase = 'field';
    s.timer = { limit: T_FIELD, remain: T_FIELD, running: false, h: null };
    app.saveDraft();
    FI().renderField();
    app.startTimer();
    FI().openMap(true);
    app.toast('室內計算已交卷，進入實地測設（40 分鐘）');
  }
  /** 時間到：室內計算 → 自動進入實地測設（不交卷）；實地測設 → 計算放樣誤差後交卷 */
  function forceEnd() {
    const f = fs(); if (!f) return;
    if (f.phase === 'indoor') { A().toast('室內計算時間到，已自動交卷並進入實地測設'); toField(); return false; }
    if (f.phase === 'field') { finish(true); return false; }
  }
  function finish(auto) {
    const app = A(), s = st(), f = fs();
    if (!auto) {
      const done = ['A', 'P'].map(p => `${p} 點 ${f.placed[p] ? '已打樁' : '未打樁'}`).join('、');
      if (!confirm(`完成實地測設？（${done}）\n完成後將計算樁位誤差並產生評審表。`)) return;
    }
    FI().closeOverlays();
    const err = p => f.placed[p] ? Math.hypot(f.placed[p].x - f.scene['true' + p].x, f.placed[p].y - f.scene['true' + p].y) * 100 : NaN;
    s.vals.errA = isFinite(err('A')) ? S.fmtNum(err('A'), 1) : '';
    s.vals.errP = isFinite(err('P')) ? S.fmtNum(err('P'), 1) : '';
    f.phase = 'done'; f.ended = true;
    app.renderWork();
    app.submit(!!auto);
  }

  /* ---------------- 全景按鈕 ---------------- */
  function buttons() {
    return `<div class="stk-tools">
      <button class="btn" id="kScope">望遠鏡</button>
      <button class="btn" id="kHelper">小幫手持測針就位</button>
      <button class="btn" id="kTape">捲尺放樣</button>
      <button class="btn" id="kCard">放樣資料</button></div>`;
  }
  function bind() {
    $('#kScope').onclick = () => { if (!fs().cur) return A().toast('請先選擇測站並整置儀器'); scope(null); };
    $('#kHelper').onclick = helperPlace;
    $('#kTape').onclick = tapeStart;
    $('#kCard').onclick = card;
  }
  function card() {
    const s = st();
    const row = (l, k) => `<tr><td class="l">${l}</td><td>${esc(s.vals[k] || '（未填）')}</td></tr>`;
    $('#ovl').innerHTML = `<div class="ovl"><div class="ovl-box">
      <div class="ovl-h"><b class="serif">放樣答案（室內計算成果，不得更改）</b><button class="btn" data-close>關閉</button></div>
      <table class="f"><tbody>${row('方位角 φSF', 'phiSF')}${row('水平距離 SF', 'dSF')}${row('方位角 φSA', 'phiSA')}${row('水平距離 SA', 'dSA')}${row('方位角 φSP', 'phiSP')}${row('水平距離 SP', 'dSP')}</tbody></table>
      <p class="note">樁位：${['A', 'P'].map(p => `${p} 點 ${fs().placed[p] ? '✔ 已打樁' : '尚未打樁'}`).join('　')}</p></div></div>`;
    $('#ovl [data-close]').onclick = FI().closeOverlays;
  }

  /* ---------------- 全景中的物件 ---------------- */
  function panoTarget(p, id, x, yOf, gH, d, FOC) {
    const m = v => v / d * FOC;
    let g = '';
    if (p.fixedTarget) {
      // F 點：覘標架於鋼釘上
      const tip = yOf(p.H), tw = Math.max(8, m(0.1)), th = Math.max(8, m(0.09));
      g += `<line x1="${x}" y1="${tip - th}" x2="${x}" y2="${yOf(p.H + 1.4)}" stroke="#666" stroke-width="${Math.max(2, m(0.02))}"/>
        <path d="M${x - tw / 2} ${tip - th} L${x} ${tip - th} L${x} ${tip} Z" fill="#d32f2f"/><path d="M${x} ${tip - th} L${x + tw / 2} ${tip - th} L${x} ${tip} Z" fill="#fff" stroke="#d32f2f" stroke-width="0.8"/>`;
    }
    if (p.kind === 'helper') {
      const yb = yOf(gH), hs = (p.crouch ? 1.0 : 1.7) / d * FOC, hx = x + Math.max(10, m(0.35));
      g += `<g stroke="#2b3a55" stroke-width="${Math.max(1.6, hs / 30)}" fill="none"><circle cx="${hx}" cy="${yb - hs * 0.9}" r="${hs * 0.09}" fill="#f2c9a0"/>
        <line x1="${hx}" y1="${yb - hs * 0.8}" x2="${hx}" y2="${yb - hs * 0.4}"/><line x1="${hx}" y1="${yb - hs * 0.4}" x2="${hx - hs * 0.15}" y2="${yb}"/><line x1="${hx}" y1="${yb - hs * 0.4}" x2="${hx + hs * 0.15}" y2="${yb}"/>
        <line x1="${hx}" y1="${yb - hs * 0.7}" x2="${x}" y2="${yOf(gH + 0.3)}"/></g>`;
      g += pinSVG(x, yb, Math.max(2, m(0.012)), Math.max(10, m(0.32)));
    }
    if (p.kind === 'placed') g += `<rect x="${x - Math.max(3, m(0.02))}" y="${yOf(gH + 0.12)}" width="${Math.max(6, m(0.04))}" height="${Math.max(4, m(0.12))}" fill="#c8a165" stroke="#6b4f2a"/>`;
    return g;
  }
  function pinSVG(x, yb, w, h) {
    let g = `<rect x="${x - w / 2}" y="${yb - h}" width="${w}" height="${h}" fill="#fff" stroke="#333" stroke-width="0.6"/>`;
    for (let i = 0; i < 6; i += 2) g += `<rect x="${x - w / 2}" y="${yb - h + i * h / 6}" width="${w}" height="${h / 6}" fill="#e00"/>`;
    return g;
  }
  /** 把小幫手、已打樁的樁位放入場地點位（供全景繪製） */
  function syncPts() {
    const f = fs(), pts = f.scene.pts;
    delete pts.H; delete pts.setA; delete pts.setP;
    if (f.helper) pts.H = { x: f.helper.x, y: f.helper.y, H: f.scene.base, label: f.helper.fixed ? '測針（已固定）' : '小幫手', kind: 'helper', crouch: f.helper.crouch };
    for (const p of ['A', 'P']) if (f.placed[p]) pts['set' + p] = { x: f.placed[p].x, y: f.placed[p].y, H: f.scene.base + 0.1, label: `${p}（已打樁）`, kind: 'placed' };
  }

  /* ---------------- 小幫手 ---------------- */
  function helperPlace() {
    const f = fs(); if (!f.cur) return A().toast('請先選擇測站並整置儀器');
    const az = f.point ? f.point.az : f.az;
    $('#ovl').innerHTML = `<div class="ovl"><div class="ovl-box">
      <div class="ovl-h"><b>請小幫手持測針移至目前望遠鏡方向</b><button class="btn" data-close>取消</button></div>
      <p class="note">小幫手會走到望遠鏡目前所指的方向（約 ${S.fmtDMS(S.roundSec(az))} 方位，以目視大致判斷，會有些偏差）。請告訴小幫手大約距離：</p>
      <p>約 <input id="hDist" type="number" step="0.5" min="2" max="49" style="width:90px;font-size:16px;padding:4px"> m　<button class="btn primary" id="hGo">前往</button></p></div></div>`;
    $('#ovl [data-close]').onclick = FI().closeOverlays;
    $('#hGo').onclick = () => {
      const dist = Number($('#hDist').value);
      if (!(dist >= 2 && dist <= 49)) return A().toast('請輸入 2～49 m 之間的距離');
      const s0 = f.scene.stations.S;
      const pos = S.polar({ N: s0.y, E: s0.x }, az + S.rand(-0.5, 0.5), dist + S.rand(-0.3, 0.3));
      f.helper = { x: pos.E, y: pos.N, crouch: false, fixed: false };
      syncPts(); FI().closeOverlays(); FI().drawPano(); A().saveDraft();
      A().toast('小幫手已持測針就位，請請他蹲下後以望遠鏡指揮左右');
    };
  }
  /** 小幫手移動：左右（垂直於視線）或前後（沿 S→測針方向），單位 m */
  function moveHelper(lat, rad) {
    const f = fs(), h = f.helper, s0 = f.scene.stations.S;
    if (!h) return;
    const az = S.azimuth(s0.x, s0.y, h.x, h.y) * S.D2R;
    // 右方向＝方位角 +90°
    h.x += lat * Math.sin(az + Math.PI / 2) + rad * Math.sin(az);
    h.y += lat * Math.cos(az + Math.PI / 2) + rad * Math.cos(az);
    syncPts(); A().saveDraft();
  }

  /* ---------------- 望遠鏡（自由照準，含 HSET／HOLD） ---------------- */
  function dirTo(x, y, H) {
    const f = fs(), s0 = f.scene.stations.S;
    const d = Math.hypot(x - s0.x, y - s0.y);
    return { d, az: S.azimuth(s0.x, s0.y, x, y), Z: 90 - Math.atan2(H - f.cur.HI, d) * S.R2D };
  }
  function scope(id) {
    const f = fs(); if (!f.cur) return;
    if (id && f.scene.pts[id]) {
      const p = f.scene.pts[id], dd = dirTo(p.x, p.y, p.H);
      f.point = { az: dd.az + S.pick([-1, 1]) * S.rand(150, 400) / 3600, Z: dd.Z + S.pick([-1, 1]) * S.rand(100, 300) / 3600 };
    } else if (!f.point || Math.abs(S.wrap180(f.point.az - f.az)) > 20) f.point = { az: f.az, Z: 92 };
    if (f.cur.hold && f.cur.heldHR === undefined) f.cur.heldHR = 0;
    renderScope();
  }
  function curHR() {
    const c = fs().cur, az = fs().point.az;
    return S.roundSec(c.face === 'L' ? S.norm360(az - c.ori + c.c / 3600) : S.norm360(az - c.ori + 180 - c.c / 3600));
  }
  function curV() { const c = fs().cur, Z = fs().point.Z; return S.roundSec(S.norm360(c.face === 'L' ? Z + c.i / 3600 : 360 - Z + c.i / 3600)); }
  /** 轉動望遠鏡；HOLD 時度盤跟著轉，讀數不變 */
  function turn(dAz, dZ) {
    const f = fs(), c = f.cur;
    f.point.az = S.norm360(f.point.az + dAz / 3600); f.point.Z += dZ / 3600;
    if (c.hold) setHR(c.heldHR);
    f.az = f.point.az;
  }
  function setHR(val) {
    const f = fs(), c = f.cur, az = f.point.az;
    c.ori = c.face === 'L' ? az + c.c / 3600 - val : az + 180 - c.c / 3600 - val;
  }
  function renderScope() {
    const f = fs(), h = f.helper;
    $('#ovl').innerHTML = `<div class="ovl scope-ovl"><div class="scope-wrap">
      <div class="scope-h">經緯儀望遠鏡（S 點）　拖曳＝粗動，按鈕＝微動；大角度轉向請回全景轉動</div>
      <div class="scope-c" id="scopeC"></div>
      <div class="lcd" id="lcd"></div>
      <div class="scope-b">
        <span class="mv"><button class="btn" data-mv="-20,0">◀◀</button><button class="btn" data-mv="-1,0">◀</button><button class="btn" data-mv="1,0">▶</button><button class="btn" data-mv="20,0">▶▶</button></span>
        <span class="mv"><button class="btn" data-mv="0,-20">▲▲</button><button class="btn" data-mv="0,-1">▲</button><button class="btn" data-mv="0,1">▼</button><button class="btn" data-mv="0,20">▼▼</button></span>
      </div>
      <div class="scope-b"><button class="btn" id="kHset">HSET 輸入水平角</button><button class="btn${f.cur.hold ? ' warn' : ''}" id="kHold">${f.cur.hold ? 'HOLD 中（按此解除）' : 'HOLD'}</button>
        <button class="btn" id="kCard2">放樣資料</button><button class="btn primary" id="kBack">返回全景</button></div>
      ${h ? `<div class="scope-b helper-cmd"><b style="color:#fff">指揮小幫手：</b>
        <button class="btn" data-hl="-0.1">← 10cm</button><button class="btn" data-hl="-0.01">← 1cm</button><button class="btn" data-hl="-0.002">← 2mm</button>
        <button class="btn" data-hl="0.002">2mm →</button><button class="btn" data-hl="0.01">1cm →</button><button class="btn" data-hl="0.1">10cm →</button>
        <button class="btn" id="kCrouch">${h.crouch ? '請起立' : '請蹲下'}</button><button class="btn${h.fixed ? ' primary' : ''}" id="kFix">${h.fixed ? '已固定（拔起）' : '固定測針'}</button></div>` : ''}
      <div class="note scope-note">「←／→」為從望遠鏡看出去的左右。測針未蹲穩時會晃動；蹲下並對準縱絲後再固定。</div>
    </div></div>`;
    draw();
    const c = $('#scopeC'); let down = null;
    c.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, az: f.point.az, Z: f.point.Z, held: f.cur.heldHR }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', e => {
      if (!down) return;
      const k = 600 / c.getBoundingClientRect().width / K;
      f.point.az = down.az; f.point.Z = down.Z;
      turn(-(e.clientX - down.x) * k, -(e.clientY - down.y) * k);
      draw();
    });
    c.addEventListener('pointerup', () => { down = null; A().saveDraft(); });
    $$('[data-mv]').forEach(b => b.onclick = () => { const [dx, dy] = b.dataset.mv.split(',').map(Number); turn(dx, dy); draw(); A().saveDraft(); });
    $('#kHset').onclick = () => {
      const v = prompt('輸入水平角（度-分-秒，例 236-18-36）：');
      if (v === null) return;
      const p = S.parseDMS(v);
      if (!p.ok) return A().toast('角度格式錯誤，請用 度-分-秒');
      setHR(S.norm360(p.deg));
      if (f.cur.hold) f.cur.heldHR = S.norm360(p.deg);
      A().saveDraft(); draw(); A().toast(`水平角已設定為 ${S.fmtDMS(S.norm360(p.deg))}`);
    };
    $('#kHold').onclick = () => {
      f.cur.hold = !f.cur.hold;
      if (f.cur.hold) f.cur.heldHR = curHR(); else delete f.cur.heldHR;
      A().saveDraft(); renderScope();
    };
    $('#kCard2').onclick = card;
    $('#kBack').onclick = () => { FI().closeOverlays(); FI().drawPano(); FI().drawMini(); };
    if (h) {
      $$('[data-hl]').forEach(b => b.onclick = () => { if (h.fixed) return A().toast('測針已固定，請先拔起再移動'); moveHelper(Number(b.dataset.hl), 0); draw(); });
      $('#kCrouch').onclick = () => { h.crouch = !h.crouch; syncPts(); A().saveDraft(); renderScope(); };
      $('#kFix').onclick = () => {
        if (!h.fixed && !h.crouch) return A().toast('請先請小幫手蹲下，測針扶穩後再固定');
        h.fixed = !h.fixed; syncPts(); A().saveDraft(); renderScope();
        A().toast(h.fixed ? '測針已固定；接著用「捲尺放樣」量距' : '已拔起測針');
      };
    }
  }
  function draw() {
    const f = fs(), sc = f.scene, P0 = f.point;
    const X = (az) => 300 + S.wrap180(az - P0.az) * 3600 * K;
    const Y = (Z) => 300 + (Z - P0.Z) * 3600 * K;
    const yh = Y(90);
    let g = `<defs><clipPath id="kc"><circle cx="300" cy="300" r="292"/></clipPath>
      <radialGradient id="kv" cx="50%" cy="50%" r="50%"><stop offset="0.8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient></defs>
      <rect width="600" height="600" fill="#111"/><g clip-path="url(#kc)"><rect width="600" height="600" fill="#cfe1ef"/>
      <rect y="${Math.min(620, Math.max(-20, yh))}" width="600" height="${Math.max(0, 640 - yh)}" fill="#a9c58b"/>`;
    // 地面紋理（方便感受轉動）
    for (let i = -6; i <= 6; i++) { const az = Math.round(P0.az * 60) / 60 + i / 60; const x = X(az); g += `<line x1="${x}" y1="${Math.max(yh, 0)}" x2="${x}" y2="600" stroke="#9cb97f" stroke-width="1"/>`; }
    const items = [];
    const F0 = sc.pts.F; items.push({ ...dirTo(F0.x, F0.y, F0.H), kind: 'F' });
    if (f.helper) items.push({ ...dirTo(f.helper.x, f.helper.y, sc.base), kind: 'pin', h: f.helper });
    for (const p of ['A', 'P']) if (f.placed[p]) items.push({ ...dirTo(f.placed[p].x, f.placed[p].y, sc.base + 0.1), kind: 'stake', label: p });
    const edge = [];
    for (const it of items) {
      const x = X(it.az), y = Y(it.Z), m = v => v / it.d * S.RHO * K;
      // 視野外：在邊緣以箭頭提示方向
      if (x < 15 || x > 585 || y < 15 || y > 585) { if (Math.abs(S.wrap180(it.az - P0.az)) < 20) edge.push({ x, y, label: it.kind === 'F' ? 'F 覘標' : it.kind === 'pin' ? '測針' : it.label + ' 樁' }); }
      if (x < -400 || x > 1000) continue;
      if (it.kind === 'F') {
        const tw = m(0.08), th = m(0.07);
        g += `<rect x="${x - m(0.018)}" y="${y + m(0.006)}" width="${m(0.036)}" height="${m(0.3)}" fill="#c8a165" stroke="#6b4f2a"/>
          <line x1="${x}" y1="${y - th}" x2="${x}" y2="${y - th - m(1.2)}" stroke="#666" stroke-width="${Math.max(2, m(0.02))}"/>
          <path d="M${x - tw / 2} ${y - th} L${x} ${y - th} L${x} ${y} Z" fill="#d32f2f"/><path d="M${x} ${y - th} L${x + tw / 2} ${y - th} L${x} ${y} Z" fill="#fff" stroke="#d32f2f"/>`;
      } else if (it.kind === 'pin') {
        // 未固定且未蹲下時測針晃動
        const sway = it.h.fixed ? 0 : (it.h.crouch ? S.rand(-0.0015, 0.0015) : S.rand(-0.02, 0.02));
        const xs = x + m(sway);
        if (!it.h.fixed) g += `<path d="M${xs + m(0.06)} ${y - m(0.25)} q ${m(0.1)} ${m(0.02)} ${m(0.25)} ${m(0.1)}" stroke="#f2c9a0" stroke-width="${m(0.05)}" fill="none" stroke-linecap="round"/>`;
        g += pinSVG(xs, y, m(0.012), m(0.32));
      } else {
        g += `<rect x="${x - m(0.02)}" y="${y - m(0.12)}" width="${m(0.04)}" height="${m(0.3)}" fill="#c8a165" stroke="#6b4f2a"/><text x="${x + m(0.04)}" y="${y - m(0.14)}" font-size="16" fill="#333">${it.label}</text>`;
      }
    }
    g += `<circle cx="300" cy="300" r="300" fill="url(#kv)"/></g>
      <g stroke="#111" stroke-width="1.2"><line x1="300" y1="8" x2="300" y2="592"/><line x1="8" y1="300" x2="592" y2="300"/><line x1="294" y1="8" x2="294" y2="220"/><line x1="306" y1="8" x2="306" y2="220"/></g>`;
    for (const e of edge) {
      const a = Math.atan2(e.y - 300, e.x - 300), ex = 300 + 255 * Math.cos(a), ey = 300 + 255 * Math.sin(a);
      g += `<g transform="translate(${ex},${ey}) rotate(${a * S.R2D})"><path d="M14 0 L-6 -10 L-6 10 Z" fill="#ffd400" stroke="#111"/></g>
        <text x="${ex - 22 * Math.cos(a)}" y="${ey - 22 * Math.sin(a) + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#111" stroke="#fff" stroke-width="3" paint-order="stroke">${e.label}</text>`;
    }
    g += `
      <circle cx="300" cy="300" r="292" fill="none" stroke="#000" stroke-width="10"/>`;
    $('#scopeC').innerHTML = `<svg viewBox="0 0 600 600" width="100%" height="100%">${g}</svg>`;
    const c = f.cur;
    $('#lcd').innerHTML = `<div class="lcd-in"><span class="lcd-face">${c.hold ? 'HOLD' : (c.face === 'L' ? '正鏡' : '倒鏡')}</span>
      <div><b>V</b>　${S.fmtDMS(curV())}</div><div><b>HR</b>　${S.fmtDMS(c.hold ? c.heldHR : curHR())}</div></div>`;
  }

  /* ---------------- 捲尺放樣 ---------------- */
  let tp = null;
  function tapeStart() {
    const f = fs();
    if (!f.helper || !f.helper.fixed) return A().toast('請先以望遠鏡指揮測針對準方向並固定後，再以捲尺量距');
    const s0 = f.scene.stations.S, dist = Math.hypot(f.helper.x - s0.x, f.helper.y - s0.y);
    tp = { tS: Math.round(dist) + S.rand(-0.4, 0.4), step: 'S' };
    tapeS();
  }
  function tapeS() {
    $('#ovl').innerHTML = `<div class="ovl"><div class="ovl-box tape-box">
      <div class="ovl-h"><b>步驟一：讀數端固定於 S 點</b><button class="btn" data-close>取消</button></div>
      <p class="note">你蹲在 S 點，移動捲尺使 <b>S 點鋼釘中心</b> 對準所需的放樣距離（例如 SA），確認讀數後按「固定於 S 點」。</p>
      <div class="tape-c" id="tpC">${TH().tapeSVG(tp.tS, { marks: [{ val: tp.tS, kind: 'nail' }] })}</div>
      <div class="scope-b" style="margin-top:8px">移動捲尺：
        <button class="btn" data-ts="-1">−1m</button><button class="btn" data-ts="-0.1">−10cm</button><button class="btn" data-ts="-0.01">−1cm</button><button class="btn" data-ts="-0.001">−1mm</button>
        <button class="btn" data-ts="0.001">+1mm</button><button class="btn" data-ts="0.01">+1cm</button><button class="btn" data-ts="0.1">+10cm</button><button class="btn" data-ts="1">+1m</button></div>
      <div style="text-align:right;margin-top:10px"><button class="btn" id="tpCard">放樣資料</button> <button class="btn primary" id="tpFix">固定於 S 點</button></div></div></div>`;
    $('#ovl [data-close]').onclick = FI().closeOverlays;
    $$('[data-ts]').forEach(b => b.onclick = () => { tp.tS = Math.max(0.5, Math.min(49.5, S.rnd(tp.tS + Number(b.dataset.ts), 4))); $('#tpC').innerHTML = TH().tapeSVG(tp.tS, { marks: [{ val: tp.tS, kind: 'nail' }] }); });
    $('#tpCard').onclick = () => { card(); setTimeout(() => { $('#ovl [data-close]').onclick = tapeS; }, 0); };
    $('#tpFix').onclick = tapeZero;
  }
  function tapeZero() {
    const f = fs();
    const s0 = f.scene.stations.S;
    const val = () => tp.tS - Math.hypot(f.helper.x - s0.x, f.helper.y - s0.y);  // 測針處的捲尺讀數
    const render = () => {
      const v = val();
      const off = Math.abs(v) > 0.06 ? `<p class="note" style="color:#c62828">測針在畫面外：距捲尺零端 ${S.fmtNum(Math.abs(v) * 100, 0)} cm（${v > 0 ? '零端在測針前方，請往前' : '測針超過零端，請往後'}）</p>` : '';
      $('#tzC').innerHTML = TH().tapeSVG(0.025, { zeroEnd: true, marks: Math.abs(v) <= 0.07 ? [{ val: v, kind: 'pin' }] : [] }) + off;
    };
    $('#ovl').innerHTML = `<div class="ovl"><div class="ovl-box tape-box">
      <div class="ovl-h"><b>步驟二：測針移到捲尺零端</b><button class="btn" id="tzBack">回步驟一</button></div>
      <p class="note">小幫手沿測針方向拉直捲尺（讀數端已固定在 S 點），請指揮小幫手前後移動測針，使測針中心對準捲尺 <b>0</b>，再打樁。</p>
      <div class="tape-c" id="tzC"></div>
      <div class="scope-b" style="margin-top:8px">測針：
        <button class="btn" data-tr="-0.1">往後 10cm</button><button class="btn" data-tr="-0.01">往後 1cm</button><button class="btn" data-tr="-0.002">往後 2mm</button>
        <button class="btn" data-tr="0.002">往前 2mm</button><button class="btn" data-tr="0.01">往前 1cm</button><button class="btn" data-tr="0.1">往前 10cm</button></div>
      <p class="note">「往前」＝遠離 S 點；「往後」＝靠近 S 點。</p>
      <div style="text-align:right;margin-top:10px"><button class="btn primary" id="tzDone">對準零端，打樁</button></div></div></div>`;
    render();
    $('#tzBack').onclick = tapeS;
    $$('[data-tr]').forEach(b => b.onclick = () => { moveHelper(0, Number(b.dataset.tr)); render(); });
    $('#tzDone').onclick = () => {
      $('#ovl').innerHTML = `<div class="ovl"><div class="ovl-box"><div class="ovl-h"><b>此樁為哪一點？</b></div>
        <div style="display:flex;gap:8px"><button class="btn primary" data-pp="A">A 點（曲線起點 B.C.）</button><button class="btn primary" data-pp="P">P 點（第一個副樁）</button><button class="btn" data-pp="">取消</button></div></div></div>`;
      $$('[data-pp]').forEach(b => b.onclick = () => {
        const p = b.dataset.pp; if (!p) return tapeZero();
        f.placed[p] = { x: f.helper.x, y: f.helper.y };
        f.helper = null; syncPts(); A().saveDraft();
        FI().closeOverlays(); FI().drawPano();
        A().toast(`${p} 點已打樁。${f.placed.A && f.placed.P ? '兩點均已完成，可按右上「完成實地測設」。' : '請繼續測設另一點。'}`);
      });
    };
  }

  G.FIELD_STAKE = { enter, forceEnd, finish, buttons, bind, card, panoTarget, scope, makeScene, _: { moveHelper, setHR, turn, curHR, syncPts, dirTo } };
})(window);
