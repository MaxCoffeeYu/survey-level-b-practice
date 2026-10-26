/* 試題十、方格水準測量 04202-1060210 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;
  // 方格配置（列, 行）：C D / E F G H / I J K L / M N O，共 6 個 10m×10m 方格
  const GRID = { C: [0, 0], D: [0, 1], E: [1, 0], F: [1, 1], G: [1, 2], H: [1, 3], I: [2, 0], J: [2, 1], K: [2, 2], L: [2, 3], M: [3, 0], N: [3, 1], O: [3, 2] };
  const PTS = Object.keys(GRID);
  const CELLS = [[0, 0], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1]]; // 方格左上角 (列, 行)
  const W = (() => { const w = {}; PTS.forEach(p => w[p] = 0); CELLS.forEach(([r, c]) => [[r, c], [r + 1, c], [r, c + 1], [r + 1, c + 1]].forEach(([a, b]) => { const p = PTS.find(q => GRID[q][0] === a && GRID[q][1] === b); w[p]++; })); return w; })();

  const task = {
    id: 10, code: '04202-1060210', title: '方格水準測量', short: '方格水準', time: 60,
    ruleZeroIfMismatch: true,
    intro: {
      goal: '已知 A 點高程，於 A、B 間設轉點往返直接水準測量（往測 TP1、返測 TP2 不同位置）求 B 點平均高程；再由 B 點測定 C~O 共 13 點高程，計算依設計高程整地之土方不足量，以及挖填平衡時之設計高程。',
      field: [
        '往測：A → TP1 → B；返測：B → TP2 → A（TP2 不可與 TP1 同位置）。',
        '於 B 附近設站，後視 B，依序前視 C~O 各點並記錄。',
        '水準尺由助手垂直立於點位鋼釘上。'
      ],
      calc: [
        '往測 hAB = Σb − Σf；返測 hBA = Σb − Σf；較差 W = |hAB + hBA|',
        'h̄AB = (hAB − hBA) / 2；HB = HA + h̄AB',
        '視準軸高程 HI = HB + 後視；各點高程 = HI − 前視',
        '各點使用次數：角點 1、邊點 2、凹角 3、內點 4（Σh1、Σh2、Σh3、Σh4）',
        '總體積（基準 0）V = a²/4 × (Σh1 + 2Σh2 + 3Σh3 + 4Σh4)',
        '土方不足量 = a²·n·H設計 − V；挖填平衡高程 H\' = V / (a²·n)（n = 方格數 6）'
      ],
      pitfalls: [
        '本題方格為 L 形，F、K 屬於 3 個方格（凹角），J 屬於 4 個方格，勿全部以矩形公式套用。',
        '返測高程差 hBA 與往測符號相反，平均時應 (hAB − hBA)/2。',
        '觀測之數據與計算之數據不符者，總分以零分計；土方計算至 0.001 m³。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 4, '觀察應檢人員使用儀器是否正確，定平是否準確。'],
      [2, '往返高程差之較差的絕對值', 10, '7mm 以內 10 分；8~15mm 5 分；16mm（含）以上 0 分。'],
      [3, 'B 點平均高程值', 15, '±5mm 以內 15 分；±6~10mm 8 分；±11mm 以上 0 分。'],
      [4, 'C 至 O 等 13 點之高程誤差', 26, '±5mm 以內各 2 分；±6~±8mm 各 1 分；±9mm 以上 0 分。'],
      [5, '土方不足之誤差', 25, '±3.000m³ 以內 25 分；±3.100~±6.000m³ 16 分；±6.100~±9.000m³ 8 分；±9.100m³ 以上 0 分。'],
      [6, '挖填平衡時之地面設計高程', 20, '±5mm 以內 20 分；±6~±8mm 14 分；±9~±11mm 7 分；±12mm 以上 0 分。'],
      [7, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [],
    layout: [
      {
        title: '已知資料', role: 'known',
        head: [['項目', '數值', '項目', '數值']],
        rows: [[L('A 點高程 (m)'), K('HA', 'num', { d: 3 }), L('地面設計高程 (m)'), K('Hd', 'num', { d: 3 })], [L('各樁間距 a (m)'), K('a', 'num', { d: 1 }), L(''), L('')]]
      },
      {
        title: '1. 直接水準測量記錄表（往測 / 返測）', role: 'obs', book: true,
        head: [['', '樁號', '後視', '前視', '高程差 (±)']],
        rows: [
          [L('往測', { rs: 3, cls: 'pt' }), L('A', { cls: 'pt' }), O('fA_bs', 'num', { d: 3 }), L(''), L('')],
          [L('TP1', { cls: 'pt' }), O('fT_bs', 'num', { d: 3 }), O('fT_fs', 'num', { d: 3 }), A('fT_h', 'num', { d: 3, signed: true, book: true })],
          [L('B', { cls: 'pt' }), L(''), O('fB_fs', 'num', { d: 3 }), A('fB_h', 'num', { d: 3, signed: true, book: true })],
          [L('返測', { rs: 3, cls: 'pt' }), L('B', { cls: 'pt' }), O('bB_bs', 'num', { d: 3 }), L(''), L('')],
          [L('TP2', { cls: 'pt' }), O('bT_bs', 'num', { d: 3 }), O('bT_fs', 'num', { d: 3 }), A('bT_h', 'num', { d: 3, signed: true, book: true })],
          [L('A', { cls: 'pt' }), L(''), O('bA_fs', 'num', { d: 3 }), A('bA_h', 'num', { d: 3, signed: true, book: true })]
        ]
      },
      {
        title: '(3) 往返較差與 B 點高程', role: 'ans',
        head: [['項目', '結果', '項目', '結果']],
        rows: [
          [L('往測高程差 hAB (m)'), A('hAB', 'num', { d: 3, signed: true }), L('返測高程差 hBA (m)'), A('hBA', 'num', { d: 3, signed: true })],
          [L('較差絕對值 W (m)'), A('Wd', 'num', { d: 3 }), L('高程差平均 h̄AB (m)'), A('hm', 'num', { d: 3, signed: true })],
          [L('B 點高程 HB (m)'), A('HB', 'num', { d: 3 }), L(''), L('')]
        ]
      },
      {
        title: '2. 外業水準高程測量觀測記錄（由 B 點測定 C~O）', role: 'obs', book: true,
        head: [['測點', '後視', '視準軸高程', '前視', '地面高程']],
        rows: [
          [L('B', { cls: 'pt' }), O('gB_bs', 'num', { d: 3 }), A('HIg', 'num', { d: 3, book: true }), L(''), L('—', { ref: 'HB' })],
          ...PTS.map(p => [L(p, { cls: 'pt' }), L(''), L(''), O('g' + p, 'num', { d: 3 }), A('H' + p, 'num', { d: 3, book: true })])
        ]
      },
      {
        title: '3. 土方計算', role: 'ans',
        head: [['項目', '結果', '項目', '結果']],
        rows: [
          [L('Σh1（角點，×1）'), A('s1', 'num', { d: 3 }), L('Σh2（邊點，×2）'), A('s2', 'num', { d: 3 })],
          [L('Σh3（凹角，×3）'), A('s3', 'num', { d: 3 }), L('Σh4（內點，×4）'), A('s4', 'num', { d: 3 })],
          [L('總體積 V (m³)'), A('Vol', 'num', { d: 3, tol: 0.06 }), L('方格數 n'), A('nCell', 'num', { d: 0 })],
          [L('(1) 土方不足 (m³)'), A('short', 'num', { d: 3, tol: 0.06 }), L('(2) 挖填平衡設計高程 (m)'), A('Hbal', 'num', { d: 3 })]
        ]
      }
    ],

    official() {
      const g = { C: 1.248, D: 1.148, E: 1.2, F: 1.138, G: 1.13, H: 1.17, I: 1.257, J: 1.271, K: 1.273, L: 1.202, M: 1.432, N: 1.387, O: 1.464 };
      const obs = { fA_bs: 1.702, fT_fs: 1.3, fT_bs: 1.8, fB_fs: 1.2, bB_bs: 1.1, bT_fs: 1.69, bT_bs: 1.2, bA_fs: 1.606, gB_bs: 1.353 };
      PTS.forEach(p => obs['g' + p] = g[p]);
      return { known: { HA: 19.996, Hd: 24.25, a: 10 }, obs };
    },

    random(level) {
      const sg = level === 'fine' ? 0.0006 : 0.0012;
      const HA = S.rnd(S.rand(10, 90), 3), HB = HA + S.rand(-1.2, 1.2);
      const T1 = (HA + HB) / 2 + S.rand(-0.3, 0.3), T2 = (HA + HB) / 2 + S.rand(-0.3, 0.3);
      const b = () => S.rnd(S.rand(1.1, 1.9), 3);
      const fA = b(), fT = b(), bB = b(), bT = b();
      const perf = { fA_bs: fA, fT_fs: HA + fA - T1, fT_bs: fT, fB_fs: T1 + fT - HB, bB_bs: bB, bT_fs: HB + bB - T2, bT_bs: bT, bA_fs: T2 + bT - HA };
      const base = HB + S.rand(-0.2, 0.2); const gx = S.rand(-0.01, 0.01), gy = S.rand(-0.01, 0.01);
      const Hg = {}; PTS.forEach(p => Hg[p] = base + gx * GRID[p][1] * 10 + gy * GRID[p][0] * 10 + S.rand(-0.15, 0.15));
      const gb = S.rnd(S.rand(1.2, 1.6), 3); perf.gB_bs = gb;
      PTS.forEach(p => perf['g' + p] = HB + gb - Hg[p]);
      const obs = {}; Object.keys(perf).forEach(k => obs[k] = S.rnd(perf[k] + S.noise(sg) + (level === 'blunder' && k === 'gJ' ? 0.012 : 0), 3));
      const Hd = S.rnd(Math.max(...PTS.map(p => Hg[p])) + S.rand(1.5, 3.5), 2);
      const t = { HB: S.rnd(HB, 3) }; PTS.forEach(p => t['H' + p] = S.rnd(Hg[p], 3));
      return { known: { HA, Hd, a: 10 }, obs, obsPerfect: perf, truthOverride: t, truthRecompute: true };
    },

    solve(V) {
      V.req('HA', 'Hd', 'fA_bs', 'fT_fs', 'fT_bs', 'fB_fs', 'bB_bs', 'bT_fs', 'bT_bs', 'bA_fs', 'gB_bs', ...PTS.map(p => 'g' + p));
      const a = isFinite(V('a')) && V('a') > 0 ? V('a') : 10;
      const fT_h = S.rnd(V('fA_bs') - V('fT_fs'), 3), fB_h = S.rnd(V('fT_bs') - V('fB_fs'), 3);
      const bT_h = S.rnd(V('bB_bs') - V('bT_fs'), 3), bA_h = S.rnd(V('bT_bs') - V('bA_fs'), 3);
      const hAB = S.rnd(fT_h + fB_h, 3), hBA = S.rnd(bT_h + bA_h, 3);
      const Wd = S.rnd(Math.abs(hAB + hBA), 3), hm = S.rnd((hAB - hBA) / 2, 3), HB = S.rnd(V('HA') + hm, 3);
      const HI = S.rnd(HB + V('gB_bs'), 3);
      const ans = { fT_h, fB_h, bT_h, bA_h, hAB, hBA, Wd, hm, HB, HIg: HI };
      PTS.forEach(p => ans['H' + p] = S.rnd(HI - V('g' + p), 3));
      const sums = [0, 0, 0, 0, 0]; const grp = { 1: [], 2: [], 3: [], 4: [] };
      PTS.forEach(p => { sums[W[p]] += ans['H' + p]; grp[W[p]].push(p); });
      const [s1, s2, s3, s4] = [1, 2, 3, 4].map(k => S.rnd(sums[k], 3));
      const n = CELLS.length;
      const Vol = S.rnd(a * a / 4 * (s1 + 2 * s2 + 3 * s3 + 4 * s4), 3);
      const short = S.rnd(a * a * n * V('Hd') - Vol, 3);
      const Hbal = S.rnd(Vol / (a * a * n), 3);
      Object.assign(ans, { s1, s2, s3, s4, Vol, nCell: n, short, Hbal });
      ans.__grid = PTS.map(p => ({ p, r: GRID[p][0], c: GRID[p][1], H: ans['H' + p], w: W[p] }));
      const n3 = x => S.fmtNum(x, 3);
      const steps = [
        E.step('① 往返水準', `hAB = (${n3(V('fA_bs'))} − ${n3(V('fT_fs'))}) + (${n3(V('fT_bs'))} − ${n3(V('fB_fs'))}) = <b>${S.fmtNum(hAB, 3, true)}</b>`,
          `hBA = (${n3(V('bB_bs'))} − ${n3(V('bT_fs'))}) + (${n3(V('bT_bs'))} − ${n3(V('bA_fs'))}) = <b>${S.fmtNum(hBA, 3, true)}</b>`,
          `W = |hAB + hBA| = <b>${n3(Wd)}</b> m；h̄AB = (hAB − hBA)/2 = ${S.fmtNum(hm, 3, true)}；HB = ${n3(V('HA'))} + ${S.fmtNum(hm, 3, true)} = <b>${n3(HB)}</b>`),
        E.step('② 方格點高程', `HI = HB + 後視 = ${n3(HB)} + ${n3(V('gB_bs'))} = <b>${n3(HI)}</b>`, PTS.map(p => `${p}=${n3(ans['H' + p])}`).join('、')),
        E.step('③ 土方', `Σh1 (${grp[1].join('')}) = ${n3(s1)}；Σh2 (${grp[2].join('')}) = ${n3(s2)}；Σh3 (${grp[3].join('')}) = ${n3(s3)}；Σh4 (${grp[4].join('')}) = ${n3(s4)}`,
          `V = (${a}×${a}/4) × (${n3(s1)} + ${n3(s2)}×2 + ${n3(s3)}×3 + ${n3(s4)}×4) = <b>${n3(Vol)}</b> m³`,
          `土方不足 V' = ${a}×${a}×${n}×${n3(V('Hd'))} − ${n3(Vol)} = <b>${n3(short)}</b> m³`,
          `挖填平衡 H' = ${n3(Vol)} / (${a}×${a}×${n}) = <b>${n3(Hbal)}</b> m`)
      ];
      return { ans, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 4, ctx));
      if (sol) {
        const w = Math.round(sol.Wd * 1000);
        items.push(E.item(2, '往返高程差之較差', 10, E.band(w, [[7, 10], [15, 5]]), 'obs', `|W| = ${w} mm`));
      }
      const ref = truth || sol;
      if (truth) {
        const e = E.errMM(V('HB'), truth.HB);
        items.push(E.item(3, 'B 點平均高程', 15, E.band(e, [[5, 15], [10, 8]]), 'obs', isFinite(e) ? `誤差 ${e} mm` : '未作答'));
        const r = E.subScore(PTS.map(p => ({ label: p, stu: V('H' + p), ref: truth['H' + p], kind: 'mm' })), [[5, 2], [8, 1]], 2);
        items.push(E.item(4, 'C~O 13 點高程', 26, r.got, 'obs', r.detail));
      } else {
        items.push(E.item(3, 'B 點平均高程', 15, 0, 'obs', '實測模式：需監評標準值', { na: true }));
        items.push(E.item(4, 'C~O 13 點高程', 26, 0, 'obs', '實測模式：需監評標準值', { na: true }));
      }
      if (ref) {
        const es = isFinite(V('short')) ? Math.abs(V('short') - ref.short) : NaN;
        items.push(E.item(5, '土方不足', 25, E.band(S.rnd(es, 3), [[3, 25], [6, 16], [9, 8]]), 'calc', isFinite(es) ? `誤差 ${S.fmtNum(es, 3)} m³` : '未作答'));
        const eh = E.errMM(V('Hbal'), ref.Hbal);
        items.push(E.item(6, '挖填平衡設計高程', 20, E.band(eh, [[5, 20], [8, 14], [11, 7]]), 'calc', isFinite(eh) ? `誤差 ${eh} mm` : '未作答'));
      }
      if (sol) {
        if (isFinite(V('hm')) && E.errMM(V('hm'), S.rnd((sol.hAB + sol.hBA) / 2, 3)) <= 1 && Math.abs(sol.hAB) > 0.01) hints.push({ lvl: 'bad', msg: '返測高程差 hBA 與往測符號相反，平均應為 (hAB − hBA)/2。' });
        const rect = S.rnd(V('a') * V('a') / 4 * PTS.reduce((s, p) => s + sol['H' + p] * (p === 'J' ? 4 : 2), 0), 3);
        if (isFinite(V('Vol')) && Math.abs(V('Vol') - sol.Vol) > 0.5) hints.push({ lvl: 'bad', msg: '體積權重：角點×1（C、D、H、L、M、O）、邊點×2（E、G、I、N）、凹角×3（F、K）、內點×4（J）。' });
        if (isFinite(V('short')) && Math.abs(V('short') + sol.short) < 0.1) hints.push({ lvl: 'bad', msg: '土方不足 = 設計所需體積 − 現況體積（a²·n·H設計 − V），符號相反。' });
        if (isFinite(V('Hbal')) && Math.abs(V('Hbal') - sol.Vol / (V('a') * V('a'))) < 0.01) hints.push({ lvl: 'bad', msg: '挖填平衡高程 = V / (a²·n)，須除以方格數 n。' });
        void rect;
      }
      return { items, hints };
    },

    draw(V, sol) {
      const Wd = 520, Hh = 400, s = 82, ox = 70, oy = 50;
      let g = E.gridBG(Wd, Hh);
      const gridH = sol ? sol.__grid : PTS.map(p => ({ p, r: GRID[p][0], c: GRID[p][1], H: NaN, w: W[p] }));
      const bal = sol ? sol.Hbal : NaN;
      CELLS.forEach(([r, c]) => {
        const hs = [[r, c], [r + 1, c], [r, c + 1], [r + 1, c + 1]].map(([a, b]) => gridH.find(q => q.r === a && q.c === b).H);
        const avg = hs.reduce((x, y) => x + y, 0) / 4;
        let fill = 'rgba(148,163,184,.15)';
        if (isFinite(avg) && isFinite(bal)) { const d = avg - bal; const k = Math.min(1, Math.abs(d) / 0.15); fill = d > 0 ? `rgba(234,88,12,${0.15 + 0.45 * k})` : `rgba(37,99,235,${0.15 + 0.45 * k})`; }
        g += `<rect x="${ox + c * s}" y="${oy + r * s}" width="${s}" height="${s}" fill="${fill}" stroke="#1e293b" stroke-width="1.5"/>`;
        if (isFinite(avg)) g += `<text x="${ox + c * s + s / 2}" y="${oy + r * s + s / 2 + 4}" text-anchor="middle" class="svg-lbl">${S.fmtNum(avg, 3)}</text>`;
      });
      gridH.forEach(q => {
        const x = ox + q.c * s, y = oy + q.r * s;
        g += `<circle cx="${x}" cy="${y}" r="6" fill="#f59e0b" stroke="#0f172a"/><text x="${x - 9}" y="${y - 9}" class="svg-pt" text-anchor="end">${q.p}</text>`;
        g += `<text x="${x + 8}" y="${y - 8}" class="svg-lbl" fill="#475569">×${q.w}</text>`;
        if (isFinite(q.H)) g += `<text x="${x + 8}" y="${y + 16}" class="svg-lbl" fill="#0f172a">${S.fmtNum(q.H, 3)}</text>`;
      });
      g += `<g transform="translate(${ox + 4 * s - 10},${oy + 6})"><circle r="7" fill="#1e293b"/><text x="12" y="4" class="svg-pt">B（後視）</text></g>`;
      g += `<text x="${ox}" y="${Hh - 18}" class="svg-lbl">方格 a = ${isFinite(V('a')) ? V('a') : 10} m；格內數字＝四角平均高程；${isFinite(bal) ? `橘＝高於平衡高程 ${S.fmtNum(bal, 3)}（挖）、藍＝低於（填）` : ''}</text>`;
      return E.wrapSVG(Wd, Hh, g);
    }
  };
  G.TK.register(task);
})(window);
