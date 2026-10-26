/* 試題一、閉合導線測量與計算 04202-1060201 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;

  const legs = ['AB', 'BC', 'CD', 'DA'];
  const legRow = n => [L(''), L(''), L(''), A('phi' + n, 'dms'), A('S_' + n, 'num', { d: 3 }), A('dE_' + n, 'num', { d: 3 }), A('vE_' + n, 'num', { d: 3, tol: 0.0021 }), A('dN_' + n, 'num', { d: 3 }), A('vN_' + n, 'num', { d: 3, tol: 0.0021 }), L(''), L('')];
  const ptRow = p => [L(p, { cls: 'pt' }), A('a' + p, 'dms'), A('v' + p, 'num', { d: 0, tol: 1.1, unit: '"' }), L(''), L(''), L(''), L(''), L(''), L(''), A('E' + p, 'num', { d: 3, tol: 0.0021 }), A('N' + p, 'num', { d: 3, tol: 0.0021 })];

  const task = {
    id: 1, code: '04202-1060201', title: '閉合導線測量與計算', short: '閉合導線', time: 60,
    ruleZeroIfMismatch: true,
    intro: {
      goal: '已知 A 點坐標、方位角 φAB、∠A、∠B、AB、DA（由辦理單位提供），應檢人於 C、D 點整置經緯儀觀測 ∠C、∠D 一測回，並往返量測 BC、CD，完成閉合導線計算（折角閉合差、坐標閉合差、閉合比數、B、C、D 坐標）。',
      field: [
        '於 C 點整置經緯儀（定心、定平），正鏡照準後視 B 點歸零附近（如 0°01\'00"）讀數，順時針照準 D 點讀數。',
        '倒鏡先照準 D、再照準 B（或依序）記錄讀數，完成一測回；同法於 D 點觀測 ∠D（後視 C、前視 A）。',
        '以鋼捲尺（或全測站）量測 BC、CD 距離各兩次（往返），記錄並取平均值。',
        '進入計算階段後方可領取已知資料，且不得再使用儀器。'
      ],
      calc: [
        '正倒鏡平均 = [正鏡 + (倒鏡 ± 180°)] / 2；改正後平均 = 前視平均 − 後視平均',
        '折角和理論值：外角 (n+2)×180°、內角 (n−2)×180°；本題 n=4 外角和 = 1080°',
        '折角閉合差 fw = Σβ − (n+2)×180°；每角改正數 v = −fw / n',
        '方位角推算：φ前 = φ後 + β(改正後) − 180°（超過 360° 減 360°，負值加 360°）',
        '橫距 ΔE = S·sinφ；縱距 ΔN = S·cosφ',
        '坐標閉合差 WE = ΣΔE、WN = ΣΔN；WL = √(WE² + WN²)',
        '閉合比數 = WL / ΣS = 1 / K；改正數（羅盤法則）vE = −WE·S / ΣS、vN = −WN·S / ΣS'
      ],
      pitfalls: [
        '倒鏡讀數須先 ±180° 再與正鏡平均；秒數不足時注意借位。',
        '改正數符號必定與閉合差相反，Σv = −fw、ΣvE = −WE、ΣvN = −WN。',
        '方位角推算時 β 須使用「改正後」折角，且推算回 φAB 須完全閉合作為檢核。',
        '觀測手簿數據與計算所用數據不符者，總分以零分計。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 4, '觀察應檢人員使用儀器是否正確，定心及定平是否準確。'],
      [2, '距離測量', 10, 'BC、CD 誤差在 ±2.0cm 以內各得 5 分，超出以零分計。'],
      [3, '角度觀測 ∠C 及 ∠D 是否正確', 20, '分別檢查：±15" 以內各 10 分；±16"~±30" 各 5 分；±31" 以上 0 分。'],
      [4, '方位角的推算是否正確', 10, '±30" 以內 10 分；±31"~±60" 5 分；±61" 以上 0 分。'],
      [5, '導線計算過程', 8, '公式及演算過程正確 2 分；折角閉合差、坐標閉合差、閉合比數計算正確各 2 分。'],
      [6, '縱橫坐標計算重奏', 48, 'B、C、D 之 N、E：1.0cm 內各 8 分；±1.1~2.0cm 6 分；±2.1~3.0cm 4 分；±3.1~4.0cm 2 分；±4.1cm 以上 0 分。'],
      [7, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [['C_B_L', 'C_B_R', 'h', 'C→B'], ['C_D_L', 'C_D_R', 'h', 'C→D'], ['D_C_L', 'D_C_R', 'h', 'D→C'], ['D_A_L', 'D_A_R', 'h', 'D→A']],
    layout: [
      {
        title: '已知資料（進入計算階段時由監評人員提供）', role: 'known', cols: 4,
        head: [['點號', '橫坐標 E (m)', '縱坐標 N (m)', '']],
        rows: [
          [L('A', { cls: 'pt' }), K('AE', 'num', { d: 3 }), K('AN', 'num', { d: 3 }), L('')],
          [L('方位角 φAB'), K('phiAB0', 'dms'), L('水平角 ∠A'), K('angA', 'dms')],
          [L('水平角 ∠B'), K('angB', 'dms'), L(''), L('')],
          [L('水平距離 AB (m)'), K('dAB', 'num', { d: 3 }), L('水平距離 DA (m)'), K('dDA', 'num', { d: 3 })]
        ]
      },
      {
        title: '1. 水平角觀測手簿', role: 'obs', book: true,
        head: [['測站', '測點', '正鏡讀數', '倒鏡讀數', '正倒鏡平均值', '改正後平均值']],
        rows: [
          [L('C', { rs: 2, cls: 'pt' }), L('B'), O('C_B_L', 'dms'), O('C_B_R', 'dms'), A('C_B_M', 'dms', { book: true }), L('0°00\'00"')],
          [L('D'), O('C_D_L', 'dms'), O('C_D_R', 'dms'), A('C_D_M', 'dms', { book: true }), A('angC', 'dms', { book: true })],
          [L('D', { rs: 2, cls: 'pt' }), L('C'), O('D_C_L', 'dms'), O('D_C_R', 'dms'), A('D_C_M', 'dms', { book: true }), L('0°00\'00"')],
          [L('A'), O('D_A_L', 'dms'), O('D_A_R', 'dms'), A('D_A_M', 'dms', { book: true }), A('angD', 'dms', { book: true })]
        ]
      },
      {
        title: '2. 距離觀測手簿', role: 'obs', book: true,
        head: [['測站', '測點', '第一次測量 (m)', '第二次測量 (m)', '平均值 (m)']],
        rows: [
          [L('B', { cls: 'pt' }), L('C'), O('BC1', 'num', { d: 3 }), O('BC2', 'num', { d: 3 }), A('BCm', 'num', { d: 3, book: true })],
          [L('C', { cls: 'pt' }), L('D'), O('CD1', 'num', { d: 3 }), O('CD2', 'num', { d: 3 }), A('CDm', 'num', { d: 3, book: true })]
        ]
      },
      {
        title: '答案紙：導線計算表', role: 'ans', wide: true,
        head: [['測點', '折角', '改正數(")', '方位角', '距離 S', '橫距 ΔE', '改正 vE', '縱距 ΔN', '改正 vN', '橫坐標 E', '縱坐標 N']],
        rows: [
          [L('A', { cls: 'pt' }), L(''), L(''), L(''), L(''), L(''), L(''), L(''), L(''), A('EA0', 'num', { d: 3 }), A('NA0', 'num', { d: 3 })],
          legRow('AB'), ptRow('B'), legRow('BC'), ptRow('C'), legRow('CD'), ptRow('D'), legRow('DA'),
          [L('A', { cls: 'pt' }), A('aA', 'dms'), A('vA', 'num', { d: 0, tol: 1.1 }), L(''), L(''), L(''), L(''), L(''), L(''), A('EA', 'num', { d: 3, tol: 0.0021 }), A('NA', 'num', { d: 3, tol: 0.0021 })],
          [L(''), L(''), L(''), A('phiAB2', 'dms'), L(''), L(''), L(''), L(''), L(''), L(''), L('')],
          [L('Σ', { cls: 'pt' }), A('sumAng', 'dms'), L(''), L(''), A('sumS', 'num', { d: 3 }), A('WE', 'num', { d: 3 }), L(''), A('WN', 'num', { d: 3 }), L(''), L(''), L('')]
        ]
      },
      {
        title: '答案紙：計算式項目', role: 'ans',
        head: [['項目', '數值', '項目', '數值']],
        rows: [
          [L('折角閉合差 fw (")'), A('fw', 'num', { d: 0, tol: 0.5 }), L('坐標閉合差 WL (m)'), A('WL', 'num', { d: 3, tol: 0.0015 })],
          [L('閉合比數 1 / K，K ='), A('K', 'num', { d: 0, tolRel: 0.02 }), L(''), L('')]
        ]
      }
    ],

    official() {
      const D = S.dmsToDeg;
      return {
        known: { AE: 100, AN: 200, phiAB0: D(97, 13, 30), angA: D(267, 25, 26), angB: D(273, 45, 6), dAB: 39.787, dDA: 39.5 },
        obs: {
          C_B_L: D(0, 1, 0), C_B_R: D(180, 0, 50), C_D_L: D(264, 46, 10), C_D_R: D(84, 45, 58),
          D_C_L: D(0, 1, 0), D_C_R: D(180, 0, 54), D_A_L: D(274, 5, 10), D_A_R: D(94, 5, 30),
          BC1: 38.506, BC2: 38.504, CD1: 39.055, CD2: 39.059
        }
      };
    },

    random(level) {
      const f = level === 'fine' ? 0.5 : level === 'blunder' ? 1 : 1;
      let P;
      for (let tries = 0; tries < 500; tries++) {
        const c = { N: S.rand(150, 900), E: S.rand(150, 900) };
        const angs = [135, 45, -45, -135].map(a => a + S.rand(-14, 14));
        P = angs.map(a => ({ N: c.N + S.rand(22, 33) * Math.sin(a * S.D2R), E: c.E + S.rand(22, 33) * Math.cos(a * S.D2R) }));
        const d = [0, 1, 2, 3].map(i => S.distNE(P[i], P[(i + 1) % 4]));
        if (d.every(x => x >= 30 && x <= 50)) break;
      }
      P = P.map(p => ({ N: S.rnd(p.N, 3), E: S.rnd(p.E, 3) }));
      const [pA, pB, pC, pD] = P;
      const az = (a, b) => S.azNE(a, b);
      const ang = (back, st, fwd) => S.norm360(az(st, fwd) - az(st, back));
      const t = {
        phiAB: az(pA, pB), angA: ang(pD, pA, pB), angB: ang(pA, pB, pC), angC: ang(pB, pC, pD), angD: ang(pC, pD, pA),
        dAB: S.distNE(pA, pB), dBC: S.distNE(pB, pC), dCD: S.distNE(pC, pD), dDA: S.distNE(pD, pA)
      };
      const known = {
        AE: pA.E, AN: pA.N,
        phiAB0: S.roundSec(t.phiAB), angA: S.roundSec(S.addSec(t.angA, S.noise(3 * f))), angB: S.roundSec(S.addSec(t.angB, S.noise(3 * f))),
        dAB: S.rnd(t.dAB + S.noise(0.0015 * f), 3), dDA: S.rnd(t.dDA + S.noise(0.0015 * f), 3)
      };
      const mkHz = (angTrue, sigma, blunder = 0) => {
        const L0 = S.roundSec(S.dmsToDeg(0, S.randInt(0, 5), S.pick([0, 0, 10, 20, 30, 40])));
        const c2 = S.noise(6 * f);
        const Lb = L0, Rb = S.norm360(L0 + 180 + (c2 + S.noise(sigma)) / 3600);
        const Lf = S.norm360(L0 + angTrue + (S.noise(sigma) + blunder) / 3600);
        const Rf = S.norm360(Lf + 180 + (c2 + S.noise(sigma)) / 3600);
        return [Lb, Rb, Lf, Rf].map(S.roundSec);
      };
      const bl = level === 'blunder' ? S.pick([45, -50, 60]) : 0;
      const [a1, a2, a3, a4] = mkHz(t.angC, 4 * f, bl);
      const [b1, b2, b3, b4] = mkHz(t.angD, 4 * f);
      const obs = {
        C_B_L: a1, C_B_R: a2, C_D_L: a3, C_D_R: a4, D_C_L: b1, D_C_R: b2, D_A_L: b3, D_A_R: b4,
        BC1: S.rnd(t.dBC + S.noise(0.002 * f), 3), BC2: S.rnd(t.dBC + S.noise(0.002 * f), 3),
        CD1: S.rnd(t.dCD + S.noise(0.002 * f), 3), CD2: S.rnd(t.dCD + S.noise(0.002 * f), 3)
      };
      const L0 = 0;
      const obsPerfect = {
        C_B_L: L0, C_B_R: 180, C_D_L: t.angC, C_D_R: S.norm360(t.angC + 180),
        D_C_L: L0, D_C_R: 180, D_A_L: t.angD, D_A_R: S.norm360(t.angD + 180),
        BC1: t.dBC, BC2: t.dBC, CD1: t.dCD, CD2: t.dCD
      };
      return { known, obs, obsPerfect, truthOverride: { EB: pB.E, NB: pB.N, EC: pC.E, NC: pC.N, ED: pD.E, ND: pD.N } };
    },

    solve(V) {
      V.req('AE', 'AN', 'phiAB0', 'angA', 'angB', 'dAB', 'dDA', 'C_B_L', 'C_B_R', 'C_D_L', 'C_D_R', 'D_C_L', 'D_C_R', 'D_A_L', 'D_A_R', 'BC1', 'BC2', 'CD1', 'CD2');
      const mCB = S.meanLR(V('C_B_L'), V('C_B_R')), mCD = S.meanLR(V('C_D_L'), V('C_D_R'));
      const mDC = S.meanLR(V('D_C_L'), V('D_C_R')), mDA = S.meanLR(V('D_A_L'), V('D_A_R'));
      const angC = S.roundSec(S.norm360(mCD - mCB)), angD = S.roundSec(S.norm360(mDA - mDC));
      const BCm = S.rnd((V('BC1') + V('BC2')) / 2, 3), CDm = S.rnd((V('CD1') + V('CD2')) / 2, 3);
      const angA = S.roundSec(V('angA')), angB = S.roundSec(V('angB'));
      const sum = angA + angB + angC + angD;
      const sumSec = Math.round(sum * 3600);
      const theo = Math.abs(sum - 1080) < Math.abs(sum - 360) ? 1080 : 360;
      const fw = sumSec - theo * 3600;
      const [vB, vC, vD, vA] = S.distribute(-fw, [1, 1, 1, 1]);
      const cB = angB + vB / 3600, cC = angC + vC / 3600, cD = angD + vD / 3600, cA = angA + vA / 3600;
      const phiAB = S.roundSec(V('phiAB0'));
      const phiBC = S.norm360(phiAB + cB - 180), phiCD = S.norm360(phiBC + cC - 180), phiDA = S.norm360(phiCD + cD - 180), phiAB2 = S.norm360(phiDA + cA - 180);
      const Ss = [V('dAB'), BCm, CDm, V('dDA')], phis = [phiAB, phiBC, phiCD, phiDA];
      const dE = Ss.map((s, i) => S.rnd(s * S.sinD(phis[i]), 3)), dN = Ss.map((s, i) => S.rnd(s * S.cosD(phis[i]), 3));
      const WE = S.rnd(dE.reduce((a, b) => a + b, 0), 3), WN = S.rnd(dN.reduce((a, b) => a + b, 0), 3);
      const sumS = S.rnd(Ss.reduce((a, b) => a + b, 0), 3);
      const WL = S.rnd(Math.hypot(WE, WN), 3);
      const Kr = WL > 0 ? Math.round(sumS / WL) : Infinity;
      const vE = S.distribute(-Math.round(WE * 1000), Ss).map(x => x / 1000), vN = S.distribute(-Math.round(WN * 1000), Ss).map(x => x / 1000);
      const pts = [{ E: V('AE'), N: V('AN') }];
      for (let i = 0; i < 4; i++) pts.push({ E: S.rnd(pts[i].E + dE[i] + vE[i], 3), N: S.rnd(pts[i].N + dN[i] + vN[i], 3) });
      const ans = {
        C_B_M: mCB, C_D_M: mCD, angC, D_C_M: mDC, D_A_M: mDA, angD, BCm, CDm,
        EA0: V('AE'), NA0: V('AN'), aA: angA, aB: angB, aC: angC, aD: angD, vA, vB, vC, vD,
        phiAB, phiBC, phiCD, phiDA, phiAB2,
        EB: pts[1].E, NB: pts[1].N, EC: pts[2].E, NC: pts[2].N, ED: pts[3].E, ND: pts[3].N, EA: pts[4].E, NA: pts[4].N,
        sumAng: sum, sumS, WE, WN, fw, WL, K: Kr,
        _theo: theo, _unadj: null
      };
      legs.forEach((n, i) => { ans['S_' + n] = Ss[i]; ans['dE_' + n] = dE[i]; ans['dN_' + n] = dN[i]; ans['vE_' + n] = vE[i]; ans['vN_' + n] = vN[i]; });
      // 未改正之導線（供閉合差示意）
      const un = [{ E: V('AE'), N: V('AN') }];
      for (let i = 0; i < 4; i++) un.push({ E: un[i].E + dE[i], N: un[i].N + dN[i] });
      ans._unadj = un; ans._adj = pts;
      const f = S.fmtDMS, n3 = x => S.fmtNum(x, 3);
      const steps = [
        E.step('① 正倒鏡平均與折角',
          `C 站：後視 B 平均 = ${f(mCB)}，前視 D 平均 = ${f(mCD)} → ∠C = ${f(mCD)} − ${f(mCB)} = <b>${f(angC)}</b>`,
          `D 站：後視 C 平均 = ${f(mDC)}，前視 A 平均 = ${f(mDA)} → ∠D = <b>${f(angD)}</b>`,
          `BC = (${n3(V('BC1'))} + ${n3(V('BC2'))}) / 2 = <b>${n3(BCm)}</b> m；CD = <b>${n3(CDm)}</b> m`),
        E.step('② 折角閉合差',
          `Σβ = ${f(angA)} + ${f(angB)} + ${f(angC)} + ${f(angD)} = ${f(sum)}`,
          `理論值 = ${theo === 1080 ? '(4+2)×180° = 1080°（外角）' : '(4−2)×180° = 360°（內角）'}`,
          `fw = <b>${fw > 0 ? '+' : ''}${fw}"</b>；改正數 vB=${vB}"、vC=${vC}"、vD=${vD}"、vA=${vA}"（Σv = −fw）`),
        E.step('③ 方位角推算 φ前 = φ後 + β − 180°',
          `φBC = ${f(phiAB)} + ${f(cB)} − 180° = <b>${f(phiBC)}</b>`,
          `φCD = ${f(phiBC)} + ${f(cC)} − 180° = <b>${f(phiCD)}</b>`,
          `φDA = ${f(phiCD)} + ${f(cD)} − 180° = <b>${f(phiDA)}</b>`,
          `檢核 φAB = ${f(phiDA)} + ${f(cA)} − 180° = ${f(phiAB2)} ${S.angDiffSec(phiAB2, phiAB) === 0 ? '✔ 閉合' : '✘'}`),
        E.step('④ 縱橫距與坐標閉合差',
          ...legs.map((n, i) => `${n}：ΔE = ${n3(Ss[i])}×sin${f(phis[i])} = ${n3(dE[i])}，ΔN = ${n3(Ss[i])}×cos${f(phis[i])} = ${n3(dN[i])}`),
          `WE = ΣΔE = <b>${S.fmtNum(WE, 3, true)}</b> m，WN = ΣΔN = <b>${S.fmtNum(WN, 3, true)}</b> m`,
          `WL = √(WE² + WN²) = ${n3(WL)} m；閉合比數 = ${n3(WL)} / ${n3(sumS)} = <b>1 / ${Kr}</b>`),
        E.step('⑤ 羅盤法則改正與坐標',
          ...legs.map((n, i) => `${n}：vE = ${S.fmtNum(vE[i], 3, true)}，vN = ${S.fmtNum(vN[i], 3, true)}`),
          `B (${n3(pts[1].E)}, ${n3(pts[1].N)})；C (${n3(pts[2].E)}, ${n3(pts[2].N)})；D (${n3(pts[3].E)}, ${n3(pts[3].N)})`,
          `回算 A (${n3(pts[4].E)}, ${n3(pts[4].N)}) 檢核閉合`)
      ];
      return { ans, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 4, ctx));
      if (truth) {
        let r = E.subScore([{ label: 'BC', stu: V('BCm'), ref: truth.BCm, kind: 'mm' }, { label: 'CD', stu: V('CDm'), ref: truth.CDm, kind: 'mm' }], [[20, 5]], 5);
        items.push(E.item(2, '距離測量', 10, r.got, 'obs', r.detail));
        r = E.subScore([{ label: '∠C', stu: V('angC'), ref: truth.angC, kind: 'sec' }, { label: '∠D', stu: V('angD'), ref: truth.angD, kind: 'sec' }], [[15, 10], [30, 5]], 10);
        items.push(E.item(3, '角度觀測 ∠C 及 ∠D', 20, r.got, 'obs', r.detail));
        const errs = ['phiBC', 'phiCD', 'phiDA'].map(k => E.errSec(V(k), truth[k]));
        const worst = errs.some(e => !isFinite(e)) ? NaN : Math.max(...errs);
        items.push(E.item(4, '方位角的推算', 10, E.band(worst, [[30, 10], [60, 5]]), 'calc', isFinite(worst) ? `φBC、φCD、φDA 最大誤差 ${worst}"` : '方位角未完整作答'));
      } else {
        ['距離測量', '角度觀測 ∠C 及 ∠D', '方位角的推算'].forEach((n, i) => items.push(E.item(i + 2, n, [10, 20, 10][i], 0, 'obs', '實測模式：需監評標準答案，未列入計分', { na: true })));
      }
      // 5 導線計算過程（與自身觀測計算比對）
      if (sol) {
        const filled = ['dE_AB', 'dN_AB', 'dE_BC', 'dN_BC', 'EB', 'NB', 'EC', 'NC'].every(k => isFinite(V(k)));
        const okFw = isFinite(V('fw')) && Math.abs(V('fw') - sol.fw) < 0.5;
        const okW = isFinite(V('WE')) && isFinite(V('WN')) && E.errMM(V('WE'), sol.WE) <= 1 && E.errMM(V('WN'), sol.WN) <= 1;
        const okK = isFinite(sol.K) ? (isFinite(V('K')) && Math.abs(V('K') - sol.K) / sol.K <= 0.02) : (!isFinite(V('K')) || V('K') > 1e6);
        const got = (filled ? 2 : 0) + (okFw ? 2 : 0) + (okW ? 2 : 0) + (okK ? 2 : 0);
        items.push(E.item(5, '導線計算過程', 8, got, 'calc', `演算過程 ${filled ? '✔' : '✘'}；折角閉合差 ${okFw ? '✔' : '✘'}（應為 ${sol.fw}"）；坐標閉合差 ${okW ? '✔' : '✘'}；閉合比數 ${okK ? '✔' : '✘'}（1/${sol.K}）`));
      } else items.push(E.item(5, '導線計算過程', 8, 0, 'calc', '觀測資料不完整，無法檢核'));
      if (truth) {
        const r = E.subScore(['B', 'C', 'D'].flatMap(p => [{ label: p + ' N', stu: V('N' + p), ref: truth['N' + p], kind: 'mm' }, { label: p + ' E', stu: V('E' + p), ref: truth['E' + p], kind: 'mm' }]), [[10, 8], [20, 6], [30, 4], [40, 2]], 8);
        items.push(E.item(6, '縱橫坐標計算', 48, r.got, 'calc', r.detail));
      } else items.push(E.item(6, '縱橫坐標計算', 48, 0, 'calc', '實測模式：需監評標準答案', { na: true }));

      // 常見踩雷提示
      if (sol) {
        const fwS = V('fw'), vs = ['vA', 'vB', 'vC', 'vD'].map(V);
        if (isFinite(fwS) && fwS !== 0 && vs.some(v => isFinite(v) && v !== 0 && Math.sign(v) === Math.sign(fwS)))
          hints.push({ lvl: 'bad', msg: '折角改正數符號應與閉合差 fw 相反（v = −fw / n）。' });
        if (isFinite(fwS) && Math.abs(fwS) > 3600) hints.push({ lvl: 'bad', msg: `折角閉合差過大：四邊形外角和理論值 (n+2)×180° = 1080°，內角和 (n−2)×180° = 360°，請確認所用理論值。` });
        ['phiBC', 'phiCD', 'phiDA'].forEach(k => {
          const raw = ctx.raw(k);
          if (isFinite(V(k)) && (V(k) >= 360 || V(k) < 0)) hints.push({ lvl: 'bad', msg: `方位角 ${k.replace('phi', 'φ')} = ${raw}：方位角推算請確認是否超過 360°（應減 360°）或為負值（應加 360°）。` });
        });
        const alt = S.norm360(sol.phiAB - (sol.aB + sol.vB / 3600) + 180);
        if (isFinite(V('phiBC')) && E.errSec(V('phiBC'), alt) <= 30 && E.errSec(V('phiBC'), sol.phiBC) > 30)
          hints.push({ lvl: 'bad', msg: 'φBC 推算方向錯誤：本題折角為後視起順時針量至前視（外角），公式為 φ前 = φ後 + β − 180°。' });
        if (isFinite(V('dE_AB')) && E.errMM(V('dE_AB'), S.rnd(sol.S_AB * S.cosD(sol.phiAB), 3)) <= 2 && E.errMM(V('dE_AB'), sol.dE_AB) > 2)
          hints.push({ lvl: 'bad', msg: '橫距、縱距疑似 sin/cos 互換：ΔE = S·sinφ、ΔN = S·cosφ。' });
        const vE = legs.map(n => V('vE_' + n));
        if (isFinite(sol.WE) && sol.WE !== 0 && vE.some(v => isFinite(v) && v !== 0 && Math.sign(v) === Math.sign(sol.WE)))
          hints.push({ lvl: 'bad', msg: '坐標改正數 vE 符號應與 WE 相反（ΣvE = −WE）。' });
        if (isFinite(sol.K) && sol.K < 5000) hints.push({ lvl: 'warn', msg: `閉合比數 1/${sol.K} 劣於一般導線參考精度 1/5000（教學參考值），請檢查角度觀測與距離量測。` });
        if (Math.abs(sol.fw) > 10 * Math.sqrt(4)) hints.push({ lvl: 'warn', msg: `折角閉合差 ${sol.fw}" 大於 ±10"√N = ±20"（教學參考值），可能有觀測異常。` });
      }
      return { items, hints };
    },

    draw(V, sol) {
      if (!sol) {
        const A0 = { id: 'A', N: V('AN'), E: V('AE') };
        return E.planSVG({ points: [A0] });
      }
      const p = sol._adj, un = sol._unadj;
      const pts = ['A', 'B', 'C', 'D'].map((id, i) => ({ id, N: p[i].N, E: p[i].E, color: i < 2 ? '#94a3b8' : '#f59e0b', label: id }));
      const ext = Math.max(...p.map(q => q.E)) - Math.min(...p.map(q => q.E));
      const WL = Math.hypot(sol.WE, sol.WN);
      let k = WL > 0 ? ext * 0.18 / WL : 0;
      const nice = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
      k = nice.reduce((a, b) => (b <= k ? b : a), 10);
      const mag = un.map((q, i) => ({ N: p[i].N + (q.N - p[i].N) * k, E: p[i].E + (q.E - p[i].E) * k }));
      const phis = [sol.phiAB, sol.phiBC, sol.phiCD, sol.phiDA];
      return E.planSVG({
        points: pts,
        polylines: [{ pts: [...mag], color: '#ef4444', dash: '5 4', w: 1.5 }],
        lines: [0, 1, 2, 3].map(i => ({ a: pts[i].id, b: pts[(i + 1) % 4].id, color: '#1e293b', w: 2.2, arrow: true, label: S.fmtDMS(phis[i]) })),
        extra: (P) => {
          if (!(WL > 0)) return '';
          const a = P(p[0]), b = P(mag[4]);
          return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#ef4444" stroke-width="2" marker-end="url(#arr)"/>
                  <text x="${b.x + 6}" y="${b.y + 14}" class="svg-lbl" fill="#ef4444">閉合差 WL=${S.fmtNum(WL, 3)}m（放大×${k}）</text>`;
        }
      });
    }
  };
  G.TK.register(task);
})(window);
