/* 試題六、水準儀視準軸誤差之檢查與附合水準測量 04202-1060206 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;
  const W3 = ['u', 'm', 'l'], WN = { u: '上絲', m: '中絲', l: '下絲' };
  const sights = [['p', 'E'], ['p', 'F'], ['q', 'F'], ['q', 'G']];

  const task = {
    id: 6, code: '04202-1060206', title: '水準儀視準軸誤差之檢查與附合水準測量', short: '視準軸＋附合水準', time: 60,
    intro: {
      goal: '以木樁校正法（定樁法）檢查監評指定之自動水準儀的視準軸誤差（不需校正），再於 E–F、F–G 間共二站（p、q）進行附合水準測量，以視距計算儀器至標尺距離，改正各中絲讀數之視準軸誤差，平差後求 F 點高程。',
      field: [
        '直線上 A、B、C、D 四點，AB = BC = CD = 25m。於 A 點整置水準儀，讀 B（25m）、C（50m）標尺；再於 D 點整置，讀 B（50m）、C（25m）。',
        '於 E、F 間（p）及 F、G 間（q）各設一站，讀取上、中、下三絲讀數（記錄至 0.001m），並以上下絲平均檢核中絲。',
        '不得只設一個儀器站觀測（未依規定扣 10 分）；完成觀測報告後才可開始內業計算。'
      ],
      calc: [
        '設視準軸誤差 x（"），偏上為正：讀數會偏大 d·x/ρ',
        '(aB − 25x/ρ) − (aC − 50x/ρ) = (dB − 50x/ρ) − (dC − 25x/ρ)',
        '⇒ x = [(dB − dC) − (aB − aC)] / 50 × 206265"',
        '視距 d = (上絲 − 下絲) × 100（乘常數 100、加常數 0）',
        '視準軸改正量 = −d·x / 206265"；改正後中絲 = 中絲 + 改正量',
        '附合閉合差 W = (HE + Σh) − HG；各站等權，改正數累積 −W·k/n'
      ],
      pitfalls: [
        '視準軸偏上（x 為正）時讀數偏大，改正量為「負」；符號錯誤會使高程差整體偏移。',
        '距離計算至 0.1m，改正量與改正後中絲計算至 0.001m。',
        '閉合差 W = 計算值 − 已知值；改正數符號與 W 相反。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 5, '觀察應檢人員使用儀器是否正確，定平是否準確。'],
      [2, '手簿記錄及計算是否正確', 5, '記錄是否清晰正確。'],
      [3, '水準儀視準軸誤差', 25, '正確詳列計算式，且與標準值相差 ±20"（含）以內 25 分；±21"~±30" 15 分；±31"（含）以上 0 分。'],
      [4, '分別檢查二站之高程差', 20, '正確改正中絲讀數，高程差相差 ±3mm 內各 10 分；±4~±5mm 7 分；±6~±7mm 3 分；±8mm（含）以上 0 分。'],
      [5, 'F 點之高程', 45, '相差 ±3mm 內 45 分；±4mm~±6mm 20 分；±7mm 以上 0 分。'],
      [6, '於 p 及 q 點觀測', 0, '未依規定者扣 10 分。'],
      [7, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [],
    layout: [
      {
        title: '已知資料', role: 'known',
        head: [['點號', '高程 (m)', '項目', '數值']],
        rows: [
          [L('E', { cls: 'pt' }), K('HE', 'num', { d: 3 }), L('AB=BC=CD (m)'), K('d0', 'num', { d: 1 })],
          [L('G', { cls: 'pt' }), K('HG', 'num', { d: 3 }), L('水準儀編號'), K('instNo', 'num', { d: 0 })]
        ]
      },
      {
        title: '1. 水準儀視準軸誤差之檢查（木樁校正法）', role: 'obs', book: true,
        head: [['水準儀位置', '水準尺', '讀數 (m)']],
        rows: [
          [L('A', { rs: 2, cls: 'pt' }), L('B（近 25m）'), O('A_B', 'num', { d: 3 })],
          [L('C（遠 50m）'), O('A_C', 'num', { d: 3 })],
          [L('D', { rs: 2, cls: 'pt' }), L('B（遠 50m）'), O('D_B', 'num', { d: 3 })],
          [L('C（近 25m）'), O('D_C', 'num', { d: 3 })]
        ]
      },
      {
        title: '2. 附合水準測量觀測（上、中、下絲）', role: 'obs', book: true,
        head: [['儀器位置', '水準尺', '絲', '讀數 (m)']],
        rows: sights.flatMap(([st, rod], i) => W3.map((w, j) => {
          const row = [];
          if (j === 0 && (i === 0 || i === 2)) row.push(L(st, { rs: 6, cls: 'pt' }));
          if (j === 0) row.push(L(rod, { rs: 3, cls: 'pt' }));
          row.push(L(WN[w]), O(`${st}${rod}${w}`, 'num', { d: 3 }));
          return row;
        }))
      },
      {
        title: '內業 1：視準軸誤差', role: 'ans',
        head: [['項目', '結果']],
        rows: [[L('視準軸誤差 x（"，偏上為 +）'), A('x', 'num', { d: 0, tol: 1.1, signed: true })]]
      },
      {
        title: '內業 2：距離與視準軸誤差改正', role: 'ans',
        head: [['儀器位置', '水準尺', '距離 (m)', '改正量 (m)', '改正後中絲 (m)']],
        rows: sights.map(([st, rod], i) => {
          const row = [];
          if (i === 0 || i === 2) row.push(L(st, { rs: 2, cls: 'pt' }));
          row.push(L(rod, { cls: 'pt' }), A(`dist_${st}${rod}`, 'num', { d: 1, tol: 0.15 }), A(`cor_${st}${rod}`, 'num', { d: 3, signed: true }), A(`mid_${st}${rod}`, 'num', { d: 3 }));
          return row;
        })
      },
      {
        title: '內業 3：附合水準測量之平差改正計算', role: 'ans',
        head: [['測點', '後視', '前視', '高程差 (m)', '高程計算值 (m)', '改正數 (m)', '改正後高程 (m)']],
        rows: [
          [L('E', { cls: 'pt' }), A('bsE', 'num', { d: 3 }), L(''), L(''), A('HcE', 'num', { d: 3 }), L('0.000'), A('HaE', 'num', { d: 3 })],
          [L('F', { cls: 'pt' }), A('bsF', 'num', { d: 3 }), A('fsF', 'num', { d: 3 }), A('h1', 'num', { d: 3, signed: true }), A('HcF', 'num', { d: 3 }), A('vF', 'num', { d: 3, signed: true }), A('HF', 'num', { d: 3 })],
          [L('G', { cls: 'pt' }), L(''), A('fsG', 'num', { d: 3 }), A('h2', 'num', { d: 3, signed: true }), A('HcG', 'num', { d: 3 }), A('vG', 'num', { d: 3, signed: true }), A('HaG', 'num', { d: 3 })],
          [L('閉合差 W (m)', { cs: 3 }), A('W', 'num', { d: 3, signed: true }), L('', { cs: 3 })]
        ]
      }
    ],

    official() {
      return {
        known: { HE: 50, HG: 52.506, d0: 25, instNo: 1 },
        obs: { A_B: 1.306, A_C: 1.112, D_B: 1.632, D_C: 1.426, pEu: 2.115, pEm: 2.005, pEl: 1.895, pFu: 1.147, pFm: 1.007, pFl: 0.867, qFu: 2.418, qFm: 2.258, qFl: 2.098, qGu: 0.96, qGm: 0.76, qGl: 0.56 }
      };
    },

    random(level) {
      const f = level === 'fine' ? 0.5 : 1;
      const x = S.pick([1, -1]) * S.randInt(30, 65), ex = d => d * x / S.RHO;
      const HB = S.rand(30, 80), HC = HB + S.rand(-0.3, 0.3);
      const HIa = HB + S.rand(1.1, 1.6), HId = HB + S.rand(1.1, 1.6);
      const n = s => S.noise(0.0005 * f * s);
      const obs = {
        A_B: S.rnd(HIa - HB + ex(25) + n(1), 3), A_C: S.rnd(HIa - HC + ex(50) + n(1), 3),
        D_B: S.rnd(HId - HB + ex(50) + n(1), 3), D_C: S.rnd(HId - HC + ex(25) + n(1), 3)
      };
      const obsPerfect = { A_B: HIa - HB + ex(25), A_C: HIa - HC + ex(50), D_B: HId - HB + ex(50), D_C: HId - HC + ex(25) };
      const HE = S.rnd(S.rand(20, 90), 3), HF = HE + S.rand(-1.2, 1.2), HG = S.rnd(HF + S.rand(-1.2, 1.2), 3);
      const Hs = { E: HE, F: HF, G: HG };
      const dist = { pE: S.randInt(180, 450) / 10, pF: S.randInt(180, 450) / 10, qF: S.randInt(180, 450) / 10, qG: S.randInt(180, 450) / 10 };
      const HIp = Math.max(HE, HF) + S.rand(0.6, 1.0), HIq = Math.max(HF, HG) + S.rand(0.6, 1.0);
      const bl = level === 'blunder' ? S.pick(['pF', 'qF']) : '';
      sights.forEach(([st, rod]) => {
        const k = st + rod, d = dist[k], HI = st === 'p' ? HIp : HIq;
        const mPerfect = HI - Hs[rod] + ex(d);
        const m = mPerfect + n(1.4) + (bl === k ? 0.01 : 0);
        const half = d / 200;
        obs[k + 'm'] = S.rnd(m, 3); obs[k + 'u'] = S.rnd(m + half + n(1), 3); obs[k + 'l'] = S.rnd(m - half + n(1), 3);
        obsPerfect[k + 'm'] = mPerfect; obsPerfect[k + 'u'] = mPerfect + half; obsPerfect[k + 'l'] = mPerfect - half;
      });
      return { known: { HE, HG, d0: 25, instNo: S.randInt(1, 6) }, obs, obsPerfect, truthOverride: { x, HF: S.rnd(HF, 3), h1: S.rnd(HF - HE, 3), h2: S.rnd(HG - HF, 3) } };
    },

    solve(V) {
      V.req('HE', 'HG', 'A_B', 'A_C', 'D_B', 'D_C', ...sights.flatMap(([s, r]) => W3.map(w => s + r + w)));
      const d0 = isFinite(V('d0')) && V('d0') > 0 ? V('d0') : 25;
      const diff = (V('D_B') - V('D_C')) - (V('A_B') - V('A_C'));
      const x = Math.round(diff / (2 * d0) * S.RHO);
      const ans = { x };
      const lines = [];
      sights.forEach(([st, rod]) => {
        const k = st + rod;
        const d = S.rnd((V(k + 'u') - V(k + 'l')) * 100, 1);
        const cor = S.rnd(-d * x / S.RHO, 3);
        const mid = S.rnd(V(k + 'm') + cor, 3);
        ans['dist_' + k] = d; ans['cor_' + k] = cor; ans['mid_' + k] = mid;
        lines.push(`${st}→${rod}：d = (${S.fmtNum(V(k + 'u'), 3)} − ${S.fmtNum(V(k + 'l'), 3)})×100 = ${S.fmtNum(d, 1)} m；改正量 = −${S.fmtNum(d, 1)}×${x}/206265 = ${S.fmtNum(cor, 3, true)}；改正後中絲 = <b>${S.fmtNum(mid, 3)}</b>`);
      });
      const lv = E.levelRoute([{ pt: 'E', bs: ans.mid_pE }, { pt: 'F', fs: ans.mid_pF, bs: ans.mid_qF }, { pt: 'G', fs: ans.mid_qG }], V('HE'), V('HG'));
      const [rE, rF, rG] = lv.rows;
      Object.assign(ans, { bsE: ans.mid_pE, bsF: ans.mid_qF, fsF: ans.mid_pF, fsG: ans.mid_qG, h1: rF.h, h2: rG.h, HcE: V('HE'), HaE: V('HE'), HcF: rF.Hc, HcG: rG.Hc, vF: rF.v, vG: rG.v, HF: rF.Ha, HaG: rG.Ha, W: lv.W });
      const n3 = v => S.fmtNum(v, 3);
      const steps = [
        E.step('① 視準軸誤差（定樁法）', `x = [(dB − dC) − (aB − aC)] / ${2 * d0} × 206265"`,
          `= [(${n3(V('D_B'))} − ${n3(V('D_C'))}) − (${n3(V('A_B'))} − ${n3(V('A_C'))})] / ${2 * d0} × 206265" = <b>${x > 0 ? '+' : ''}${x}"</b>（${x >= 0 ? '視準軸偏上' : '視準軸偏下'}）`),
        E.step('② 視距與中絲改正', ...lines),
        E.step('③ 附合水準平差', `h₁ = ${n3(ans.mid_pE)} − ${n3(ans.mid_pF)} = ${S.fmtNum(rF.h, 3, true)}；h₂ = ${n3(ans.mid_qF)} − ${n3(ans.mid_qG)} = ${S.fmtNum(rG.h, 3, true)}`,
          `W = (HE + Σh) − HG = ${n3(rG.Hc)} − ${n3(V('HG'))} = <b>${S.fmtNum(lv.W, 3, true)}</b> m`,
          `改正數（等權，每站 −W/2）：vF = ${S.fmtNum(rF.v, 3, true)}，vG = ${S.fmtNum(rG.v, 3, true)}`, `HF = ${n3(rF.Hc)} ${rF.v >= 0 ? '+' : '−'} ${n3(Math.abs(rF.v))} = <b>${n3(rF.Ha)}</b> m`)
      ];
      return { ans, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 5, ctx));
      let bookOk = true;
      sights.forEach(([s, r]) => { const k = s + r; if (Math.abs((V(k + 'u') + V(k + 'l')) / 2 - V(k + 'm')) > 0.003) bookOk = false; });
      items.push(E.item(2, '手簿記錄及計算', 5, bookOk && sol ? 5 : 0, 'obs', bookOk ? '上下絲平均與中絲檢核相符（±3mm）' : '有中絲讀數與（上絲+下絲）/2 相差超過 3mm，請檢查讀數'));
      if (truth) {
        const ex = isFinite(V('x')) ? Math.round(Math.abs(V('x') - truth.x)) : NaN;
        items.push(E.item(3, '水準儀視準軸誤差', 25, E.band(ex, [[20, 25], [30, 15]]), 'obs', isFinite(ex) ? `誤差 ${ex}"（標準值 ${truth.x > 0 ? '+' : ''}${truth.x}"）` : '未作答'));
        const r = E.subScore([{ label: 'h(E→F)', stu: V('h1'), ref: truth.h1, kind: 'mm' }, { label: 'h(F→G)', stu: V('h2'), ref: truth.h2, kind: 'mm' }], [[3, 10], [5, 7], [7, 3]], 10);
        items.push(E.item(4, '二站高程差', 20, r.got, 'obs', r.detail));
        const eF = E.errMM(V('HF'), truth.HF);
        items.push(E.item(5, 'F 點高程', 45, E.band(eF, [[3, 45], [6, 20]]), 'calc', isFinite(eF) ? `誤差 ${eF} mm` : '未作答'));
      } else {
        items.push(E.item(3, '水準儀視準軸誤差', 25, 0, 'obs', '實測模式：需監評標準值', { na: true }));
        items.push(E.item(4, '二站高程差', 20, 0, 'obs', '實測模式：需監評標準值', { na: true }));
        items.push(E.item(5, 'F 點高程', 45, 0, 'calc', '實測模式：需監評標準值', { na: true }));
      }
      if (sol) {
        if (isFinite(V('x')) && Math.abs(V('x') + sol.x) <= 1 && Math.abs(sol.x) > 3) hints.push({ lvl: 'bad', msg: '視準軸誤差正負號相反：x = [(dB−dC) − (aB−aC)]/50×ρ，正號表示偏上。' });
        const cors = sights.map(([s, r]) => V('cor_' + s + r));
        if (cors.some((c, i) => isFinite(c) && c !== 0 && sol.x !== 0 && Math.sign(c) === Math.sign(sol.x))) hints.push({ lvl: 'bad', msg: `本題 x = ${sol.x > 0 ? '+' : ''}${sol.x}"（視準軸${sol.x > 0 ? '偏上，讀數偏大，改正量應為負' : '偏下，讀數偏小，改正量應為正'}）：改正量 = −d·x/ρ，請檢查改正量符號。` });
        if (sights.some(([s, r]) => isFinite(V('dist_' + s + r)) && Math.abs(V('dist_' + s + r) - sol['dist_' + s + r] / 100) < 0.01)) hints.push({ lvl: 'bad', msg: '視距 = (上絲 − 下絲) × 100，請勿漏乘常數 100。' });
        if (isFinite(V('vF')) && sol.W !== 0 && Math.sign(V('vF')) === Math.sign(sol.W) && V('vF') !== 0) hints.push({ lvl: 'bad', msg: '改正數符號應與閉合差 W 相反。' });
        if (Math.abs(sol.W) > 0.010) hints.push({ lvl: 'warn', msg: `附合閉合差 ${S.fmtNum(sol.W * 1000, 0)} mm 偏大，請檢查讀數或視準軸改正。` });
      }
      return { items, hints };
    },

    draw(V, sol) {
      const x = sol ? sol.x : NaN;
      // 上：定樁法示意；下：附合水準剖面
      const W = 520, H = 170;
      let g = `<rect width="${W}" height="${H}" fill="var(--panel)"/>`;
      const X = [60, 180, 300, 420]; const yG = 130;
      g += `<line x1="30" y1="${yG}" x2="490" y2="${yG}" stroke="#64748b" stroke-width="2"/>`;
      ['A', 'B', 'C', 'D'].forEach((p, i) => { g += `<circle cx="${X[i]}" cy="${yG}" r="5" fill="#f59e0b" stroke="#0f172a"/><text x="${X[i]}" y="${yG + 20}" text-anchor="middle" class="svg-pt">${p}</text>`; if (i < 3) g += `<text x="${(X[i] + X[i + 1]) / 2}" y="${yG + 20}" text-anchor="middle" class="svg-lbl">25m</text>`; });
      [1, 2].forEach(i => g += `<rect x="${X[i] - 3}" y="40" width="6" height="${yG - 40}" fill="#fde68a" stroke="#92400e"/>`);
      const tilt = isFinite(x) ? Math.max(-8, Math.min(8, x / 8)) : 4;
      [[0, 1], [3, -1]].forEach(([i, dir]) => {
        const y0 = 70;
        g += `<rect x="${X[i] - 10}" y="${y0 - 6}" width="20" height="12" rx="2" fill="#1e293b"/><line x1="${X[i]}" y1="${y0 + 6}" x2="${X[i]}" y2="${yG}" stroke="#1e293b"/>`;
        const x2 = X[i] + dir * 260;
        g += `<line x1="${X[i]}" y1="${y0}" x2="${x2}" y2="${y0}" stroke="#16a34a" stroke-dasharray="4 3"/>`;
        g += `<line x1="${X[i]}" y1="${y0}" x2="${x2}" y2="${y0 - tilt * 3}" stroke="#ef4444" stroke-width="1.6"/>`;
      });
      g += `<text x="20" y="22" class="svg-lbl">綠虛線：水平視線　紅線：實際視準軸（誇大顯示）　x = ${isFinite(x) ? (x > 0 ? '+' : '') + x + '"' : '—'}</text>`;
      const top = E.wrapSVG(W, H, g);
      let prof = '';
      if (sol) {
        const dpE = sol.dist_pE, dpF = sol.dist_pF, dqF = sol.dist_qF, dqG = sol.dist_qG;
        const xs = [0, dpE + dpF, dpE + dpF + dqF + dqG];
        prof = E.profileSVG({
          h: 240, yTitle: '高程 (m)',
          series: [{ name: '改正後高程', color: '#ea580c', pts: [{ x: xs[0], y: V('HE'), label: 'E' }, { x: xs[1], y: sol.HF, label: 'F' }, { x: xs[2], y: sol.HaG, label: 'G' }] },
          { name: '未平差', color: '#94a3b8', dash: '5 4', pts: [{ x: xs[0], y: V('HE') }, { x: xs[1], y: sol.HcF }, { x: xs[2], y: sol.HcG }] }],
          xTicks: [{ x: xs[0], label: 'E' }, { x: dpE, label: 'p' }, { x: xs[1], label: 'F' }, { x: xs[1] + dqF, label: 'q' }, { x: xs[2], label: 'G' }]
        });
      }
      return `<div class="text-xs font-semibold text-slate-500 mb-1">木樁校正法（定樁法）</div>${top}${prof ? '<div class="text-xs font-semibold text-slate-500 mt-3 mb-1">附合水準路線 E → F → G</div>' + prof : ''}`;
    }
  };
  G.TK.register(task);
})(window);
