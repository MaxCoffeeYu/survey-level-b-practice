/* 試題四、光線法空間點位測量 04202-1060204 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;
  const T = ['A', 'B', 'C'];

  const task = {
    id: 4, code: '04202-1060204', title: '光線法空間點位測量', short: '空間點位', time: 80,
    intro: {
      goal: '三角形土地界址點 A、B、C 附近有已知點 P、Q。於監評指定之測站（P 或 Q）整置經緯儀，後視另一已知點，對 A、B、C 做水平角及垂直角一測回觀測並量距，計算三點坐標、面積（坪）、內角 ∠A、B 至 C 高程差與坡度、施工基面設計高程以上多餘土方量。',
      field: [
        '於指定測站整置經緯儀，量儀器高 i；正鏡後視另一已知點，依序照準 A、B、C 讀水平角與天頂距；倒鏡完成一測回。',
        '量測站至 A、B、C 水平距離各兩次；若照準稜鏡須量稜鏡高 t（照準鋼釘頂時 t = 0）。',
        '垂直角為俯角時須標明「−」符號。'
      ],
      calc: [
        'φ測站→後視 由坐標反算；φ測站→X = φ後視 + 水平角',
        'NX = N站 + d·cosφ；EX = E站 + d·sinφ',
        '面積（坐標法）A = ½|Σ Ni(Ei+1 − Ei−1)|；1 m² = 0.3025 坪',
        '∠A = φAC − φAB（取內角）',
        'HX = H站 + i + d·tanα − tX；ΔHBC = HC − HB；gBC = ΔHBC / BC × 100%',
        '土方量（三角柱體）ΔV = A/3 × [(HA−Hd) + (HB−Hd) + (HC−Hd)]'
      ],
      pitfalls: [
        '方位角相加超過 360° 須減 360°（例 75°57\'50" + 329°02\'10" = 405° → 45°）。',
        '面積單位換算：坪 = m² × 0.3025（不是除以 3.3058 後再四捨五入錯位）。',
        '坡度須帶正負號並計算至 0.01%；土方計算至 0.1 m³。',
        '測站至照準點距離小於 20m 時，水平角評分誤差放寬一倍。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 4, '觀察應檢人使用儀器是否正確，定心及定平是否準確。'],
      [2, '∠QPA、∠QPB、∠QPC（或 ∠PQA…）誤差', 24, '±15" 以內各 8 分；±16"~±20" 6 分；±21"~±30" 3 分；±31" 以上 0 分。距離 < 20m 誤差放寬一倍。'],
      [3, '水平距離誤差', 6, '±1cm 以內各 2 分；±1.1cm 以上 0 分。'],
      [4, 'A、B、C 三點 N 及 E 坐標', 18, '±2.0cm 以內各 3 分；±2.1~3.0cm 2 分；±3.1~4.0cm 1 分；±4.1cm 以上 0 分。'],
      [5, '△ABC 之面積', 6, '±0.50 坪以內 6 分；±0.51~1.00 坪 4 分；±1.01~1.50 坪 2 分；±1.51 坪以上 0 分。'],
      [6, '內角 ∠A', 6, '±30" 以內 6 分；±31"~±60" 3 分；±61" 以上 0 分。'],
      [7, '高程差 ΔHBC', 20, '±2.0cm 以內 20 分；±2.1~3.0cm 15 分；±3.1~4.0cm 10 分；±4.1~5.0cm 5 分；±5.1cm 以上 0 分。'],
      [8, 'B 至 C 的坡度', 10, '±0.15% 以內 10 分；±0.16%~±0.30% 5 分；±0.31% 以上 0 分。'],
      [9, '土方量', 6, '±5.0m³ 以內 6 分；±5.1~10.0m³ 4 分；±10.1~15.0m³ 2 分；±15.1m³ 以上 0 分。'],
      [10, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [['S_O_L', 'S_O_R', 'h', '後視'], ['S_A_L', 'S_A_R', 'h', '→A'], ['S_B_L', 'S_B_R', 'h', '→B'], ['S_C_L', 'S_C_R', 'h', '→C'], ['ZA_L', 'ZA_R', 'v', 'A 天頂距'], ['ZB_L', 'ZB_R', 'v', 'B 天頂距'], ['ZC_L', 'ZC_R', 'v', 'C 天頂距']],
    layout: [
      {
        title: '已知資料', role: 'known',
        head: [['點號', 'N 縱坐標 (m)', 'E 橫坐標 (m)', '高程 (m)']],
        rows: [
          [L('P', { cls: 'pt' }), K('PN', 'num', { d: 3 }), K('PE', 'num', { d: 3 }), K('PH', 'num', { d: 3 })],
          [L('Q', { cls: 'pt' }), K('QN', 'num', { d: 3 }), K('QE', 'num', { d: 3 }), K('QH', 'num', { d: 3 })],
          [L('施工基面設計高程 (m)', { cs: 2 }), K('Hd', 'num', { d: 3 }), L('')],
          [L('指定測站', { cs: 2 }), K('st', 'sel', { options: [['P', 'P（後視 Q）'], ['Q', 'Q（後視 P）']] }), L('')]
        ]
      },
      {
        title: '1. 水平角觀測記錄表', role: 'obs', book: true,
        head: [['測點', '正鏡讀數', '倒鏡讀數', '正倒鏡平均值', '改正後平均值']],
        rows: [
          [L('後視', { cls: 'pt' }), O('S_O_L', 'dms'), O('S_O_R', 'dms'), A('S_O_M', 'dms', { book: true }), L('0°00\'00"')],
          ...T.map(p => [L(p, { cls: 'pt' }), O(`S_${p}_L`, 'dms'), O(`S_${p}_R`, 'dms'), A(`S_${p}_M`, 'dms', { book: true }), A('ang' + p, 'dms', { book: true })])
        ]
      },
      {
        title: '2~4. 水平距離、儀器高、稜鏡高', role: 'obs', book: true,
        head: [['測點', '第一次 (m)', '第二次 (m)', '平均值 (m)', '稜鏡高 (m)']],
        rows: [
          ...T.map(p => [L(p, { cls: 'pt' }), O(`d${p}1`, 'num', { d: 3 }), O(`d${p}2`, 'num', { d: 3 }), A('d' + p, 'num', { d: 3, book: true }), O('t' + p, 'num', { d: 3 })]),
          [L('測站儀器高 i (m)', { cs: 2 }), O('iS', 'num', { d: 3 }), L('', { cs: 2 })]
        ]
      },
      {
        title: '5. 縱角觀測記錄表（俯角須標「−」）', role: 'obs', book: true,
        head: [['測點', '正鏡讀數', '倒鏡讀數', '天頂距平均值', '垂直角']],
        rows: T.map(p => [L(p, { cls: 'pt' }), O(`Z${p}_L`, 'dms'), O(`Z${p}_R`, 'dms'), A('Z' + p, 'dms', { book: true }), A('al' + p, 'dms', { signed: true, book: true })])
      },
      {
        title: '答案紙：內業計算', role: 'ans',
        head: [['點號', 'N 坐標 (m)', 'E 坐標 (m)', '高程 H (m)']],
        rows: [
          ...T.map(p => [L(p, { cls: 'pt' }), A('N' + p, 'num', { d: 3 }), A('E' + p, 'num', { d: 3 }), A('H' + p, 'num', { d: 3 })]),
          [L('△ABC 面積 (m²)'), A('aream2', 'num', { d: 2, tol: 0.02 }), L('面積（坪）'), A('area', 'num', { d: 2, tol: 0.011 })],
          [L('內角 ∠A'), A('angInA', 'dms', { tol: 2 }), L('BC 水平距 (m)'), A('dBC', 'num', { d: 3 })],
          [L('ΔHBC (m)'), A('dHBC', 'num', { d: 3, signed: true }), L('坡度 gBC (%)'), A('gBC', 'num', { d: 2, signed: true, tol: 0.011 })],
          [L('多餘土方量 ΔV (m³)'), A('dV', 'num', { d: 1, tol: 0.15 }), L(''), L('')]
        ]
      }
    ],

    official() {
      const D = S.dmsToDeg;
      return {
        known: { PN: 200, PE: 500, PH: 60, QN: 210, QE: 540, QH: 61, Hd: 60.2, st: 'P' },
        obs: {
          S_O_L: D(0, 5, 0), S_O_R: D(180, 5, 0), S_A_L: D(22, 14, 59), S_A_R: D(202, 14, 59), S_B_L: D(59, 7, 10), S_B_R: D(239, 7, 10), S_C_L: D(329, 7, 10), S_C_R: D(149, 7, 10),
          dA1: 35.355, dA2: 35.355, dB1: 14.142, dB2: 14.142, dC1: 28.284, dC2: 28.284, iS: 1.55, tA: 1.4, tB: 1.5, tC: 1.6,
          ZA_L: D(89, 29, 40), ZA_R: D(270, 30, 40), ZB_L: D(89, 20, 30), ZB_R: D(270, 39, 46), ZC_L: D(89, 10, 20), ZC_R: D(270, 49, 50)
        }
      };
    },

    random(level) {
      const f = level === 'fine' ? 0.5 : 1;
      let P, Q, pts;
      for (let i = 0; i < 2000; i++) {
        P = { N: S.rand(100, 900), E: S.rand(100, 900) };
        Q = S.polar(P, S.rand(0, 360), S.rand(36, 44));
        const c = { N: (P.N + Q.N) / 2 + S.rand(-15, 15), E: (P.E + Q.E) / 2 + S.rand(-15, 15) };
        const a0 = S.rand(0, 360);
        pts = [0, 1, 2].map(k => S.polar(c, a0 + k * 120 + S.rand(-25, 25), S.rand(16, 24)));
        // 順時針排列 A→B→C 不限；檢查邊長、內角、測站距離
        const d = [0, 1, 2].map(k => S.distNE(pts[k], pts[(k + 1) % 3]));
        const angOk = [0, 1, 2].every(k => {
          const a = pts[k], b = pts[(k + 1) % 3], cc = pts[(k + 2) % 3];
          let x = Math.abs(S.wrap180(S.azNE(a, b) - S.azNE(a, cc)));
          return x >= 30 && x <= 120;
        });
        const st = [P, Q].every(s => pts.every(p => S.distNE(s, p) < 48 && S.distNE(s, p) > 8));
        if (d.every(x => x >= 25 && x <= 40) && angOk && st) break;
      }
      const r3 = p => ({ N: S.rnd(p.N, 3), E: S.rnd(p.E, 3) });
      P = r3(P); Q = r3(Q); pts = pts.map(r3);
      const PH = S.rnd(S.rand(20, 120), 3), gx = S.rand(-0.02, 0.02), gy = S.rand(-0.02, 0.02);
      const Hof = p => PH + 0.3 + gx * (p.E - P.E) + gy * (p.N - P.N) + S.rand(-0.0, 0.0);
      const H = pts.map(Hof);
      const QH = S.rnd(Hof(Q) + S.rand(-0.3, 0.3), 3);
      const Hd = S.rnd(Math.min(...H) - S.rand(0.05, 0.5), 3);
      const stName = S.pick(['P', 'Q']); const St = stName === 'P' ? P : Q, Ob = stName === 'P' ? Q : P, HS = stName === 'P' ? PH : QH;
      const iS = S.rnd(S.rand(1.40, 1.62), 3);
      const t = pts.map(() => S.pick([0, S.rnd(S.rand(1.3, 1.7), 3)]));
      const known = { PN: P.N, PE: P.E, PH, QN: Q.N, QE: Q.E, QH, Hd, st: stName };
      const obs = {}, obsPerfect = {};
      const L0 = S.dmsToDeg(0, S.randInt(0, 6), 0), c2 = S.noise(5 * f), ie = S.noise(8);
      obs.S_O_L = L0; obs.S_O_R = S.roundSec(L0 + 180 + c2 / 3600); obsPerfect.S_O_L = 0; obsPerfect.S_O_R = 180;
      const bl = level === 'blunder' ? S.randInt(0, 2) : -1;
      T.forEach((p, k) => {
        const ang = S.norm360(S.azNE(St, pts[k]) - S.azNE(St, Ob));
        const d = S.distNE(St, pts[k]);
        const Lk = S.roundSec(S.norm360(L0 + ang + (S.noise(4 * f) + (bl === k ? 45 : 0)) / 3600));
        obs[`S_${p}_L`] = Lk; obs[`S_${p}_R`] = S.roundSec(S.norm360(Lk + 180 + (c2 + S.noise(3)) / 3600));
        obsPerfect[`S_${p}_L`] = ang; obsPerfect[`S_${p}_R`] = S.norm360(ang + 180);
        obs[`d${p}1`] = S.rnd(d + S.noise(0.002 * f), 3); obs[`d${p}2`] = S.rnd(d + S.noise(0.002 * f), 3);
        obsPerfect[`d${p}1`] = d; obsPerfect[`d${p}2`] = d;
        obs['t' + p] = t[k]; obsPerfect['t' + p] = t[k];
        const al = Math.atan((H[k] + t[k] - HS - iS) / d) * S.R2D;
        obs[`Z${p}_L`] = S.roundSec(90 - al + (ie + S.noise(4 * f)) / 3600); obs[`Z${p}_R`] = S.roundSec(270 + al + (ie + S.noise(4 * f)) / 3600);
        obsPerfect[`Z${p}_L`] = 90 - al; obsPerfect[`Z${p}_R`] = 270 + al;
      });
      obs.iS = iS; obsPerfect.iS = iS;
      return { known, obs, obsPerfect };
    },

    solve(V) {
      V.req('PN', 'PE', 'PH', 'QN', 'QE', 'QH', 'Hd', 'S_O_L', 'S_O_R', 'iS', ...T.flatMap(p => [`S_${p}_L`, `S_${p}_R`, `d${p}1`, `d${p}2`, 't' + p, `Z${p}_L`, `Z${p}_R`]));
      const st = V('st') === 'Q' ? 'Q' : 'P', ob = st === 'P' ? 'Q' : 'P';
      const pS = { N: V(st + 'N'), E: V(st + 'E') }, pO = { N: V(ob + 'N'), E: V(ob + 'E') }, HS = V(st + 'H');
      const mO = S.meanLR(V('S_O_L'), V('S_O_R'));
      const phiSO = S.roundSec(S.azNE(pS, pO));
      const ans = { S_O_M: mO }; const pts = {};
      const f = S.fmtDMS, n3 = x => S.fmtNum(x, 3);
      const lines1 = [`φ${st}${ob} = <b>${f(phiSO)}</b>`], lines4 = [];
      T.forEach(p => {
        const m = S.meanLR(V(`S_${p}_L`), V(`S_${p}_R`)); ans[`S_${p}_M`] = m;
        const ang = S.roundSec(S.norm360(m - mO)); ans['ang' + p] = ang;
        const d = S.rnd((V(`d${p}1`) + V(`d${p}2`)) / 2, 3); ans['d' + p] = d;
        const Z = S.zenithLR(V(`Z${p}_L`), V(`Z${p}_R`)), al = 90 - Z; ans['Z' + p] = Z; ans['al' + p] = al;
        const phi = S.norm360(phiSO + ang);
        const N = S.rnd(pS.N + d * S.cosD(phi), 3), Ee = S.rnd(pS.E + d * S.sinD(phi), 3);
        const H = S.rnd(HS + V('iS') + d * S.tanD(al) - V('t' + p), 3);
        ans['N' + p] = N; ans['E' + p] = Ee; ans['H' + p] = H; ans['phi' + p] = phi; pts[p] = { N, E: Ee };
        lines1.push(`φ${st}${p} = ${f(phiSO)} + ${f(ang)} ${phiSO + ang >= 360 ? '− 360°' : ''} = ${f(phi)}；N${p} = ${n3(pS.N)} + ${n3(d)}×cos${f(phi)} = <b>${n3(N)}</b>；E${p} = ${n3(pS.E)} + ${n3(d)}×sin${f(phi)} = <b>${n3(Ee)}</b>`);
        lines4.push(`H${p} = ${n3(HS)} + ${n3(V('iS'))} + ${n3(d)}×tan${f(al, { signed: true })} − ${n3(V('t' + p))} = <b>${n3(H)}</b>`);
      });
      const { A: a, B: b, C: c } = pts;
      const m2 = Math.abs(a.N * (b.E - c.E) + b.N * (c.E - a.E) + c.N * (a.E - b.E)) / 2;
      const aream2 = S.rnd(m2, 2), area = S.rnd(m2 * 0.3025, 2);
      const phiAB = S.azNE(a, b), phiAC = S.azNE(a, c);
      let angInA = S.norm360(phiAC - phiAB); if (angInA > 180) angInA = 360 - angInA; angInA = S.roundSec(angInA);
      const dHBC = S.rnd(ans.HC - ans.HB, 3), dBC = S.rnd(S.distNE(b, c), 3), gBC = S.rnd(dHBC / dBC * 100, 2);
      const Hd = V('Hd');
      const dV = S.rnd(m2 / 3 * ((ans.HA - Hd) + (ans.HB - Hd) + (ans.HC - Hd)), 1);
      Object.assign(ans, { aream2, area, angInA, dHBC, dBC, gBC, dV, _st: st });
      const steps = [
        E.step('① 測站方位角與 A、B、C 坐標', ...lines1),
        E.step('② 面積（坐標法）', `A = ½|NA(EB−EC) + NB(EC−EA) + NC(EA−EB)| = <b>${S.fmtNum(m2, 2)}</b> m²`, `${S.fmtNum(m2, 2)} × 0.3025 = <b>${S.fmtNum(area, 2)}</b> 坪`),
        E.step('③ 內角 ∠A', `φAB = ${f(phiAB)}，φAC = ${f(phiAC)}`, `∠A = |φAC − φAB| = <b>${f(angInA)}</b>`),
        E.step('④ 高程（三角高程）', `H = H站 + i + d·tanα − t`, ...lines4),
        E.step('⑤ 高程差、坡度、土方', `ΔHBC = HC − HB = ${n3(ans.HC)} − ${n3(ans.HB)} = <b>${S.fmtNum(dHBC, 3, true)}</b> m`,
          `BC = ${n3(dBC)} m；gBC = ΔHBC / BC × 100% = <b>${S.fmtNum(gBC, 2, true)}%</b>`,
          `ΔV = ${S.fmtNum(m2, 2)}/3 × [(${n3(ans.HA)}−${n3(Hd)}) + (${n3(ans.HB)}−${n3(Hd)}) + (${n3(ans.HC)}−${n3(Hd)})] = <b>${S.fmtNum(dV, 1)}</b> m³`)
      ];
      return { ans, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 4, ctx));
      const na = n => E.item(n[0], n[1], n[2], 0, n[3], '實測模式：需監評標準答案', { na: true });
      if (truth) {
        let got = 0; const det = [];
        T.forEach(p => {
          const e = E.errSec(V('ang' + p), truth['ang' + p]); const k = truth['d' + p] < 20 ? 2 : 1;
          const pts = isFinite(V('ang' + p)) ? E.band(e, [[15 * k, 8], [20 * k, 6], [30 * k, 3]]) : 0; got += pts;
          det.push(`∠${p}：${isFinite(e) ? e + '"' : '未作答'}${k === 2 ? '（<20m 放寬）' : ''} → ${pts}/8`);
        });
        items.push(E.item(2, '水平角誤差', 24, got, 'obs', det.join('；')));
        let r = E.subScore(T.map(p => ({ label: p, stu: V('d' + p), ref: truth['d' + p], kind: 'mm' })), [[10, 2]], 2);
        items.push(E.item(3, '水平距離誤差', 6, r.got, 'obs', r.detail));
        r = E.subScore(T.flatMap(p => [{ label: p + ' N', stu: V('N' + p), ref: truth['N' + p], kind: 'mm' }, { label: p + ' E', stu: V('E' + p), ref: truth['E' + p], kind: 'mm' }]), [[20, 3], [30, 2], [40, 1]], 3);
        items.push(E.item(4, 'A、B、C 三點坐標', 18, r.got, 'calc', r.detail));
        const ea = isFinite(V('area')) ? Math.abs(V('area') - truth.area) : NaN;
        items.push(E.item(5, '△ABC 面積', 6, E.band(S.rnd(ea, 2), [[0.5, 6], [1.0, 4], [1.5, 2]]), 'calc', isFinite(ea) ? `誤差 ${S.fmtNum(ea, 2)} 坪` : '未作答'));
        const eA = E.errSec(V('angInA'), truth.angInA);
        items.push(E.item(6, '內角 ∠A', 6, E.band(eA, [[30, 6], [60, 3]]), 'calc', isFinite(eA) ? `誤差 ${eA}"` : '未作答'));
        const eh = E.errMM(V('dHBC'), truth.dHBC);
        items.push(E.item(7, '高程差 ΔHBC', 20, E.band(eh, [[20, 20], [30, 15], [40, 10], [50, 5]]), 'calc', isFinite(eh) ? `誤差 ${eh} mm` : '未作答'));
        const eg = isFinite(V('gBC')) ? S.rnd(Math.abs(V('gBC') - truth.gBC), 2) : NaN;
        items.push(E.item(8, 'B 至 C 坡度', 10, E.band(eg, [[0.15, 10], [0.30, 5]]), 'calc', isFinite(eg) ? `誤差 ${S.fmtNum(eg, 2)}%` : '未作答'));
        const ev = isFinite(V('dV')) ? S.rnd(Math.abs(V('dV') - truth.dV), 1) : NaN;
        items.push(E.item(9, '土方量', 6, E.band(ev, [[5, 6], [10, 4], [15, 2]]), 'calc', isFinite(ev) ? `誤差 ${S.fmtNum(ev, 1)} m³` : '未作答'));
      } else {
        [[2, '水平角誤差', 24, 'obs'], [3, '水平距離誤差', 6, 'obs'], [4, 'A、B、C 三點坐標', 18, 'calc'], [5, '△ABC 面積', 6, 'calc'], [6, '內角 ∠A', 6, 'calc'], [7, '高程差 ΔHBC', 20, 'calc'], [8, 'B 至 C 坡度', 10, 'calc'], [9, '土方量', 6, 'calc']].forEach(n => items.push(na(n)));
      }
      if (sol) {
        if (isFinite(V('area')) && Math.abs(V('area') - sol.aream2) < 0.02 && Math.abs(sol.aream2 - sol.area) > 0.1) hints.push({ lvl: 'bad', msg: '面積單位：答案須以「坪」表示，坪 = m² × 0.3025。' });
        if (isFinite(V('area')) && Math.abs(V('area') - sol.aream2 / 0.3025) < 0.05) hints.push({ lvl: 'bad', msg: '坪換算方向錯誤：1 m² = 0.3025 坪（應乘 0.3025，而非除）。' });
        if (isFinite(V('gBC')) && Math.abs(V('gBC') + sol.gBC) < 0.011 && Math.abs(sol.gBC) > 0.02) hints.push({ lvl: 'bad', msg: '坡度正負號相反：B 至 C 坡度 = (HC − HB)/BC，上坡為正。' });
        if (isFinite(V('gBC')) && Math.abs(V('gBC') - sol.gBC / 100) < 0.0011 && Math.abs(sol.gBC) > 0.05) hints.push({ lvl: 'bad', msg: '坡度須以百分比（%）表示，記得 ×100%。' });
        if (isFinite(V('dV')) && Math.abs(V('dV') - sol.dV * 3) < 0.3) hints.push({ lvl: 'bad', msg: '土方量 = 面積/3 × Σ(H − Hd)（三角柱體取三點平均高），您可能漏除 3。' });
        T.forEach(p => { if (isFinite(V('phi' + p)) && V('phi' + p) >= 360) hints.push({ lvl: 'bad', msg: '方位角超過 360° 應減 360°。' }); });
        T.forEach(p => {
          const noT = S.rnd(sol['H' + p] + V('t' + p), 3);
          if (V('t' + p) > 0 && isFinite(V('H' + p)) && E.errMM(V('H' + p), noT) <= 2) hints.push({ lvl: 'bad', msg: `H${p} 疑似未扣除稜鏡高 t${p}。` });
        });
      }
      return { items, hints };
    },

    draw(V, sol) {
      const st = V('st') === 'Q' ? 'Q' : 'P';
      const P = { id: 'P', N: V('PN'), E: V('PE'), color: st === 'P' ? '#1e293b' : '#94a3b8' }, Q = { id: 'Q', N: V('QN'), E: V('QE'), color: st === 'Q' ? '#1e293b' : '#94a3b8' };
      if (!sol) return E.planSVG({ points: [P, Q], lines: [{ a: 'P', b: 'Q', dash: '4 3' }] });
      const pts = T.map(p => ({ id: p, N: sol['N' + p], E: sol['E' + p], label: `${p} H=${S.fmtNum(sol['H' + p], 3)}` }));
      return E.planSVG({
        points: [P, Q, ...pts],
        polylines: [{ pts: ['A', 'B', 'C', 'A'], color: '#ea580c', w: 2.5, fill: 'rgba(245,158,11,.15)' }],
        lines: [{ a: 'P', b: 'Q', dash: '4 3', color: '#64748b' }, ...T.map(p => ({ a: st, b: p, color: '#94a3b8', dash: '2 3', w: 1.2 }))],
        extra: Pj => {
          const c = Pj({ N: (sol.NA + sol.NB + sol.NC) / 3, E: (sol.EA + sol.EB + sol.EC) / 3 });
          return `<text x="${c.x}" y="${c.y}" text-anchor="middle" class="svg-lbl" fill="#9a3412">${S.fmtNum(sol.area, 2)} 坪</text><text x="${c.x}" y="${c.y + 15}" text-anchor="middle" class="svg-lbl">gBC ${S.fmtNum(sol.gBC, 2, true)}%</text>`;
        }
      });
    }
  };
  G.TK.register(task);
})(window);
