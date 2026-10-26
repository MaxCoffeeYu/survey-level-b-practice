/* 試題二、經緯儀前方交會測量 04202-1060202 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;

  const task = {
    id: 2, code: '04202-1060202', title: '經緯儀前方交會測量', short: '前方交會', time: 60,
    ruleZeroIfMismatch: true,
    intro: {
      goal: '已知導線點 A、B 坐標，應檢人分別於 A、B 設站觀測水平角 ∠A（A 站：C→B）及 ∠B（B 站：A→C）各一測回，以正弦定律計算 C 點坐標，並由 A、B 兩點分別推算後取平均。',
      field: [
        'A 點設站：正鏡照準 C 點（讀數置於 0°01\'00" 附近），順時針照準 B 點；倒鏡完成一測回。',
        'B 點設站：正鏡照準 A 點，順時針照準 C 點；倒鏡完成一測回。',
        '計算正倒鏡平均值及改正後平均值，得 ∠A、∠B，∠C = 180° − ∠A − ∠B。',
        '本題不可使用全測站之測距功能。'
      ],
      calc: [
        'AB = √[(NB−NA)² + (EB−EA)²]，φAB = tan⁻¹(ΔE/ΔN) 並依象限修正',
        'φAC = φAB − ∠A；φBC = φAB − 180° + ∠B（C 位於 A→B 左側）',
        '正弦定律：AC = AB·sin∠B / sin∠C；BC = AB·sin∠A / sin∠C',
        'C 點（由 A）：Ec = EA + AC·sinφAC，Nc = NA + AC·cosφAC',
        'C 點（由 B）：Ec = EB + BC·sinφBC，Nc = NB + BC·cosφBC',
        'C 點坐標平均值 Ec\' = (Ec₁ + Ec₂)/2、Nc\' = (Nc₁ + Nc₂)/2'
      ],
      pitfalls: [
        'tan⁻¹ 只給出 −90°~+90°，必須依 ΔE、ΔN 正負判斷象限（本例 ΔE<0、ΔN>0 屬第四象限，φ = 360° − 14°26\'30"）。',
        '∠A 由 C 起算順時針至 B，所以 φAC = φAB − ∠A；若寫成 + ∠A，C 點會落在 AB 另一側。',
        '由 A、B 兩點計算之 C 坐標應僅差 1~2 mm，差異過大代表計算錯誤。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 5, '觀察應檢人員使用儀器是否正確，定心及定平是否準確。'],
      [2, '水平角手簿記錄及計算是否正確', 5, '記錄簿是否清晰正確；若 ∠A、∠B 與觀測記錄不符者，第 3 項不給分。'],
      [3, '∠A 及 ∠B 誤差', 20, '±15" 以內各 10 分；±16"~±20" 6 分；±21"~±30" 3 分；±31" 以上 0 分。'],
      [4, '分別檢查 AB 及 φAB 計算是否正確', 10, '誤差在 ±5mm 或 ±5 秒以內者不扣分，超出者以零分計。'],
      [5, '分別檢查 φAC、AC、φBC、BC 計算程序', 10, '計算錯誤者，第 6 項不給分。'],
      [6, 'C 點之 E 及 N 坐標平均值之誤差', 50, '±2.0cm 以內各 25 分；±2.1~3.0cm 20 分；±3.1~4.0cm 15 分；±4.1~5.0cm 10 分；±5.1~6.0cm 5 分；±6.1cm 以上 0 分。'],
      [7, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [['A_C_L', 'A_C_R', 'h', 'A→C'], ['A_B_L', 'A_B_R', 'h', 'A→B'], ['B_A_L', 'B_A_R', 'h', 'B→A'], ['B_C_L', 'B_C_R', 'h', 'B→C']],
    layout: [
      {
        title: '已知資料（進入計算階段時提供）', role: 'known',
        head: [['點號', 'N 縱坐標 (m)', 'E 橫坐標 (m)']],
        rows: [
          [L('A', { cls: 'pt' }), K('AN', 'num', { d: 3 }), K('AE', 'num', { d: 3 })],
          [L('B', { cls: 'pt' }), K('BN', 'num', { d: 3 }), K('BE', 'num', { d: 3 })]
        ]
      },
      {
        title: '水平角觀測手簿', role: 'obs', book: true,
        head: [['測站', '測點', '正鏡讀數', '倒鏡讀數', '正倒鏡平均值', '改正後平均值']],
        rows: [
          [L('A', { rs: 2, cls: 'pt' }), L('C'), O('A_C_L', 'dms'), O('A_C_R', 'dms'), A('A_C_M', 'dms', { book: true }), L('0°00\'00"')],
          [L('B'), O('A_B_L', 'dms'), O('A_B_R', 'dms'), A('A_B_M', 'dms', { book: true }), A('angA', 'dms', { book: true })],
          [L('B', { rs: 2, cls: 'pt' }), L('A'), O('B_A_L', 'dms'), O('B_A_R', 'dms'), A('B_A_M', 'dms', { book: true }), L('0°00\'00"')],
          [L('C'), O('B_C_L', 'dms'), O('B_C_R', 'dms'), A('B_C_M', 'dms', { book: true }), A('angB', 'dms', { book: true })],
          [L('∠C = 180° − ∠A − ∠B', { cs: 5 }), A('angC', 'dms', { book: true })]
        ]
      },
      {
        title: '答案紙：計算距離、方位角及坐標', role: 'ans',
        head: [['項目', '計算結果', '', '']],
        rows: [
          [L('AB (m)'), A('dAB', 'num', { d: 3 }), L('φAB'), A('phiAB', 'dms')],
          [L('φAC'), A('phiAC', 'dms'), L('AC (m)'), A('dAC', 'num', { d: 3 })],
          [L('Ec（由A）'), A('EcA', 'num', { d: 3, tol: 0.0021 }), L('Nc（由A）'), A('NcA', 'num', { d: 3, tol: 0.0021 })],
          [L('φBC'), A('phiBC', 'dms'), L('BC (m)'), A('dBC', 'num', { d: 3 })],
          [L('Ec（由B）'), A('EcB', 'num', { d: 3, tol: 0.0021 }), L('Nc（由B）'), A('NcB', 'num', { d: 3, tol: 0.0021 })],
          [L('C 點 Ec\' 平均'), A('Ec', 'num', { d: 3, tol: 0.0021 }), L('C 點 Nc\' 平均'), A('Nc', 'num', { d: 3, tol: 0.0021 })]
        ]
      }
    ],

    official() {
      const D = S.dmsToDeg;
      return {
        known: { AN: 1000, AE: 1010, BN: 1038.83, BE: 1000 },
        obs: {
          A_C_L: D(0, 1, 0), A_C_R: D(180, 1, 19), A_B_L: D(72, 29, 3), A_B_R: D(252, 29, 17),
          B_A_L: D(0, 1, 0), B_A_R: D(180, 1, 8), B_C_L: D(75, 48, 34), B_C_R: D(255, 48, 44)
        }
      };
    },

    random(level) {
      const f = level === 'fine' ? 0.5 : 1;
      let pA, pB, pC, angA, angB;
      for (let i = 0; i < 500; i++) {
        pA = { N: S.rand(500, 2000), E: S.rand(500, 2000) };
        const az = S.rand(0, 360), d = S.rand(40, 60);
        pB = S.polar(pA, az, d);
        angA = S.rand(48, 78); angB = S.rand(48, 78);
        const C = 180 - angA - angB;
        const AC = d * S.sinD(angB) / S.sinD(C), BC = d * S.sinD(angA) / S.sinD(C);
        pC = S.polar(pA, S.norm360(az - angA), AC);
        if (AC >= 40 && AC <= 60 && BC >= 40 && BC <= 60) break;
      }
      pA = { N: S.rnd(pA.N, 3), E: S.rnd(pA.E, 3) }; pB = { N: S.rnd(pB.N, 3), E: S.rnd(pB.E, 3) }; pC = { N: S.rnd(pC.N, 3), E: S.rnd(pC.E, 3) };
      const tA = S.norm360(S.azNE(pA, pB) - S.azNE(pA, pC)), tB = S.norm360(S.azNE(pB, pC) - S.azNE(pB, pA));
      const bl = level === 'blunder' ? S.pick([40, -45]) : 0;
      const hz = (ang, b = 0) => {
        const L0 = S.dmsToDeg(0, S.randInt(0, 4), S.pick([0, 0, 30]));
        const c2 = S.noise(6 * f);
        return [L0, S.norm360(L0 + 180 + (c2 + S.noise(4 * f)) / 3600), S.norm360(L0 + ang + (S.noise(4 * f) + b) / 3600), 0].map(S.roundSec)
          .map((x, i, arr) => i === 3 ? S.roundSec(S.norm360(arr[2] + 180 + (c2 + S.noise(4 * f)) / 3600)) : x);
      };
      const [a1, a2, a3, a4] = hz(tA, bl), [b1, b2, b3, b4] = hz(tB);
      return {
        known: { AN: pA.N, AE: pA.E, BN: pB.N, BE: pB.E },
        obs: { A_C_L: a1, A_C_R: a2, A_B_L: a3, A_B_R: a4, B_A_L: b1, B_A_R: b2, B_C_L: b3, B_C_R: b4 },
        obsPerfect: { A_C_L: 0, A_C_R: 180, A_B_L: tA, A_B_R: S.norm360(tA + 180), B_A_L: 0, B_A_R: 180, B_C_L: tB, B_C_R: S.norm360(tB + 180) },
        truthOverride: { Ec: pC.E, Nc: pC.N }
      };
    },

    solve(V) {
      V.req('AN', 'AE', 'BN', 'BE', 'A_C_L', 'A_C_R', 'A_B_L', 'A_B_R', 'B_A_L', 'B_A_R', 'B_C_L', 'B_C_R');
      const mAC = S.meanLR(V('A_C_L'), V('A_C_R')), mAB = S.meanLR(V('A_B_L'), V('A_B_R'));
      const mBA = S.meanLR(V('B_A_L'), V('B_A_R')), mBC = S.meanLR(V('B_C_L'), V('B_C_R'));
      const angA = S.roundSec(S.norm360(mAB - mAC)), angB = S.roundSec(S.norm360(mBC - mBA));
      const angC = 180 - angA - angB;
      const pA = { N: V('AN'), E: V('AE') }, pB = { N: V('BN'), E: V('BE') };
      const dAB = S.rnd(S.distNE(pA, pB), 3);
      const phiAB = S.roundSec(S.azNE(pA, pB));
      const phiAC = S.norm360(phiAB - angA), phiBC = S.norm360(phiAB - 180 + angB);
      const dAC = S.rnd(dAB * S.sinD(angB) / S.sinD(angC), 3), dBC = S.rnd(dAB * S.sinD(angA) / S.sinD(angC), 3);
      const EcA = S.rnd(pA.E + dAC * S.sinD(phiAC), 3), NcA = S.rnd(pA.N + dAC * S.cosD(phiAC), 3);
      const EcB = S.rnd(pB.E + dBC * S.sinD(phiBC), 3), NcB = S.rnd(pB.N + dBC * S.cosD(phiBC), 3);
      const Ec = S.rnd((EcA + EcB) / 2, 3), Nc = S.rnd((NcA + NcB) / 2, 3);
      const f = S.fmtDMS, n3 = x => S.fmtNum(x, 3);
      const dE = pB.E - pA.E, dN = pB.N - pA.N;
      const base = S.roundSec(Math.abs(Math.atan(dE / dN)) * S.R2D);
      const quad = dN >= 0 ? (dE >= 0 ? '第一象限：φ = θ' : '第四象限：φ = 360° − θ') : (dE >= 0 ? '第二象限：φ = 180° − θ' : '第三象限：φ = 180° + θ');
      const steps = [
        E.step('① 水平角', `∠A = ${f(mAB)} − ${f(mAC)} = <b>${f(angA)}</b>`, `∠B = ${f(mBC)} − ${f(mBA)} = <b>${f(angB)}</b>`, `∠C = 180° − ∠A − ∠B = <b>${f(angC)}</b>`),
        E.step('② AB 距離與方位角', `AB = √[(${n3(pB.N)}−${n3(pA.N)})² + (${n3(pB.E)}−${n3(pA.E)})²] = <b>${n3(dAB)}</b> m`,
          `θ = tan⁻¹|ΔE/ΔN| = tan⁻¹|${n3(dE)}/${n3(dN)}| = ${f(base)}；ΔE${dE >= 0 ? '>' : '<'}0、ΔN${dN >= 0 ? '>' : '<'}0 → ${quad}`, `φAB = <b>${f(phiAB)}</b>`),
        E.step('③ 由 A 點計算 C', `φAC = φAB − ∠A = ${f(phiAB)} − ${f(angA)} = <b>${f(phiAC)}</b>`, `AC = AB·sin∠B / sin∠C = ${n3(dAB)}×sin${f(angB)} / sin${f(angC)} = <b>${n3(dAC)}</b> m`,
          `Ec = ${n3(pA.E)} + ${n3(dAC)}×sin${f(phiAC)} = <b>${n3(EcA)}</b>；Nc = ${n3(pA.N)} + ${n3(dAC)}×cos${f(phiAC)} = <b>${n3(NcA)}</b>`),
        E.step('④ 由 B 點計算 C', `φBC = φAB − 180° + ∠B = <b>${f(phiBC)}</b>`, `BC = AB·sin∠A / sin∠C = <b>${n3(dBC)}</b> m`,
          `Ec = ${n3(pB.E)} + ${n3(dBC)}×sin${f(phiBC)} = <b>${n3(EcB)}</b>；Nc = ${n3(pB.N)} + ${n3(dBC)}×cos${f(phiBC)} = <b>${n3(NcB)}</b>`),
        E.step('⑤ 平均', `Ec' = (${n3(EcA)} + ${n3(EcB)}) / 2 = <b>${n3(Ec)}</b>`, `Nc' = (${n3(NcA)} + ${n3(NcB)}) / 2 = <b>${n3(Nc)}</b>`)
      ];
      return { ans: { A_C_M: mAC, A_B_M: mAB, angA, B_A_M: mBA, B_C_M: mBC, angB, angC, dAB, phiAB, phiAC, dAC, EcA, NcA, phiBC, dBC, EcB, NcB, Ec, Nc }, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 5, ctx));
      const bookOk = sol && ['A_C_M', 'A_B_M', 'B_A_M', 'B_C_M', 'angA', 'angB'].every(k => E.errSec(V(k), sol[k]) <= 1);
      items.push(E.item(2, '水平角手簿記錄及計算', 5, bookOk ? 5 : 0, 'calc', bookOk ? '手簿平均值與改正後平均值正確' : '手簿平均值或 ∠A、∠B 與觀測記錄不符（第 3 項不給分）'));
      if (truth) {
        const r = E.subScore([{ label: '∠A', stu: V('angA'), ref: truth.angA, kind: 'sec' }, { label: '∠B', stu: V('angB'), ref: truth.angB, kind: 'sec' }], [[15, 10], [20, 6], [30, 3]], 10);
        items.push(E.item(3, '∠A 及 ∠B 誤差', 20, bookOk ? r.got : 0, 'obs', (bookOk ? '' : '【手簿不符，本項不給分】') + r.detail));
      } else items.push(E.item(3, '∠A 及 ∠B 誤差', 20, 0, 'obs', '實測模式：需監評標準答案', { na: true }));
      const ref = truth || sol;
      if (ref) {
        const okD = E.errMM(V('dAB'), ref.dAB) <= 5, okP = E.errSec(V('phiAB'), ref.phiAB) <= 5;
        items.push(E.item(4, 'AB 及 φAB 計算', 10, (okD ? 5 : 0) + (okP ? 5 : 0), 'calc', `AB ${okD ? '✔' : '✘'}（${S.fmtNum(ref.dAB, 3)}）；φAB ${okP ? '✔' : '✘'}（${S.fmtDMS(ref.phiAB)}）`));
      }
      let procOk = false;
      if (sol) {
        procOk = E.errSec(V('phiAC'), sol.phiAC) <= 2 && E.errMM(V('dAC'), sol.dAC) <= 2 && E.errSec(V('phiBC'), sol.phiBC) <= 2 && E.errMM(V('dBC'), sol.dBC) <= 2;
        items.push(E.item(5, 'φAC、AC、φBC、BC 計算程序', 10, procOk ? 10 : 0, 'calc', procOk ? '計算程序正確' : '計算有誤（第 6 項不給分）'));
      } else items.push(E.item(5, 'φAC、AC、φBC、BC 計算程序', 10, 0, 'calc', '觀測資料不完整'));
      if (truth) {
        const r = E.subScore([{ label: 'Ec\'', stu: V('Ec'), ref: truth.Ec, kind: 'mm' }, { label: 'Nc\'', stu: V('Nc'), ref: truth.Nc, kind: 'mm' }], [[20, 25], [30, 20], [40, 15], [50, 10], [60, 5]], 25);
        items.push(E.item(6, 'C 點 E、N 坐標平均值', 50, procOk ? r.got : 0, 'calc', (procOk ? '' : '【第 5 項計算錯誤，本項不給分】') + r.detail));
      } else items.push(E.item(6, 'C 點 E、N 坐標平均值', 50, 0, 'calc', '實測模式：需監評標準答案', { na: true }));

      if (sol) {
        const wrongSide = S.norm360(sol.phiAB + sol.angA);
        if (isFinite(V('phiAC')) && E.errSec(V('phiAC'), wrongSide) <= 5) hints.push({ lvl: 'bad', msg: 'φAC 應為 φAB − ∠A（∠A 係由 C 順時針量至 B），您使用了 φAB + ∠A，C 點會落在 AB 線另一側。' });
        const t = S.roundSec(Math.abs(Math.atan((V('BE') - V('AE')) / (V('BN') - V('AN')))) * S.R2D);
        if (isFinite(V('phiAB')) && (E.errSec(V('phiAB'), t) <= 5 || E.errSec(V('phiAB'), -t) <= 5) && E.errSec(V('phiAB'), sol.phiAB) > 5)
          hints.push({ lvl: 'bad', msg: '方位角未作象限修正：tan⁻¹ 只給 −90°~90°，請依 ΔE、ΔN 符號判斷象限。' });
        if (isFinite(V('dAC')) && E.errMM(V('dAC'), S.rnd(sol.dAB * S.sinD(sol.angA) / S.sinD(sol.angC), 3)) <= 2 && E.errMM(V('dAC'), sol.dAC) > 2)
          hints.push({ lvl: 'bad', msg: '正弦定律對邊錯置：AC 對應的是 ∠B，AC = AB·sin∠B / sin∠C。' });
        if (isFinite(V('EcA')) && isFinite(V('EcB')) && Math.abs(V('EcA') - V('EcB')) > 0.01) hints.push({ lvl: 'warn', msg: `由 A、B 兩點推算之 Ec 相差 ${S.fmtNum(Math.abs(V('EcA') - V('EcB')) * 1000, 0)} mm，理論上應僅差 1~2 mm，請檢查計算。` });
      }
      return { items, hints };
    },

    draw(V, sol) {
      const pA = { id: 'A', N: V('AN'), E: V('AE'), color: '#94a3b8' }, pB = { id: 'B', N: V('BN'), E: V('BE'), color: '#94a3b8' };
      if (!sol) return E.planSVG({ points: [pA, pB], lines: [{ a: 'A', b: 'B' }] });
      const pC = { id: 'C', N: sol.Nc, E: sol.Ec, color: '#f59e0b', label: `C (${S.fmtNum(sol.Nc, 3)}, ${S.fmtNum(sol.Ec, 3)})` };
      return E.planSVG({
        points: [pA, pB, pC],
        lines: [{ a: 'A', b: 'B', label: `AB=${S.fmtNum(sol.dAB, 3)}`, w: 2.5 }, { a: 'A', b: 'C', dash: '6 4', color: '#ea580c', label: `∠A=${S.fmtDMS(sol.angA)}` }, { a: 'B', b: 'C', dash: '6 4', color: '#ea580c', label: `∠B=${S.fmtDMS(sol.angB)}` }]
      });
    }
  };
  G.TK.register(task);
})(window);
