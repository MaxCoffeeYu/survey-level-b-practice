/* =========================================================
 * field.js（第三版第 2 階段）— 第一人稱外業：水準類（試題六～十）
 *
 * 場地依應檢參考資料「場地佈設」配置，每次隨機產生真實高程。
 * 流程：選測站 → 整置（勾選提醒）→ 全景（拖曳轉向）→ 點選樁位
 *       → 望遠鏡（E 型尺，自行判讀上、中、下絲）→ 記錄本（原格式記錄表）
 *       → 結束外業 → 發給已知資料 → 內業計算 → 交卷（與真值比對評分）
 * ========================================================= */
(function (G) {
  'use strict';
  const S = G.SU, F = G.FORMS, LK = G.LK, esc = F.esc;
  const A = () => G.APP3;
  const TH = () => G.FIELD_THEO;  // 經緯儀類（試題一～四）擴充模組
  const SK = () => G.FIELD_STAKE; // 單曲線放樣（試題五）擴充模組
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const SUPPORT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const ROD_LEN = 4.0;          // 水準尺長（m）
  const ROD_W = 0.077;          // 尺面寬（m，依教具比例）
  const MAX_SIGHT = 80;         // 超過此距離無法清楚讀尺
  const FOV = 64;               // 全景水平視角（度）
  const SCOPE_V = 0.016;        // 望遠鏡視野：距離 d 時可見尺面高度 = d × 0.016（m）
  const STADIA_PX = 600 * (1 / 200) / SCOPE_V;  // 上、下絲距中絲（視距乘常數 100）

  /* ---------------- 場地產生 ---------------- */
  const r3 = x => S.rnd(x, 3);
  const P = (x, y, H, label, kind = 'stake') => ({ x, y, H, label, kind });
  const ST = (x, y, label) => ({ x, y, label });

  /** 依樁位高程以反距離加權推估任意位置地面高程（供測站地面與繪圖） */
  function terrain(sc, x, y) {
    let sw = 0, sh = 0;
    for (const id in sc.pts) {
      const p = sc.pts[id]; const g = (p.Hf ?? p.H) - (p.kind === 'tp' ? 0.02 : 0.03);
      const d2 = (p.x - x) ** 2 + (p.y - y) ** 2 + 4;
      sw += 1 / d2; sh += g / d2;
    }
    return sh / sw;
  }

  const SCENES = {
    /* 試題六：A、B、C、D 一直線各 25m；E、G 相距 90～120m */
    6() {
      const base = S.rand(30, 80);
      const pts = {
        A: P(0, 0, base + S.rand(-0.3, 0.3), 'A'), B: P(25, 0, base + S.rand(-0.3, 0.3), 'B'),
        C: P(50, 0, base + S.rand(-0.3, 0.3), 'C'), D: P(75, 0, base + S.rand(-0.3, 0.3), 'D')
      };
      const eg = S.rand(95, 115), HE = base + S.rand(-1, 1), HF = HE + S.rand(-1.1, 1.1), HG = HF + S.rand(-1.1, 1.1);
      const fx = eg * S.rand(0.42, 0.58);
      Object.assign(pts, { E: P(0, 45, HE, 'E'), F: P(fx, 49, HF, 'F'), G: P(eg, 45, HG, 'G') });
      const stations = {
        A: ST(-0.8, -0.6, 'A 點（於 A 點整置）'), D: ST(75.8, -0.6, 'D 點（於 D 點整置）'),
        p: ST(fx * S.rand(0.42, 0.58), 52, 'p（E、F 之間）'), q: ST(fx + (eg - fx) * S.rand(0.42, 0.58), 52, 'q（F、G 之間）')
      };
      const x = S.pick([1, -1]) * S.randInt(30, 65);
      const sc = { pts, stations, x, inst: S.randInt(1, 6) };
      sc.known = { HE: r3(HE), HG: r3(HG), d0: 25, instNo: sc.inst };
      const Hb = pts.B.H, Hc = pts.C.H;
      sc.perfect = { A_B: 1.5, A_C: 1.5 + Hb - Hc, D_B: 1.4, D_C: 1.4 + Hb - Hc, pEm: 1.5, pEu: 1.6, pEl: 1.4, pFm: 1.5 + HE - HF, pFu: 1.6 + HE - HF, pFl: 1.4 + HE - HF, qFm: 1.5, qFu: 1.6, qFl: 1.4, qGm: 1.5 + HF - HG, qGu: 1.6 + HF - HG, qGl: 1.4 + HF - HG };
      sc.override = { x, HF: r3(HF), h1: r3(HF - HE), h2: r3(HG - HF) };
      sc.hint = '先於 A 點、D 點整置，各讀 B、C 兩尺（木樁校正法）；再分別於 p、q 整置讀 E、F 與 F、G 之上、中、下絲。';
      return sc;
    },

    /* 試題七：閉合路線約 100m × 50m，往返各 6 站、5 個轉點；間視 B、C、D、E */
    7() {
      const HA = S.rand(20, 90);
      const pts = {
        A: P(0, 0, HA, 'A'),
        B: P(28, 58, HA + S.rand(-0.45, 0.45), 'B'),
        D: P(52, -7, HA + S.rand(-0.45, 0.45), 'D'), E: P(8, -7, HA + S.rand(-0.45, 0.45), 'E')
      };
      pts.C = P(30.6, 58.6, pts.B.H + S.rand(-0.15, 0.15), 'C');
      const spots = [[0, 50], [60, 50], [100, 22], [62, 0], [26, 0]];
      spots.forEach(([x, y], i) => {
        const g = HA + S.rand(-0.5, 0.5);
        pts['S' + (i + 1)] = { x, y, kind: 'tp', Hf: g + 0.02, Hb: g + 0.02 + S.rand(-0.006, 0.006), H: g + 0.02, label: `TP${i + 1} (TP${5 - i}')`, fwd: `TP${i + 1}`, bwd: `TP${5 - i}'` };
      });
      const stations = {
        s1: ST(-3, 25, "測站1 (6')"), s2: ST(30, 53, "測站2 (5')"), s3: ST(82, 38, "測站3 (4')"),
        s4: ST(82, 9, "測站4 (3')"), s5: ST(44, -3, "測站5 (2')"), s6: ST(13, -3, "測站6 (1')")
      };
      const sc = { pts, stations, x: S.randInt(-6, 6), phases: true };
      sc.known = { HA: r3(HA) };
      const t = G.TASKS.find(q => q.id === 7);
      const Hf = { A: HA, B: pts.B.H, C: pts.C.H, D: pts.D.H, E: pts.E.H }, Hb = Object.assign({}, Hf);
      for (let i = 1; i <= 5; i++) { Hf['TP' + i] = pts['S' + i].Hf; Hb[`TP${6 - i}'`] = pts['S' + i].Hb; }
      sc.perfect = Object.assign(LK.simulate('f', t.__seq.f, Hf, 0).obsPerfect, LK.simulate('b', t.__seq.b, Hb, 0).obsPerfect);
      sc.override = {};
      ['B', 'C', 'D', 'E'].forEach(p => {
        const fi = t.__seq.f.findIndex(r => r.pt === p && r.ty === 'is'), bi = t.__seq.b.findIndex(r => r.pt === p && r.ty === 'is');
        sc.override['H' + p] = sc.override[`f${fi}_Ha`] = sc.override[`b${bi}_Ha`] = r3(pts[p].H);
      });
      sc.hint = '往測：測站1→6 依序（測站2 觀測間視 B、C，測站5 觀測 D，測站6 觀測 E）。返測切換為「返測」後由測站6(1\')開始。返測時轉點尺墊重新擺置。';
      return sc;
    },

    /* 試題八：A、B、C、D 中心樁，往測 A→D、返測 D→A */
    8() {
      const dAB = S.randInt(3, 5) * 10, dBC = S.randInt(3, 5) * 10, dCD = S.randInt(3, 5) * 10;
      const g = S.pick([-1.5, -1.2, -1, -0.8, -0.5, 0.5, 0.8, 1, 1.2, 1.5]);
      const HA = S.rand(20, 120), cutA = r3(S.rand(0.2, 0.6));
      const HpA = HA - cutA, HpB = HpA + g / 100 * dAB, HpC = HpB + g / 100 * dBC, HpD = HpC + g / 100 * dCD;
      const xs = [0, dAB, dAB + dBC, dAB + dBC + dCD];
      const H = [HA, HpB + S.rand(0.1, 0.5), HpC - S.rand(0.1, 0.5), HpD - S.rand(0.1, 0.6)];
      const pts = {}; ['A', 'B', 'C', 'D'].forEach((p, i) => pts[p] = P(xs[i], 0, H[i], p));
      const stations = {
        s1: ST(xs[1] / 2, 3, 'A、B 之間'), s2: ST((xs[1] + xs[2]) / 2, 3, 'B、C 之間'), s3: ST((xs[2] + xs[3]) / 2, 3, 'C、D 之間')
      };
      const staA = S.randInt(0, 3) * 1000 + S.pick([0, 100, 200, 500]);
      const sc = { pts, stations, x: S.randInt(-6, 6) };
      sc.known = { staA0: staA, HA: r3(HA), dAB, dBC, dCD, cutA0: cutA, g };
      const t = G.TASKS.find(q => q.id === 8);
      sc.perfect = LK.simulate('r', t.__seq, { A: HA, B: H[1], C: H[2], D: H[3] }, 0).obsPerfect;
      sc.override = { HB: r3(H[1]), HC: r3(H[2]), HD: r3(H[3]) };
      sc.hint = '往測：A、B 間 → B、C 間 → C、D 間依次設站；返測：C、D 間 → B、C 間 → A、B 間（每次重新整置）。';
      return sc;
    },

    /* 試題九：A～G 間距 20m；P 點觀測 A～D，Q 點觀測 D～G */
    9() {
      const HA = S.rand(20, 120);
      const H = [HA]; for (let i = 1; i < 7; i++) H.push(H[i - 1] + S.rand(-0.12, 0.12));
      const pts = {}; ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((p, i) => pts[p] = P(i * 20, 0, H[i], p));
      const stations = { P: ST(31, 4, 'P（觀測 A～D）'), Q: ST(89, 4, 'Q（觀測 D～G）') };
      const G1 = S.pick([-1.2, -0.9, -0.7, -0.5, 0.5, 0.7, 0.9, 1.2]);
      let G2 = S.pick([-1.2, -0.9, -0.6, -0.4, 0.4, 0.6, 0.9, 1.2]); if (G2 === G1) G2 = -G1;
      const sc = { pts, stations, x: S.randInt(-6, 6) };
      sc.known = { HA: r3(HA), HG: r3(H[6]), HpA: r3(HA + S.rand(-0.2, 0.2)), G1, G2, Lv: 120, staA: 1000, sp: 20 };
      const HI1 = H[0] + 1.5, HI2 = H[3] + 1.5;
      sc.perfect = { bsA: 1.5, isB: HI1 - H[1], isC: HI1 - H[2], fsD: HI1 - H[3], bsD: 1.5, isE: HI2 - H[4], isF: HI2 - H[5], fsG: HI2 - H[6] };
      sc.override = {}; ['B', 'C', 'D', 'E', 'F'].forEach((p, i) => sc.override['H' + p] = r3(H[i + 1]));
      sc.hint = '於 P 點設站：後視 A、間視 B、C、前視 D；再於 Q 點設站：後視 D、間視 E、F、前視 G。';
      return sc;
    },

    /* 試題十：A、B 相距約 120m，往返各經一轉點；由 B 測定 C～O 方格點 */
    10() {
      const HA = S.rand(10, 90), HB = HA + S.rand(-1.2, 1.2);
      const pts = {
        A: P(0, 0, HA, 'A'), B: P(120, 0, HB, 'B'),
        T1: { x: 60, y: 7, H: (HA + HB) / 2 + S.rand(-0.3, 0.3), kind: 'tp', label: 'TP1（往測轉點）' },
        T2: { x: 60, y: -7, H: (HA + HB) / 2 + S.rand(-0.3, 0.3), kind: 'tp', label: 'TP2（返測轉點）' }
      };
      const grid = { C: [0, 0], D: [0, 1], E: [1, 0], F: [1, 1], G: [1, 2], H: [1, 3], I: [2, 0], J: [2, 1], K: [2, 2], L: [2, 3], M: [3, 0], N: [3, 1], O: [3, 2] };
      const base = HB + S.rand(-0.2, 0.2), gx = S.rand(-0.01, 0.01), gy = S.rand(-0.01, 0.01);
      for (const p in grid) { const [r, c] = grid[p]; pts[p] = P(128 + c * 10, 22 - r * 10, base + gx * c * 10 + gy * r * 10 + S.rand(-0.15, 0.15), p); }
      const stations = {
        s1: ST(30, 4, 'A、TP1 之間（往測）'), s2: ST(90, 4, 'TP1、B 之間（往測）'),
        s3: ST(90, -4, 'B、TP2 之間（返測）'), s4: ST(30, -4, 'TP2、A 之間（返測）'), sg: ST(146, 8, '方格區（由 B 測定 C～O）')
      };
      const sc = { pts, stations, x: S.randInt(-6, 6) };
      const Hs = Object.keys(grid).map(p => pts[p].H);
      sc.known = { HA: r3(HA), Hd: S.rnd(Math.max(...Hs) + S.rand(1.5, 3.5), 2), a: 10 };
      const T1 = pts.T1.H, T2 = pts.T2.H;
      sc.perfect = { fA_bs: 1.5, fT_fs: HA + 1.5 - T1, fT_bs: 1.5, fB_fs: T1 + 1.5 - HB, bB_bs: 1.5, bT_fs: HB + 1.5 - T2, bT_bs: 1.5, bA_fs: T2 + 1.5 - HA, gB_bs: 1.5 };
      for (const p in grid) sc.perfect['g' + p] = HB + 1.5 - pts[p].H;
      sc.override = { HB: r3(HB) }; for (const p in grid) sc.override['H' + p] = r3(pts[p].H);
      sc.hint = '往測：A→TP1→B；返測：B→TP2→A（轉點不可同一位置）。最後於方格區設站，後視 B，依序觀測 C～O。';
      return sc;
    }
  };

  /* ---------------- 狀態與進入 ---------------- */
  const fs = () => A().st.field;
  function supports(t) { return SUPPORT.includes(t.id); }

  function truthOf(t, sc) {
    try { return Object.assign(t.solve(A().makeV(Object.assign({}, sc.known, sc.perfect))).ans, sc.override); }
    catch (e) { console.warn('field truth', e); return Object.assign({}, sc.override); }
  }

  function enter(t) {
    if (t.id === 5 && SK()) return SK().enter(t);
    const app = A(), st = app.st;
    st.task = t; st.mode = 'field'; st.defs = app.buildDefs(t); st.labels = {}; st.guide = null;
    document.title = `${t.title}｜${app.MODES.field.name}`;
    const d = app.store.get(app.draftKey(), null);
    if (d && d.field && d.field.scene) {
      st.field = d.field; st.vals = d.vals || {}; st.calcText = d.calcText || ''; st.submitted = !!d.submitted;
      st.sc = d.sc || { known: {}, obs: {} };
      st.timer = { limit: t.time * 60, remain: d.remain != null ? d.remain : t.time * 60, running: false, h: null };
      app.toast(st.field.ended ? (st.submitted ? '已交卷，以下為評審結果' : '已還原：內業計算階段') : '已還原上次外業進度');
    } else {
      const scene = SCENES[t.id]();
      st.field = { scene, cur: null, az: 0, phase: 'f', visited: [], setups: 0, aimed: null, ended: false };
      st.vals = {}; st.calcText = ''; st.submitted = false;
      st.sc = { known: {}, obs: {}, source: 'field' };
      st.timer = { limit: t.time * 60, remain: t.time * 60, running: false, h: null };
    }
    st.field.truth = truthOf(t, st.field.scene);
    if (st.field.ended) { toOffice(false); return; }
    renderField();
    if (!st.submitted) app.startTimer();
    if (!st.field.cur) openMap(true);
  }
  function reset() {
    const app = A(); app.stopTimer(); app.store.del(app.draftKey());
    closeOverlays(); enter(app.st.task); app.toast('已換新場地，重新開始');
  }
  /** 結束外業 → 發給已知資料，進入內業 */
  function toOffice(fresh) {
    const app = A(), st = app.st, f = fs();
    f.ended = true;
    st.sc = { known: f.scene.known, obs: {}, source: 'field' };
    for (const k in st.defs) { const d = st.defs[k]; if (d.role === 'known' && k in f.scene.known) st.vals[k] = F.fmtVal(d, f.scene.known[k]); }
    st.truth = f.truth;
    closeOverlays();
    app.renderWork();
    if (fresh) { app.saveDraft(); app.toast('外業結束，已發給已知資料。請完成內業計算後交卷。'); }
    if (!st.submitted) app.startTimer();
  }
  /** 時間到：回傳 false 表示不交卷（試題五室內計算時間到 → 進入實地測設） */
  function forceEnd() {
    if (A().st.task && A().st.task.id === 5 && SK()) return SK().forceEnd();
    if (fs() && !fs().ended) toOffice(false);
  }
  /** 試題六：未於 p、q 點觀測者扣 10 分 */
  function adjustGrade(t, items) {
    const f = fs(); if (!f) return;
    if (t.id === 6) {
      const ok = ['p', 'q'].every(s => f.visited.includes(s));
      const it = items.find(i => i.no === 6);
      if (it) { it.got = ok ? 0 : -10; it.na = false; it.detail = ok ? '已分別於 p、q 兩站觀測' : '未依規定分別於 p、q 兩站觀測，扣 10 分'; it.status = ok ? 'ok' : 'bad'; }
    }
  }

  /* ---------------- 讀數計算 ---------------- */
  function ptH(p) { return p.kind === 'tp' && p.Hf !== undefined ? (fs().phase === 'b' ? p.Hb : p.Hf) : p.H; }
  function ptLabel(p) { return p.kind === 'tp' && p.fwd ? (fs().phase === 'b' ? p.bwd : p.fwd) : p.label; }
  /** 目前測站對某點的中絲讀數（含視準軸誤差）與距離 */
  function readingOf(id) {
    const f = fs(), sc = f.scene, s = sc.stations[f.cur.id], p = sc.pts[id];
    const d = Math.hypot(p.x - s.x, p.y - s.y);
    const mid = f.cur.HI - ptH(p) + d * sc.x / S.RHO;
    return { d, mid };
  }

  /* ---------------- 版面 ---------------- */
  function renderField() {
    const app = A(), st = app.st, t = st.task, f = fs();
    const cur = f.cur ? f.scene.stations[f.cur.id] : null;
    $('#app').innerHTML = `
      <div class="fld">
        <div class="fld-bar">
          <a class="btn" href="#/t${t.id}">← 選擇模式</a>
          <div class="fld-title serif">${esc(app.taskName(t))}<small>${f.scene.kind === 'stake' ? '實地測設（40 分鐘）' : '第一人稱外業（外業階段）'}</small></div>
          <span class="timer" id="timer"></span><button class="btn" id="btnTimer"></button>
          <button class="btn warn" id="btnEnd">${f.scene.kind === 'stake' ? '完成實地測設' : '結束外業'}</button>
        </div>
        <div class="fld-stage" id="stage">
          <svg id="pano" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet"></svg>
          <div class="fld-status">
            <span>${cur ? `測站：<b>${esc(cur.label)}</b>　${f.cur.leveled ? '已整置' : '<span style="color:#c62828">尚未整置</span>'}` : '尚未架設儀器'}</span>
            ${f.scene.phases ? `<span class="seg-s"><button data-phase="f" class="${f.phase === 'f' ? 'on' : ''}">往測</button><button data-phase="b" class="${f.phase === 'b' ? 'on' : ''}">返測</button></span>` : ''}
          </div>
          <div class="fld-map" id="miniMap" title="點選開啟場地圖並移站"></div>
          <button class="btn fld-move" id="btnMove">移站／選擇測站</button>
          ${f.scene.tapes && f.scene.tapes.length ? '<button class="btn fld-tape" id="btnTape">捲尺量測</button>' : ''}
          ${f.scene.kind === 'stake' ? SK().buttons() : ''}
          <button class="fld-book" id="btnBook" title="記錄本"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 17a2 2 0 0 1 2-2h12"/><path d="M9 7h6M9 10h6"/></svg><span>${f.scene.kind === 'stake' ? '放樣資料' : '記錄本'}</span></button>
          <div class="fld-turn"><button class="btn" id="btnL">◀ 左轉</button>${isTheo(f) ? '<button class="btn" id="btnL1">◀ 1°</button>' : ''}<span id="hdg"></span>${isTheo(f) ? '<button class="btn" id="btnR1">1° ▶</button>' : ''}<button class="btn" id="btnR">右轉 ▶</button></div>
          ${isTheo(f) ? '<div class="pano-lcd" id="panoLcd"></div>' : ''}
          <div class="fld-hint" id="fldHint">${esc(f.scene.hint)}　<b>拖曳畫面可轉向，點選樁位可照準讀尺。</b></div>
        </div>
      </div>
      <div id="ovl"></div>`;
    $('#btnTimer').onclick = () => (st.timer.running ? app.stopTimer() : app.startTimer());
    app.renderTimer();
    $('#btnEnd').onclick = f.scene.kind === 'stake' ? () => SK().finish(false) : endField;
    $('#btnMove').onclick = () => openMap(false);
    if ($('#btnTape')) $('#btnTape').onclick = () => TH().tapeMenu();
    $('#miniMap').onclick = () => openMap(false);
    $('#btnBook').onclick = () => (f.scene.kind === 'stake' ? SK().card() : openBook());
    if (f.scene.kind === 'stake') SK().bind();
    $('#btnL').onclick = () => turn(-20);
    $('#btnR').onclick = () => turn(20);
    if ($('#btnL1')) { $('#btnL1').onclick = () => turn(-1); $('#btnR1').onclick = () => turn(1); }
    $$('[data-phase]').forEach(b => b.onclick = () => { f.phase = b.dataset.phase; app.saveDraft(); renderField(); app.toast(f.phase === 'f' ? '目前作業：往測' : '目前作業：返測（轉點尺墊已重新擺置）'); });
    bindPano();
    drawPano();
    drawMini();
  }
  function turn(da) { const f = fs(); f.az = S.norm360(f.az + da); drawPano(); drawMini(); A().saveDraft(); }
  const isTheo = f => f.scene.kind === 'theo' || f.scene.kind === 'stake';
  /** 全景中央＝望遠鏡指向；更新儀器顯示 HR、V（放樣時同步望遠鏡指向並遵守 HOLD） */
  function panoInstrument(f) {
    const box = $('#panoLcd'); if (!box || !f.cur) { if (box) box.innerHTML = ''; return ''; }
    const c = f.cur;
    let HR, V, hold = false;
    if (f.scene.kind === 'stake') {
      if (!f.point) f.point = { az: f.az, Z: 92 };
      const d = S.wrap180(f.az - f.point.az) * 3600;
      if (Math.abs(d) > 0.01) SK()._.turn(d, 0);
      HR = c.hold ? c.heldHR : SK()._.curHR(); hold = !!c.hold;
      V = S.roundSec(S.norm360(c.face === 'L' ? f.point.Z + c.i / 3600 : 360 - f.point.Z + c.i / 3600));
    } else {
      HR = S.roundSec(c.face === 'L' ? S.norm360(f.az - c.ori + c.c / 3600) : S.norm360(f.az - c.ori + 180 - c.c / 3600));
      V = S.roundSec(S.norm360(c.face === 'L' ? 90 + c.i / 3600 : 270 + c.i / 3600));
    }
    box.innerHTML = `<div class="lcd-in"><span class="lcd-face">${hold ? 'HOLD' : (c.face === 'L' ? '正鏡' : '倒鏡')}</span><div><b>V</b>　${S.fmtDMS(V)}</div><div><b>HR</b>　${S.fmtDMS(HR)}</div></div>
      <div class="pano-lcd-note">畫面中央縱線＝望遠鏡指向（全景轉動約 0.1°／像素，精確對準請開望遠鏡用微動鈕）</div>`;
    return `<line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${HH}" stroke="#111" stroke-width="1" stroke-dasharray="6 5" opacity="0.6"/><line x1="${W / 2 - 14}" y1="${HOR}" x2="${W / 2 + 14}" y2="${HOR}" stroke="#111" stroke-width="1.2"/>`;
  }

  /* ---------------- 全景繪製 ---------------- */
  const HH = 560, HOR = 250;
  const FOC = 500 / Math.tan(FOV / 2 * S.D2R);
  let W = 1000, FOVE = FOV;  // 實際寬度與水平視角（依容器比例）
  function sizePano() {
    const st = $('#stage'); if (!st) return;
    const r = st.getBoundingClientRect();
    W = Math.max(300, Math.round(HH * r.width / Math.max(1, r.height)));
    FOVE = 2 * Math.atan((W / 2) / FOC) * S.R2D;
    $('#pano').setAttribute('viewBox', `0 0 ${W} ${HH}`);
  }
  window.addEventListener('resize', () => { if ($('#pano')) { drawPano(); } });
  const DECOR = [
    { az: 15, k: 'tree', s: 1 }, { az: 52, k: 'bld', s: 1.3 }, { az: 95, k: 'tree', s: .8 }, { az: 140, k: 'pole', s: 1 }, { az: 178, k: 'bld', s: 1 },
    { az: 215, k: 'tree', s: 1.1 }, { az: 258, k: 'hill', s: 1 }, { az: 300, k: 'tree', s: .9 }, { az: 333, k: 'bld', s: .9 }
  ];
  function drawPano() {
    const f = fs(), svg = $('#pano'); if (!svg) return;
    sizePano();
    let g = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8ee"/><stop offset="1" stop-color="#dcecf8"/></linearGradient>
      <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9bbf74"/><stop offset="1" stop-color="#5f8f3e"/></linearGradient></defs>
      <rect width="${W}" height="${HOR}" fill="url(#sky)"/><rect y="${HOR}" width="${W}" height="${HH - HOR}" fill="url(#gnd)"/>`;
    // 遠景
    for (const d of DECOR) {
      const rel = S.wrap180(d.az - f.az); if (Math.abs(rel) > FOVE / 2 + 10) continue;
      const x = W / 2 + Math.tan(rel * S.D2R) * FOC;
      if (d.k === 'tree') g += `<rect x="${x - 3}" y="${HOR - 34 * d.s}" width="6" height="${34 * d.s}" fill="#6b4f2a"/><circle cx="${x}" cy="${HOR - 44 * d.s}" r="${22 * d.s}" fill="#4f7d3a"/>`;
      if (d.k === 'bld') g += `<rect x="${x - 60 * d.s}" y="${HOR - 70 * d.s}" width="${120 * d.s}" height="${70 * d.s}" fill="#c9c3b5" stroke="#8d8777"/>${[0, 1, 2].map(i => `<rect x="${x - 50 * d.s + i * 36 * d.s}" y="${HOR - 58 * d.s}" width="${22 * d.s}" height="${16 * d.s}" fill="#7f97ad"/>`).join('')}`;
      if (d.k === 'pole') g += `<rect x="${x - 2}" y="${HOR - 90}" width="4" height="90" fill="#777"/><rect x="${x - 14}" y="${HOR - 90}" width="28" height="4" fill="#777"/>`;
      if (d.k === 'hill') g += `<path d="M${x - 160} ${HOR} Q ${x} ${HOR - 70} ${x + 160} ${HOR} Z" fill="#7fa36a"/>`;
    }
    g += `<line x1="0" y1="${HOR}" x2="${W}" y2="${HOR}" stroke="#6f8f55" stroke-width="1"/>`;
    if (!f.cur) {
      g += `<text x="${W / 2}" y="${HOR + 120}" text-anchor="middle" font-size="26" fill="#fff" stroke="#000" stroke-width="0.6">請先點左上角場地圖，選擇測站架設儀器</text>`;
      svg.innerHTML = g; $('#hdg').textContent = ''; return;
    }
    const sc = f.scene, s = sc.stations[f.cur.id];
    const items = [];
    const left = [], right = [];
    for (const id in sc.pts) {
      const p = sc.pts[id];
      const dx = p.x - s.x, dy = p.y - s.y, d = Math.hypot(dx, dy);
      if (d < 2) continue;  // 儀器所在的樁位本身不顯示
      const rel = S.wrap180(Math.atan2(dx, dy) * S.R2D - f.az);
      if (Math.abs(rel) > FOVE / 2 - 1) { (rel < 0 ? left : right).push(ptLabel(p)); continue; }
      items.push({ id, p, d, rel });
    }
    items.sort((a, b) => b.d - a.d);
    for (const it of items) {
      const { id, p, d, rel } = it;
      const x = W / 2 + Math.tan(rel * S.D2R) * FOC;
      const gH = ptH(p) - (p.kind === 'tp' ? 0.02 : 0.03);
      const yOf = h => HOR + (f.cur.HI - h) / d * FOC;
      const yb = yOf(gH);
      const k = Math.max(0.55, Math.min(1.4, 30 / d));
      let shape = '';
      if (p.kind === 'tp') shape = `<ellipse cx="${x}" cy="${yb}" rx="${Math.max(6, 0.15 / d * FOC)}" ry="${Math.max(2, 0.05 / d * FOC)}" fill="#3a3a3a"/>`;
      else { const yt = yOf(gH + 0.25); shape = `<rect x="${x - Math.max(3, 0.03 / d * FOC)}" y="${yt}" width="${Math.max(6, 0.06 / d * FOC)}" height="${Math.max(3, yb - yt)}" fill="#c8a165" stroke="#6b4f2a"/>`; }
      let rod = '';
      if (sc.kind === 'theo') rod = TH().panoTarget(p, id, x, yOf, gH, d, FOC);
      else if (sc.kind === 'stake') rod = SK().panoTarget(p, id, x, yOf, gH, d, FOC);
      else if (f.aimed === id) {
        const yt = yOf(gH + ROD_LEN), wd = Math.max(5, 0.06 / d * FOC);
        for (let i = 0; i < 4; i++) { const y1 = yOf(gH + i + 1), y2 = yOf(gH + i); rod += `<rect x="${x - wd / 2}" y="${y1}" width="${wd}" height="${y2 - y1}" fill="${i % 2 ? '#fbe800' : '#f1f1ef'}" stroke="#555" stroke-width="0.6"/>`; }
        const hx = x + wd * 1.6, hs = 1.7 / d * FOC;
        rod += `<g stroke="#334" stroke-width="${Math.max(1.5, hs / 40)}" fill="none"><circle cx="${hx}" cy="${yb - hs * 0.93}" r="${hs * 0.06}" fill="#f2c9a0"/><line x1="${hx}" y1="${yb - hs * 0.87}" x2="${hx}" y2="${yb - hs * 0.45}"/><line x1="${hx}" y1="${yb - hs * 0.45}" x2="${hx - hs * 0.08}" y2="${yb}"/><line x1="${hx}" y1="${yb - hs * 0.45}" x2="${hx + hs * 0.08}" y2="${yb}"/><line x1="${hx}" y1="${yb - hs * 0.75}" x2="${x + wd / 2}" y2="${yb - hs * 0.7}"/></g>`;
        void yt;
      }
      const lbl = ptLabel(p);
      const fw = Math.max(26, lbl.length * 13) * k, fh = 24 * k, ly = Math.min(yb, HH) - 34 * k - (f.aimed === id ? 0 : 0);
      g += `<g class="pt${d > MAX_SIGHT ? ' far' : ''}" data-pt="${id}">${rod}${shape}
        <line x1="${x}" y1="${ly + fh}" x2="${x}" y2="${yb}" stroke="#333" stroke-width="1"/>
        <rect x="${x - fw / 2}" y="${ly}" width="${fw}" height="${fh}" rx="3" fill="${p.kind === 'tp' ? '#fff4c2' : '#fff'}" stroke="#222"/>
        <text x="${x}" y="${ly + fh * 0.72}" text-anchor="middle" font-size="${15 * k}" font-weight="700" fill="#111">${esc(lbl)}</text>
        <rect x="${x - 30}" y="${ly - 6}" width="60" height="${yb - ly + 12}" fill="transparent"/></g>`;
    }
    if (left.length) g += `<text x="12" y="${HOR - 12}" font-size="16" fill="#123" font-weight="700">◀ ${esc(left.slice(0, 6).join(' '))}</text>`;
    if (right.length) g += `<text x="${W - 12}" y="${HOR - 12}" font-size="16" fill="#123" font-weight="700" text-anchor="end">${esc(right.slice(0, 6).join(' '))} ▶</text>`;
    if (isTheo(f)) g += panoInstrument(f);
    svg.innerHTML = g;
    const dirs = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
    $('#hdg').textContent = `面向 ${dirs[Math.round(f.az / 45) % 8]}`;
  }
  function bindPano() {
    const svg = $('#pano'); let down = null, moved = false;
    svg.addEventListener('pointerdown', e => { down = { x: e.clientX, az: fs().az }; moved = false; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 5) moved = true;
      if (moved) { const scale = FOVE / svg.getBoundingClientRect().width; fs().az = S.norm360(down.az - dx * scale); drawPano(); drawMini(); }
    });
    svg.addEventListener('pointerup', e => {
      const was = down; down = null;
      if (!was) return;
      if (moved) { A().saveDraft(); return; }
      const hit = document.elementsFromPoint(e.clientX, e.clientY).map(el => el.closest && el.closest('[data-pt]')).find(Boolean);
      if (hit) aimAt(hit.dataset.pt);
    });
  }

  /* ---------------- 小地圖與場地圖 ---------------- */
  function planSVG(w, h, big) {
    const f = fs(), sc = f.scene;
    const all = Object.values(sc.pts).concat(Object.values(sc.stations));
    const minX = Math.min(...all.map(p => p.x)) - 8, maxX = Math.max(...all.map(p => p.x)) + 8;
    const minY = Math.min(...all.map(p => p.y)) - 8, maxY = Math.max(...all.map(p => p.y)) + 8;
    const s = Math.min(w / (maxX - minX), h / (maxY - minY));
    const X = x => (x - minX) * s + (w - (maxX - minX) * s) / 2, Y = y => h - ((y - minY) * s + (h - (maxY - minY) * s) / 2);
    let g = `<rect width="${w}" height="${h}" fill="#e7efd9"/>`;
    for (const id in sc.pts) {
      const p = sc.pts[id];
      g += p.kind === 'tp' ? `<rect x="${X(p.x) - 4}" y="${Y(p.y) - 4}" width="8" height="8" fill="#e0a800" stroke="#333"/>` : `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${big ? 5 : 3}" fill="#c8a165" stroke="#333"/>`;
      if (big || p.kind !== 'tp') g += `<text x="${X(p.x) + 6}" y="${Y(p.y) - 5}" font-size="${big ? 13 : 9}" font-weight="700">${esc(big ? ptLabel(p) : p.label.split(' ')[0])}</text>`;
    }
    for (const id in sc.stations) {
      const s2 = sc.stations[id], cur = f.cur && f.cur.id === id, vis = f.visited.includes(id);
      g += `<g class="${big ? 'stn' : ''}" data-st="${id}"><circle cx="${X(s2.x)}" cy="${Y(s2.y)}" r="${big ? 13 : 5}" fill="${cur ? '#1d4ed8' : vis ? '#93c5fd' : '#fff'}" stroke="#1d4ed8" stroke-width="2"/>
        ${big ? `<path d="M${X(s2.x)} ${Y(s2.y) - 6} l-6 12 M${X(s2.x)} ${Y(s2.y) - 6} l6 12 M${X(s2.x)} ${Y(s2.y) - 6} v12" stroke="${cur ? '#fff' : '#1d4ed8'}" stroke-width="1.6"/><text x="${X(s2.x)}" y="${Y(s2.y) + 28}" text-anchor="middle" font-size="12.5" fill="#1d4ed8" font-weight="700">${esc(s2.label)}</text>` : ''}</g>`;
    }
    if (f.cur) {
      const s2 = sc.stations[f.cur.id], a1 = (f.az - FOVE / 2) * S.D2R, a2 = (f.az + FOVE / 2) * S.D2R, R = big ? 70 : 34;
      g += `<path d="M${X(s2.x)} ${Y(s2.y)} L${X(s2.x) + R * Math.sin(a1)} ${Y(s2.y) - R * Math.cos(a1)} L${X(s2.x) + R * Math.sin(a2)} ${Y(s2.y) - R * Math.cos(a2)} Z" fill="rgba(29,78,216,.18)" stroke="#1d4ed8" stroke-width="1"/>`;
    }
    g += `<text x="${w - 14}" y="18" font-size="12" text-anchor="middle" font-weight="700">N</text><path d="M${w - 14} 22 l-4 10 h8 z" fill="#333"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${g}</svg>`;
  }
  function drawMini() { const m = $('#miniMap'); if (m) m.innerHTML = planSVG(190, 150, false); }
  function openMap(first) {
    const f = fs();
    $('#ovl').innerHTML = `<div class="ovl"><div class="ovl-box map-box">
      <div class="ovl-h"><b>場地圖：選擇測站架設儀器</b>${first ? '' : '<button class="btn" data-close>關閉</button>'}</div>
      <div class="map-svg">${planSVG(760, 440, true)}</div>
      <p class="note">藍色圓圈為可架設儀器的位置（深藍＝目前測站，淺藍＝已使用過）。黃色方塊為轉點（尺墊）。每次移站都需要重新整置儀器，儀器高會改變。</p>
      <p class="note"><b>作業提示：</b>${esc(f.scene.hint)}</p></div></div>`;
    $$('#ovl [data-close]').forEach(b => b.onclick = closeOverlays);
    $$('#ovl .stn').forEach(el => el.onclick = () => setupAt(el.dataset.st));
  }
  function setupAt(id) {
    const f = fs(), s = f.scene.stations[id];
    $('#ovl').innerHTML = `<div class="ovl"><div class="ovl-box">
      ${f.scene.kind !== undefined && f.scene.kind !== 'level' && f.scene.kind ? `<div class="ovl-h"><b>於「${esc(s.label)}」整置經緯儀</b></div>
      <label class="chk"><input type="checkbox"> 架設三腳架，架頭大致水平，以光學垂準器（定心器）對準樁位鋼釘</label>
      <label class="chk"><input type="checkbox"> 定平：調整整平螺旋，使長水準管氣泡在任何方向皆居中</label>
      <label class="chk"><input type="checkbox"> 再次檢查定心（必要時平移基座）</label>
      <label class="chk"><input type="checkbox"> 調整目鏡、物鏡，使十字絲與目標清晰</label>` : `<div class="ovl-h"><b>於「${esc(s.label)}」整置自動水準儀</b></div>
      <label class="chk"><input type="checkbox"> 架設三腳架，腳架踩穩、架頭大致水平</label>
      <label class="chk"><input type="checkbox"> 旋轉整平螺旋，使圓盒氣泡居中</label>
      <label class="chk"><input type="checkbox"> 調整目鏡使十字絲清晰</label>`}
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end"><button class="btn" data-cancel>取消</button><button class="btn primary" id="btnLevel" disabled>完成整置</button></div></div></div>`;
    const cks = $$('#ovl .chk input');
    cks.forEach(c => c.onchange = () => { $('#btnLevel').disabled = !cks.every(x => x.checked); });
    $('#ovl [data-cancel]').onclick = () => openMap(!f.cur);
    $('#btnLevel').onclick = () => {
      const g = terrain(f.scene, s.x, s.y);
      f.cur = { id, HI: g + S.rand(1.35, 1.62), leveled: true };
      if (f.scene.kind === 'theo' || f.scene.kind === 'stake') Object.assign(f.cur, TH().newSetup(f.scene, id));
      if (!f.visited.includes(id)) f.visited.push(id);
      f.setups++; f.aimed = null;
      // 面向最近的樁位
      let best = null; for (const pid in f.scene.pts) { const p = f.scene.pts[pid]; const d = Math.hypot(p.x - s.x, p.y - s.y); if (d >= 2 && (!best || d < best.d)) best = { d, p }; }
      if (best) f.az = S.norm360(Math.atan2(best.p.x - s.x, best.p.y - s.y) * S.R2D);
      A().saveDraft(); closeOverlays(); renderField();
      A().toast(`已於 ${s.label} 完成整置`);
    };
  }

  /* ---------------- 望遠鏡 ---------------- */
  let scope = null;
  function aimAt(id) {
    const f = fs(); if (!f.cur) return;
    if (f.scene.kind === 'theo') { f.aimed = id; drawPano(); TH().aim(id); return; }
    if (f.scene.kind === 'stake') { SK().scope(id); return; }
    const { d } = readingOf(id);
    f.aimed = id; drawPano();
    scope = { id, aim: S.pick([-1, 1]) * S.rand(70, 170) };
    if (d > MAX_SIGHT) { A().toast(`與 ${ptLabel(f.scene.pts[id])} 點距離約 ${Math.round(d)} m，超過 ${MAX_SIGHT} m，影像太小無法讀數，請移站。`); }
    renderScope();
  }
  function renderScope() {
    const f = fs(), p = f.scene.pts[scope.id];
    const { d, mid } = readingOf(scope.id);
    $('#ovl').innerHTML = `<div class="ovl scope-ovl"><div class="scope-wrap">
      <div class="scope-h">照準：<b>${esc(ptLabel(p))}</b>　（左右拖曳或按鈕微調，使縱絲對準尺面）</div>
      <div class="scope-c" id="scopeC">${scopeSVG(d, mid, scope.aim)}</div>
      <div class="scope-b"><button class="btn" id="sL">◀</button><button class="btn" id="sR">▶</button>
        <button class="btn" id="sBook">記錄本</button><button class="btn primary" id="sBack">返回全景</button></div>
      <div class="note scope-note">5mm 式水準尺：右側小數字為公分數（例 149 ＝ 1.49 m）；紅色大字為公寸，上方紅點數＝公尺數，「M」為整公尺。每一黑塊或空白為 5 mm，毫米請估讀。上、下絲為十字絲上、下兩條短橫線。</div>
    </div></div>`;
    const c = $('#scopeC'); let down = null;
    c.addEventListener('pointerdown', e => { down = { x: e.clientX, a: scope.aim }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', e => { if (!down) return; const k = 600 / c.getBoundingClientRect().width; scope.aim = Math.max(-260, Math.min(260, down.a + (e.clientX - down.x) * k)); c.innerHTML = scopeSVG(d, mid, scope.aim); });
    c.addEventListener('pointerup', () => { down = null; });
    $('#sL').onclick = () => { scope.aim = Math.max(-260, scope.aim - 15); c.innerHTML = scopeSVG(d, mid, scope.aim); };
    $('#sR').onclick = () => { scope.aim = Math.min(260, scope.aim + 15); c.innerHTML = scopeSVG(d, mid, scope.aim); };
    $('#sBook').onclick = () => openBook(true);
    $('#sBack').onclick = () => { closeOverlays(); scope = null; };
  }
  /**
   * 5mm 式水準尺（依教具「水準尺讀數5mm」樣式）
   *   右側：每公分標註公分數（149 = 1.49 m）
   *   刻劃：左欄每公分上半 5mm 為黑塊；右欄奇數公分整格黑塊，兩者組成「ㅌ」形；每 5cm 一短刻痕
   *   公寸：長橫線，紅色公寸數字在線下方，紅點（公尺數）在線上方
   *   整公尺：紅色公尺數字在線上方、「M」在線下方；尺面每公尺白、黃交替
   */
  function rod5mm(mid, V, yOf, rx, rw, ppm) {
    const lo = Math.max(0, mid - V / 2 - 0.04), hi = Math.min(ROD_LEN, mid + V / 2 + 0.04);
    if (hi <= lo) return '';
    const X = f => rx + rw * f;
    const ink = '#3a3a3a', red = '#e0001b';
    let g = '';
    // 尺面底色（每公尺白／黃交替）與邊框
    for (let m = Math.floor(lo); m < Math.ceil(hi); m++) {
      const a = Math.max(lo, m), b = Math.min(hi, m + 1);
      g += `<rect x="${rx}" y="${yOf(b)}" width="${rw}" height="${yOf(a) - yOf(b)}" fill="${m % 2 === 0 ? '#f1f1ef' : '#fbe800'}"/>`;
    }
    g += `<rect x="${rx}" y="${yOf(hi)}" width="${rw * 0.045}" height="${yOf(lo) - yOf(hi)}" fill="#777"/><rect x="${X(0.955)}" y="${yOf(hi)}" width="${rw * 0.045}" height="${yOf(lo) - yOf(hi)}" fill="#777"/>`;
    const c0 = Math.floor(lo * 100), c1 = Math.ceil(hi * 100);
    const cmFont = Math.max(7, 0.0062 * ppm), bigFont = Math.max(12, 0.03 * ppm);
    for (let n = c0; n < c1; n++) {
      const y0 = yOf(n / 100), y5 = yOf((n + 0.5) / 100), y1 = yOf((n + 1) / 100);
      // 左欄：每公分上半 5mm 黑塊
      g += `<rect x="${X(0.435)}" y="${y1}" width="${rw * 0.13}" height="${y5 - y1}" fill="${ink}"/>`;
      // 右欄：奇數公分整格黑塊
      if (n % 2 === 1) g += `<rect x="${X(0.565)}" y="${y1}" width="${rw * 0.065}" height="${y0 - y1}" fill="${ink}"/>`;
      // 每 5cm 短刻痕
      if (n % 5 === 0) g += `<rect x="${X(0.565)}" y="${y0 - Math.max(0.6, 0.0006 * ppm)}" width="${rw * 0.085}" height="${Math.max(1, 0.0012 * ppm)}" fill="${ink}"/>`;
      // 公分數字
      if (n > 0) g += `<text x="${X(0.75)}" y="${y0 + cmFont * 0.36}" font-size="${cmFont}" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" text-anchor="middle" fill="#222">${n}</text>`;
      if (n % 10 === 0 && n > 0) {
        // 公寸長橫線
        g += `<rect x="${X(0.17)}" y="${y0 - Math.max(0.6, 0.0007 * ppm)}" width="${rw * 0.265}" height="${Math.max(1.2, 0.0014 * ppm)}" fill="${ink}"/>`;
        const meters = Math.floor(n / 100), dmDigit = (n / 10) % 10;
        if (n % 100 === 0) {
          // 整公尺：數字在線上方、M 在線下方
          g += `<text x="${X(0.3)}" y="${yOf(n / 100 + 0.004)}" font-size="${bigFont}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" fill="${red}">${meters}</text>`;
          g += `<text x="${X(0.3)}" y="${yOf(n / 100 - 0.029)}" font-size="${bigFont * 0.85}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" fill="${red}">M</text>`;
        } else {
          // 公寸：數字在線下方、紅點（公尺數）在線上方
          g += `<text x="${X(0.3)}" y="${yOf(n / 100 - 0.029)}" font-size="${bigFont}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" fill="${red}">${dmDigit}</text>`;
          const rr = Math.max(1.4, 0.0035 * ppm);
          for (let i = 0; i < meters; i++) g += `<circle cx="${X(0.3) + (i - (meters - 1) / 2) * rr * 2.8}" cy="${yOf(n / 100 + 0.009)}" r="${rr}" fill="${red}"/>`;
        }
      }
    }
    return g;
  }

  /** 望遠鏡視野：5mm 式水準尺 + 十字絲（含上、下視距絲） */
  function scopeSVG(d, mid, aim) {
    const V = Math.max(0.06, d * SCOPE_V), ppm = 600 / V;
    const yOf = h => 300 - (h - mid) * ppm;
    const rw = Math.max(44, ROD_W * ppm), rx = 300 + aim - rw / 2;
    const far = d > MAX_SIGHT;
    let g = `<defs><clipPath id="cc"><circle cx="300" cy="300" r="292"/></clipPath>
      <radialGradient id="vig" cx="50%" cy="50%" r="50%"><stop offset="0.78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
      <filter id="bl"><feGaussianBlur stdDeviation="${far ? 3 : 0}"/></filter></defs>
      <rect width="600" height="600" fill="#111"/><g clip-path="url(#cc)">
      <rect width="600" height="300" fill="#cfe1ef"/><rect y="300" width="600" height="300" fill="#a9c58b"/>
      <g filter="url(#bl)">`;
    g += rod5mm(mid, V, yOf, rx, rw, ppm);
    g += `</g><circle cx="300" cy="300" r="300" fill="url(#vig)"/></g>`;
    // 十字絲
    g += `<g stroke="#1a1a1a" stroke-width="1.3"><line x1="300" y1="8" x2="300" y2="592"/><line x1="8" y1="300" x2="592" y2="300"/>
      <line x1="262" y1="${300 - STADIA_PX}" x2="338" y2="${300 - STADIA_PX}"/><line x1="262" y1="${300 + STADIA_PX}" x2="338" y2="${300 + STADIA_PX}"/></g>
      <circle cx="300" cy="300" r="292" fill="none" stroke="#000" stroke-width="10"/>`;
    if (mid < 0 || mid > ROD_LEN) g += `<text x="300" y="560" text-anchor="middle" fill="#fff" font-size="20">視線超出尺面範圍（${mid < 0 ? '低於尺底' : '高於尺頂'}）</text>`;
    if (far) g += `<text x="300" y="560" text-anchor="middle" fill="#fff" font-size="20">距離過遠，影像模糊，請移站</text>`;
    return `<svg viewBox="0 0 600 600" width="100%" height="100%">${g}</svg>`;
  }

  /* ---------------- 記錄本（原格式觀測記錄表） ---------------- */
  function openBook(fromScope) {
    const app = A(), st = app.st, t = st.task;
    const ro = def => def.role !== 'obs' || def.free;
    const html = t.layout.filter(s => s.role === 'obs' && !s.rows.every(r => r.every(c => !c.k || c.free))).map(s => {
      const r = F.renderSection(s, { vals: st.vals, ro });
      Object.assign(st.labels, r.labels);
      return `<h3>${esc(s.title)}</h3>${r.html}`;
    }).join('');
    const drawer = document.createElement('div');
    drawer.className = 'book-drawer paper form-root';
    drawer.id = 'bookDrawer';
    drawer.innerHTML = `<div class="ovl-h"><b class="serif">觀測記錄表（記錄本）</b><button class="btn primary" data-close>收起記錄本</button></div>
      <p class="caution">只需填寫觀測讀數（記錄至 0.001 m）；灰色計算欄位於結束外業、進入內業後才填寫。</p>${html}`;
    const old = $('#bookDrawer'); if (old) old.remove();
    document.body.appendChild(drawer);
    drawer.addEventListener('input', app.onInput);
    drawer.addEventListener('change', app.onInput);
    drawer.addEventListener('focusout', app.onBlur);
    drawer.addEventListener('keydown', app.onKey);
    drawer.querySelector('[data-close]').onclick = () => drawer.remove();
    const first = Array.from(drawer.querySelectorAll('[data-k]')).find(x => !x.readOnly && !x.value);
    if (first && !fromScope) first.focus();
  }

  function closeOverlays() { const o = $('#ovl'); if (o) o.innerHTML = ''; const b = $('#bookDrawer'); if (b) b.remove(); }

  function endField() {
    const app = A(), st = app.st;
    const obsKeys = Object.keys(st.defs).filter(k => st.defs[k].role === 'obs' && !st.defs[k].free);
    const filled = obsKeys.filter(k => String(st.vals[k] ?? '').trim()).length;
    if (!confirm(`結束外業後不得再使用儀器，並將發給已知資料進入內業計算。\n觀測記錄表已填 ${filled} / ${obsKeys.length} 格，確定結束外業？`)) return;
    toOffice(true);
  }

  G.FIELD = { supports, enter, reset, adjustGrade, forceEnd, SCENES, readingOf, truthOf, scopeSVG,
    _: { fs, closeOverlays, renderField, drawPano, drawMini, openBook, ptLabel, ptH, terrain, MAX_SIGHT, openMap } };
})(window);
