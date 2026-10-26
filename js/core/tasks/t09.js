/* 試題九、縱斷面水準測量與豎曲線設計高程之計算 04202-1060209 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;
  const P7 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  const task = {
    id: 9, code: '04202-1060209', title: '縱斷面水準測量與豎曲線設計高程之計算', short: '縱斷面豎曲線', time: 60,
    intro: {
      goal: '直線路線上 A~G 七樁（間距 20m，樁號 1k+000 ~ 1k+120）。於 P 點設站觀測 A、B、C、D，於 Q 點設站觀測 D、E、F、G，以已知 HA、HG 計算閉合差並改正，求 B~F 高程；再以對稱型豎曲線（A 為起點、G 為終點）計算設計高程及各樁挖填高度。',
      field: [
        'P 點設站：後視 A，間視 B、C，前視 D（轉點）。',
        'Q 點設站：後視 D，間視 E、F，前視 G。'
      ],
      calc: [
        '視準軸高程 HI = H後視點 + 後視讀數；H = HI − 前視（或間視）讀數',
        '閉合差 W = (HA + Σ後視 − Σ前視) − HG',
        '改正：將 −W 平均分配於 4 個後視/前視讀數（後視 A、前視 D、後視 D、前視 G），各讀數改正約 −W/4（四捨五入至 mm，總和 = −W）',
        '豎曲線設計高程（自 A 起算距離 x）：H(x) = H\'A + G1·x + (G2 − G1)·x² / (2L)',
        '挖填：樁頂高程 − 設計高程 > 0 為挖土，< 0 為填土'
      ],
      pitfalls: [
        '坡度以 % 給定，代入公式須 ÷100。',
        'G1、G2 可正可負，豎曲線不一定是凸型。',
        'B 點設計高程必須詳列計算式，否則 B 點以零分計。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 3, '觀察應檢人員使用儀器是否正確，定平是否準確。'],
      [2, '手簿記錄及計算是否正確', 2, '記錄是否清晰正確。'],
      [3, 'B、C、D、E、F 等樁頂之高程', 30, '須完成閉合差改正。±5mm 以內各 6 分；±6~±8mm 4 分；±9~±11mm 2 分；±12mm 以上 0 分。'],
      [4, 'B~G 等六點之設計高程', 30, '±3mm 以內各 5 分；±4mm 以上 0 分。'],
      [5, 'A~G 等七點之挖填土深度', 35, '±5mm 以內各 5 分；±6~±8mm 3 分；±9~±11mm 1 分；±12mm 以上 0 分。'],
      [6, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [],
    layout: [
      {
        title: '已知資料', role: 'known',
        head: [['項目', '數值', '項目', '數值']],
        rows: [
          [L('A 點高程 HA (m)'), K('HA', 'num', { d: 3 }), L('G 點高程 HG (m)'), K('HG', 'num', { d: 3 })],
          [L('A 點設計高程 (m)'), K('HpA', 'num', { d: 3 }), L('豎曲線長 L (m)'), K('Lv', 'num', { d: 1 })],
          [L('坡度 G1 (%)'), K('G1', 'num', { d: 2, signed: true }), L('坡度 G2 (%)'), K('G2', 'num', { d: 2, signed: true })],
          [L('A 點樁號'), K('staA', 'sta'), L('樁間距 (m)'), K('sp', 'num', { d: 1 })]
        ]
      },
      {
        title: '1. 縱斷面水準測量', role: 'obs', book: true, wide: true,
        head: [['點號', '後視', '後視改正', '視準軸高程', '前視（中間點）', '前視（轉點）', '轉點改正', '高程']],
        rows: [
          [L('A', { cls: 'pt' }), O('bsA', 'num', { d: 3 }), A('cbsA', 'num', { d: 3, signed: true }), A('HI1', 'num', { d: 3 }), L(''), L(''), L(''), A('H_A', 'num', { d: 3 })],
          [L('B', { cls: 'pt is' }), L(''), L(''), L(''), O('isB', 'num', { d: 3 }), L(''), L(''), A('HB', 'num', { d: 3 })],
          [L('C', { cls: 'pt is' }), L(''), L(''), L(''), O('isC', 'num', { d: 3 }), L(''), L(''), A('HC', 'num', { d: 3 })],
          [L('D', { cls: 'pt' }), O('bsD', 'num', { d: 3 }), A('cbsD', 'num', { d: 3, signed: true }), A('HI2', 'num', { d: 3 }), L(''), O('fsD', 'num', { d: 3 }), A('cfsD', 'num', { d: 3, signed: true }), A('HD', 'num', { d: 3 })],
          [L('E', { cls: 'pt is' }), L(''), L(''), L(''), O('isE', 'num', { d: 3 }), L(''), L(''), A('HE', 'num', { d: 3 })],
          [L('F', { cls: 'pt is' }), L(''), L(''), L(''), O('isF', 'num', { d: 3 }), L(''), L(''), A('HF', 'num', { d: 3 })],
          [L('G', { cls: 'pt' }), L(''), L(''), L(''), L(''), O('fsG', 'num', { d: 3 }), A('cfsG', 'num', { d: 3, signed: true }), A('HGc', 'num', { d: 3 })],
          [L('閉合差 W = (HA + Σb − Σf) − HG', { cs: 6 }), A('W', 'num', { d: 3, signed: true }), L('')]
        ]
      },
      {
        title: '2. 各樁位之挖填土深度', role: 'ans',
        head: [['樁號', '距 A (m)', '樁頂高程 (m)', '設計高程 (m)', '挖土深度 (m)', '填土高度 (m)']],
        rows: P7.map((p, i) => [L(p, { cls: 'pt' }), L(String(i * 20), { refX: i }), L('—', { ref: p === 'A' ? 'H_A' : p === 'G' ? 'HGc' : 'H' + p }), A('Hd' + p, 'num', { d: 3 }), A('cut' + p, 'num', { d: 3 }), A('fill' + p, 'num', { d: 3 })])
      }
    ],

    official() {
      return {
        known: { HA: 100, HG: 100.066, HpA: 99.9, G1: 0.7, G2: -0.5, Lv: 120, staA: 1000, sp: 20 },
        obs: { bsA: 1.03, isB: 1.02, isC: 1.01, fsD: 1.0, bsD: 1.04, isE: 1.03, isF: 1.02, fsG: 1.01 }
      };
    },

    random(level) {
      const sg = level === 'fine' ? 0.0006 : 0.0012;
      const HA = S.rnd(S.rand(20, 120), 3);
      const H = [HA]; for (let i = 1; i < 7; i++) H.push(H[i - 1] + S.rand(-0.12, 0.12));
      const G1 = S.pick([-1.2, -0.9, -0.7, -0.5, 0.5, 0.7, 0.9, 1.2]);
      let G2 = S.pick([-1.2, -0.9, -0.6, -0.4, 0.4, 0.6, 0.9, 1.2]); if (G2 === G1) G2 = -G1;
      const HpA = S.rnd(HA + S.rand(-0.2, 0.2), 3);
      const b1 = S.rnd(S.rand(1.1, 1.7), 3), b2 = S.rnd(S.rand(1.1, 1.7), 3);
      const HI1 = H[0] + b1, HI2 = H[3] + b2;
      const perf = { bsA: b1, isB: HI1 - H[1], isC: HI1 - H[2], fsD: HI1 - H[3], bsD: b2, isE: HI2 - H[4], isF: HI2 - H[5], fsG: HI2 - H[6] };
      const obs = {}; Object.keys(perf).forEach(k => obs[k] = S.rnd(perf[k] + S.noise(sg) + (level === 'blunder' && k === 'isC' ? 0.012 : 0), 3));
      const t = {}; ['B', 'C', 'D', 'E', 'F'].forEach((p, i) => t['H' + p] = S.rnd(H[i + 1], 3));
      return { known: { HA, HG: S.rnd(H[6], 3), HpA, G1, G2, Lv: 120, staA: 1000, sp: 20 }, obs, obsPerfect: perf, truthOverride: t };
    },

    solve(V) {
      V.req('HA', 'HG', 'HpA', 'G1', 'G2', 'Lv', 'bsA', 'isB', 'isC', 'fsD', 'bsD', 'isE', 'isF', 'fsG');
      const HA = V('HA'), sp = isFinite(V('sp')) && V('sp') > 0 ? V('sp') : 20;
      const sumB = V('bsA') + V('bsD'), sumF = V('fsD') + V('fsG');
      const W = S.rnd(HA + sumB - sumF - V('HG'), 3);
      // −W 依序分配於 後視A、前視D、後視D、前視G 四個讀數
      const tot = Math.round(-W * 1000); const cum = k => Math.sign(tot) * Math.round(Math.abs(tot) * k / 4 + 1e-9);
      const c = [1, 2, 3, 4].map(k => (cum(k) - cum(k - 1)) / 1000);
      const [cbsA, cfsD, cbsD, cfsG] = c;
      const HI1 = S.rnd(HA + V('bsA') + cbsA, 3);
      const HB = S.rnd(HI1 - V('isB'), 3), HC = S.rnd(HI1 - V('isC'), 3), HD = S.rnd(HI1 - V('fsD') + cfsD, 3);
      const HI2 = S.rnd(HD + V('bsD') + cbsD, 3);
      const HE = S.rnd(HI2 - V('isE'), 3), HF = S.rnd(HI2 - V('isF'), 3), HGc = S.rnd(HI2 - V('fsG') + cfsG, 3);
      const g1 = V('G1') / 100, g2 = V('G2') / 100, Lv = V('Lv');
      const Hg = [HA, HB, HC, HD, HE, HF, HGc];
      const ans = { cbsA, cfsD, cbsD, cfsG, HI1, HI2, H_A: HA, HB, HC, HD, HE, HF, HGc, W };
      const lines = [];
      P7.forEach((p, i) => {
        const x = i * sp;
        const Hd = S.rnd(V('HpA') + g1 * x + (g2 - g1) * x * x / (2 * Lv), 3);
        ans['Hd' + p] = Hd;
        const df = S.rnd(Hg[i] - Hd, 3);
        ans['cut' + p] = df > 0 ? df : (df === 0 ? 0 : NaN); ans['fill' + p] = df < 0 ? -df : NaN;
        if (i > 0) lines.push(`H${p} = ${S.fmtNum(V('HpA'), 3)} + ${S.fmtNum(V('G1'), 2, true)}%×${x} + (${S.fmtNum(V('G2'), 2, true)}% − ${S.fmtNum(V('G1'), 2, true)}%)×${x}²/(2×${Lv}) = <b>${S.fmtNum(Hd, 3)}</b>`);
      });
      ans.__prof = { Hg, Hd: P7.map(p => ans['Hd' + p]), sp };
      const n3 = x => S.fmtNum(x, 3);
      const steps = [
        E.step('① 閉合差', `W = (HA + Σb − Σf) − HG = (${n3(HA)} + ${n3(sumB)} − ${n3(sumF)}) − ${n3(V('HG'))} = <b>${S.fmtNum(W, 3, true)}</b> m`,
          `讀數改正（總和 −W）：後視A ${S.fmtNum(cbsA, 3, true)}、前視D ${S.fmtNum(cfsD, 3, true)}、後視D ${S.fmtNum(cbsD, 3, true)}、前視G ${S.fmtNum(cfsG, 3, true)}`),
        E.step('② 各樁高程', `HI₁ = ${n3(HA)} + ${n3(V('bsA'))} ${S.fmtNum(cbsA, 3, true)} = <b>${n3(HI1)}</b>；HB = ${n3(HI1)} − ${n3(V('isB'))} = ${n3(HB)}；HC = ${n3(HC)}`,
          `HD = ${n3(HI1)} − ${n3(V('fsD'))} ${S.fmtNum(cfsD, 3, true)} = <b>${n3(HD)}</b>；HI₂ = ${n3(HD)} + ${n3(V('bsD'))} ${S.fmtNum(cbsD, 3, true)} = <b>${n3(HI2)}</b>`,
          `HE = ${n3(HE)}；HF = ${n3(HF)}；HG = ${n3(HI2)} − ${n3(V('fsG'))} ${S.fmtNum(cfsG, 3, true)} = ${n3(HGc)}（= 已知 HG ✔）`),
        E.step('③ 豎曲線設計高程 H(x) = H\'A + G1·x + (G2−G1)·x²/(2L)', ...lines)
      ];
      return { ans, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 3, ctx));
      const bookOk = sol && ['HI1', 'HI2'].every(k => E.errMM(V(k), sol[k]) <= 1);
      items.push(E.item(2, '手簿記錄及計算', 2, bookOk ? 2 : 0, 'calc', bookOk ? '視準軸高程計算正確' : '視準軸高程有誤或未填'));
      const corrected = sol && isFinite(V('W')) && ['cbsA', 'cfsD', 'cbsD', 'cfsG'].some(k => isFinite(V(k)) && V(k) !== 0) || (sol && sol.W === 0);
      if (truth) {
        const r = E.subScore(['B', 'C', 'D', 'E', 'F'].map(p => ({ label: 'H' + p, stu: V('H' + p), ref: truth['H' + p], kind: 'mm' })), [[5, 6], [8, 4], [11, 2]], 6);
        items.push(E.item(3, 'B~F 樁頂高程', 30, corrected ? r.got : 0, 'obs', (corrected ? '' : '【未計算閉合差並完成改正，本項以零分計】') + r.detail));
      } else items.push(E.item(3, 'B~F 樁頂高程', 30, 0, 'obs', '實測模式：需監評標準值', { na: true }));
      const ref = truth || sol;
      if (ref) {
        let r = E.subScore(P7.slice(1).map(p => ({ label: p, stu: V('Hd' + p), ref: ref['Hd' + p], kind: 'mm' })), [[3, 5]], 5);
        items.push(E.item(4, 'B~G 設計高程', 30, r.got, 'calc', r.detail));
        r = E.subScore(P7.map(p => {
          const s = isFinite(V('cut' + p)) ? V('cut' + p) : (isFinite(V('fill' + p)) ? -V('fill' + p) : NaN);
          const rr = isFinite(ref['cut' + p]) ? ref['cut' + p] : -ref['fill' + p];
          return { label: p, stu: s, ref: rr, kind: 'mm' };
        }), [[5, 5], [8, 3], [11, 1]], 5);
        items.push(E.item(5, 'A~G 挖填土深度', 35, r.got, 'calc', r.detail));
      }
      if (sol) {
        const g1 = V('G1'), g2 = V('G2'), Lv = V('Lv'), x = 20;
        const wrongPct = S.rnd(V('HpA') + g1 * x + (g2 - g1) * x * x / (2 * Lv), 3);
        if (isFinite(V('HdB')) && E.errMM(V('HdB'), wrongPct) <= 1) hints.push({ lvl: 'bad', msg: '坡度 G1、G2 以 % 表示，代入公式須 ÷100。' });
        const noCurve = S.rnd(V('HpA') + g1 / 100 * x, 3);
        if (isFinite(V('HdB')) && E.errMM(V('HdB'), noCurve) <= 1 && E.errMM(noCurve, sol.HdB) > 1) hints.push({ lvl: 'bad', msg: '設計高程漏加豎曲線修正量 (G2−G1)x²/(2L)。' });
        const cs = ['cbsA', 'cfsD', 'cbsD', 'cfsG'].map(V).filter(isFinite);
        if (cs.length && sol.W !== 0 && cs.some(c => c !== 0 && Math.sign(c) === Math.sign(sol.W))) hints.push({ lvl: 'bad', msg: '讀數改正量符號應與閉合差 W 相反（Σ改正 = −W）。' });
        P7.forEach(p => { if (isFinite(sol['cut' + p]) && isFinite(V('fill' + p)) && !isFinite(V('cut' + p))) hints.push({ lvl: 'bad', msg: `${p} 點挖填判斷相反：樁頂高於設計為挖土。` }); });
      }
      return { items, hints };
    },

    draw(V, sol) {
      if (!sol) return E.emptySVG(520, 320, '完成計算後顯示縱斷面與豎曲線');
      const { Hg, sp } = sol.__prof;
      const g1 = V('G1') / 100, g2 = V('G2') / 100, Lv = V('Lv'), HpA = V('HpA');
      const curve = []; for (let x = 0; x <= Lv + 1e-6; x += Lv / 48) curve.push({ x, y: HpA + g1 * x + (g2 - g1) * x * x / (2 * Lv), r: 0.01 });
      const tang = [{ x: 0, y: HpA, r: 0.01 }, { x: Lv / 2, y: HpA + g1 * Lv / 2, r: 3, label: 'PVI' }, { x: Lv, y: HpA + g1 * Lv / 2 + g2 * Lv / 2, r: 0.01 }];
      return E.profileSVG({
        h: 340, yTitle: '高程 (m)', yDec: 3,
        xTicks: P7.map((p, i) => ({ x: i * sp, label: `${p} ${S.fmtSta(V('staA') + i * sp, 0)}` })),
        series: [{ name: '樁頂（地面）', color: '#1e293b', pts: P7.map((p, i) => ({ x: i * sp, y: Hg[i] })) },
          { name: '豎曲線設計', color: '#ea580c', pts: curve, marker: false },
          { name: '切線 G1/G2', color: '#94a3b8', dash: '5 4', w: 1.2, pts: tang }]
      });
    }
  };
  G.TK.register(task);
})(window);
