/* 試題三、光線法及間接高程測量 04202-1060203 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;

  const task = {
    id: 3, code: '04202-1060203', title: '光線法及間接高程測量', short: '光線法高程', time: 60,
    intro: {
      goal: '已知 A、B 兩點平面坐標及 A 點高程、A 與 C 之覘標高 IA、IC。應檢人於 B 點架設經緯儀，觀測 A、C 之天頂距（正倒鏡）、水平角 ∠ABC 及水平距 BC，計算垂直角、AB、C 點平面坐標與高程。',
      field: [
        'B 點整置經緯儀，正鏡照準 A 點覘標讀天頂距，再照準 C 點覘標讀天頂距；倒鏡同法。',
        '水平角：正鏡照準 A（後視），順時針照準 C；倒鏡完成一測回。',
        '以鋼捲尺或電子測距量測水平距 BC。',
        '儀器高 iB 不需量測：由 A 點反算「HB + iB」（視準軸高程）即可。'
      ],
      calc: [
        '天頂距 Z = (正鏡 − 倒鏡 + 360°) / 2；垂直角 α = 90° − Z',
        'AB 由坐標反算；φBA 由坐標反算，φBC = φBA + ∠ABC',
        'NC = NB + BC·cosφBC；EC = EB + BC·sinφBC',
        'HA + IA = (HB + iB) + AB·tanαA  ⇒  HB + iB = HA + IA − AB·tanαA',
        'HC = (HB + iB) + BC·tanαC − IC'
      ],
      pitfalls: [
        '仰角 α 為正、俯角為負；Z > 90° 時 α 為負值，tanα 亦為負。',
        '覘標高 IA、IC 的加減方向：照準點的覘標高須「扣除」才得地面高程。',
        '指標差 = (正 + 倒 − 360°)/2，使用正倒鏡平均可自動消除。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 5, '觀察應檢人員使用儀器是否正確，定心及定平是否準確。'],
      [2, '∠ABC 之誤差', 20, '±15" 以內 20 分；±16"~±20" 15 分；±21"~±25" 10 分；±26"~±30" 5 分；±31" 以上 0 分。'],
      [3, 'BC 之誤差', 5, '±2.0cm 以內 5 分，超出以零分計。'],
      [4, '檢查 AB 計算是否正確', 5, '±5mm 以內 5 分，超出以零分計。'],
      [5, 'C 點 N 及 E 坐標之誤差', 30, '±2.0cm 以內各 15 分；±2.1~3.0cm 10 分；±3.1~4.0cm 5 分；±4.1cm 以上 0 分。'],
      [6, 'C 點高程之誤差', 35, '±2cm 以內 35 分；±2.1~3.0cm 30 分；±3.1~4.0cm 20 分；±4.1~5.0cm 10 分；±5.1cm 以上 0 分。'],
      [7, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [['B_A_L', 'B_A_R', 'h', 'B→A'], ['B_C_L', 'B_C_R', 'h', 'B→C'], ['ZA_L', 'ZA_R', 'v', 'A 天頂距'], ['ZC_L', 'ZC_R', 'v', 'C 天頂距']],
    layout: [
      {
        title: '已知資料', role: 'known',
        head: [['點號', '縱坐標 N (m)', '橫坐標 E (m)', '高程 H (m)', '覘標高 (m)']],
        rows: [
          [L('A', { cls: 'pt' }), K('AN', 'num', { d: 3 }), K('AE', 'num', { d: 3 }), K('AH', 'num', { d: 3 }), K('IA', 'num', { d: 3 })],
          [L('B', { cls: 'pt' }), K('BN', 'num', { d: 3 }), K('BE', 'num', { d: 3 }), L('—'), L('—')],
          [L('C', { cls: 'pt' }), L('待求'), L('待求'), L('待求'), K('IC', 'num', { d: 3 })]
        ]
      },
      {
        title: '1. 天頂距觀測', role: 'obs', book: true,
        head: [['照準點', '正鏡讀數', '倒鏡讀數', '天頂距 Z', '垂直角 α']],
        rows: [
          [L('A', { cls: 'pt' }), O('ZA_L', 'dms'), O('ZA_R', 'dms'), A('ZA', 'dms', { book: true }), A('alphaA', 'dms', { signed: true, book: true })],
          [L('C', { cls: 'pt' }), O('ZC_L', 'dms'), O('ZC_R', 'dms'), A('ZC', 'dms', { book: true }), A('alphaC', 'dms', { signed: true, book: true })]
        ]
      },
      {
        title: '2. 水平角觀測手簿 ／ 3. 水平距', role: 'obs', book: true,
        head: [['測站', '測點', '正鏡讀數', '倒鏡讀數', '正倒鏡平均值', '改正後平均值']],
        rows: [
          [L('B', { rs: 2, cls: 'pt' }), L('A'), O('B_A_L', 'dms'), O('B_A_R', 'dms'), A('B_A_M', 'dms', { book: true }), L('0°00\'00"')],
          [L('C'), O('B_C_L', 'dms'), O('B_C_R', 'dms'), A('B_C_M', 'dms', { book: true }), A('angB', 'dms', { book: true })],
          [L('測量水平距 BC (m)', { cs: 2 }), O('dBC', 'num', { d: 3 }), L('', { cs: 3 })]
        ]
      },
      {
        title: '答案紙：計算結果', role: 'ans',
        head: [['項目', '結果', '項目', '結果']],
        rows: [
          [L('5. 水平距離 AB (m)'), A('dAB', 'num', { d: 3 }), L('φBA'), A('phiBA', 'dms')],
          [L('φBC'), A('phiBC', 'dms'), L(''), L('')],
          [L('6. C 點 NC (m)'), A('NC', 'num', { d: 3 }), L('C 點 EC (m)'), A('EC', 'num', { d: 3 })],
          [L('HB + iB (m)'), A('HBi', 'num', { d: 3 }), L('7. C 點高程 HC (m)'), A('HC', 'num', { d: 3 })]
        ]
      }
    ],

    official() {
      const D = S.dmsToDeg;
      return {
        known: { AN: 800, AE: 760, AH: 50, IA: 1.6, BN: 760, BE: 800, IC: 1.512 },
        obs: { ZA_L: D(84, 30, 35), ZA_R: D(275, 29, 35), ZC_L: D(80, 30, 35), ZC_R: D(279, 29, 35), B_A_L: D(0, 5, 0), B_A_R: D(180, 5, 10), B_C_L: D(60, 35, 30), B_C_R: D(240, 35, 40), dBC: 40.569 }
      };
    },

    random(level) {
      const f = level === 'fine' ? 0.5 : 1;
      const pB = { N: S.rnd(S.rand(300, 1500), 3), E: S.rnd(S.rand(300, 1500), 3) };
      const azBA = S.rand(0, 360), ang = S.rand(40, 120);
      const pA = (q => ({ N: S.rnd(q.N, 3), E: S.rnd(q.E, 3) }))(S.polar(pB, azBA, S.rand(46, 54)));
      const dBC = S.rand(36, 44);
      const pC = (q => ({ N: S.rnd(q.N, 3), E: S.rnd(q.E, 3) }))(S.polar(pB, S.norm360(S.azNE(pB, pA) + ang), dBC));
      const HA = S.rnd(S.rand(20, 120), 3), HBi = HA + S.rand(-3.5, 1.5), IA = S.rnd(S.rand(1.3, 1.7), 3), IC = S.rnd(S.rand(1.3, 1.7), 3);
      const HC = HBi + S.rand(-1.5, 4.5) - IC;
      const AB = S.distNE(pA, pB), BC = S.distNE(pB, pC);
      const aA = Math.atan((HA + IA - HBi) / AB) * S.R2D, aC = Math.atan((HC + IC - HBi) / BC) * S.R2D;
      const angT = S.norm360(S.azNE(pB, pC) - S.azNE(pB, pA));
      const zen = (a, ie) => [S.roundSec(90 - a + (ie + S.noise(4 * f)) / 3600), S.roundSec(360 - (90 - a) + (ie + S.noise(4 * f)) / 3600)];
      const ie = S.noise(8);
      const [za1, za2] = zen(aA, ie), [zc1, zc2] = zen(aC, ie);
      const L0 = S.dmsToDeg(0, S.randInt(1, 6), 0), c2 = S.noise(6 * f);
      const bl = level === 'blunder' ? S.pick([40, -40]) : 0;
      const L1 = S.roundSec(L0 + angT + (S.noise(4 * f) + bl) / 3600);
      return {
        known: { AN: pA.N, AE: pA.E, AH: HA, IA, BN: pB.N, BE: pB.E, IC },
        obs: { ZA_L: za1, ZA_R: za2, ZC_L: zc1, ZC_R: zc2, B_A_L: L0, B_A_R: S.roundSec(L0 + 180 + (c2 + S.noise(3)) / 3600), B_C_L: L1, B_C_R: S.roundSec(S.norm360(L1 + 180 + (c2 + S.noise(3)) / 3600)), dBC: S.rnd(BC + S.noise(0.003 * f), 3) },
        obsPerfect: { ZA_L: 90 - aA, ZA_R: 270 + aA, ZC_L: 90 - aC, ZC_R: 270 + aC, B_A_L: 0, B_A_R: 180, B_C_L: angT, B_C_R: S.norm360(angT + 180), dBC: BC },
        truthOverride: { NC: pC.N, EC: pC.E, HC: S.rnd(HC, 3) }
      };
    },

    solve(V) {
      V.req('AN', 'AE', 'AH', 'IA', 'BN', 'BE', 'IC', 'ZA_L', 'ZA_R', 'ZC_L', 'ZC_R', 'B_A_L', 'B_A_R', 'B_C_L', 'B_C_R', 'dBC');
      const ZA = S.zenithLR(V('ZA_L'), V('ZA_R')), ZC = S.zenithLR(V('ZC_L'), V('ZC_R'));
      const alphaA = 90 - ZA, alphaC = 90 - ZC;
      const mA = S.meanLR(V('B_A_L'), V('B_A_R')), mC = S.meanLR(V('B_C_L'), V('B_C_R'));
      const angB = S.roundSec(S.norm360(mC - mA));
      const pA = { N: V('AN'), E: V('AE') }, pB = { N: V('BN'), E: V('BE') };
      const dAB = S.rnd(S.distNE(pA, pB), 3), phiBA = S.roundSec(S.azNE(pB, pA)), phiBC = S.norm360(phiBA + angB);
      const BC = V('dBC');
      const NC = S.rnd(pB.N + BC * S.cosD(phiBC), 3), EC = S.rnd(pB.E + BC * S.sinD(phiBC), 3);
      const vA = S.rnd(dAB * S.tanD(alphaA), 3), vC = S.rnd(BC * S.tanD(alphaC), 3);
      const HBi = S.rnd(V('AH') + V('IA') - vA, 3);
      const HC = S.rnd(HBi + vC - V('IC'), 3);
      const f = S.fmtDMS, n3 = x => S.fmtNum(x, 3);
      const steps = [
        E.step('① 天頂距與垂直角', `ZA = (${f(V('ZA_L'))} − ${f(V('ZA_R'))} + 360°)/2 = <b>${f(ZA)}</b>，αA = 90° − ZA = <b>${f(alphaA, { signed: true })}</b>`,
          `ZC = (${f(V('ZC_L'))} − ${f(V('ZC_R'))} + 360°)/2 = <b>${f(ZC)}</b>，αC = <b>${f(alphaC, { signed: true })}</b>`,
          `指標差 A：${S.fmtNum(S.indexErr(V('ZA_L'), V('ZA_R')), 1)}"，C：${S.fmtNum(S.indexErr(V('ZC_L'), V('ZC_R')), 1)}"`),
        E.step('② 水平角與 AB', `∠ABC = ${f(mC)} − ${f(mA)} = <b>${f(angB)}</b>`, `AB = √[(${n3(pA.N)}−${n3(pB.N)})² + (${n3(pA.E)}−${n3(pB.E)})²] = <b>${n3(dAB)}</b> m`),
        E.step('③ C 點平面坐標', `φBA = <b>${f(phiBA)}</b>；φBC = φBA + ∠ABC = ${f(phiBA)} + ${f(angB)} = <b>${f(phiBC)}</b>`,
          `NC = ${n3(pB.N)} + ${n3(BC)}×cos${f(phiBC)} = <b>${n3(NC)}</b>`, `EC = ${n3(pB.E)} + ${n3(BC)}×sin${f(phiBC)} = <b>${n3(EC)}</b>`),
        E.step('④ C 點高程', `HA = (HB+iB) + AB·tanαA − IA ⇒ HB+iB = ${n3(V('AH'))} + ${n3(V('IA'))} − ${n3(dAB)}×tan${f(alphaA, { signed: true })} = ${n3(V('AH'))} + ${n3(V('IA'))} − (${n3(vA)}) = <b>${n3(HBi)}</b>`,
          `HC = (HB+iB) + BC·tanαC − IC = ${n3(HBi)} + ${n3(BC)}×tan${f(alphaC, { signed: true })} − ${n3(V('IC'))} = <b>${n3(HC)}</b> m`)
      ];
      return { ans: { ZA, ZC, alphaA, alphaC, B_A_M: mA, B_C_M: mC, angB, dAB, phiBA, phiBC, NC, EC, HBi, HC, dBC: BC }, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 5, ctx));
      if (truth) {
        const e = E.errSec(V('angB'), truth.angB);
        items.push(E.item(2, '∠ABC 之誤差', 20, E.band(e, [[15, 20], [20, 15], [25, 10], [30, 5]]), 'obs', isFinite(e) ? `誤差 ${e}"` : '未作答'));
        const eb = E.errMM(V('dBC'), truth.dBC);
        items.push(E.item(3, 'BC 之誤差', 5, E.band(eb, [[20, 5]]), 'obs', isFinite(eb) ? `誤差 ${eb} mm` : '未作答'));
      } else {
        items.push(E.item(2, '∠ABC 之誤差', 20, 0, 'obs', '實測模式：需監評標準答案', { na: true }));
        items.push(E.item(3, 'BC 之誤差', 5, 0, 'obs', '實測模式：需監評標準答案', { na: true }));
      }
      const ref = truth || sol;
      if (ref) {
        const e = E.errMM(V('dAB'), ref.dAB);
        items.push(E.item(4, 'AB 計算', 5, E.band(e, [[5, 5]]), 'calc', isFinite(e) ? `誤差 ${e} mm（正確值 ${S.fmtNum(ref.dAB, 3)}）` : '未作答'));
      }
      if (truth) {
        let r = E.subScore([{ label: 'NC', stu: V('NC'), ref: truth.NC, kind: 'mm' }, { label: 'EC', stu: V('EC'), ref: truth.EC, kind: 'mm' }], [[20, 15], [30, 10], [40, 5]], 15);
        items.push(E.item(5, 'C 點 N、E 坐標', 30, r.got, 'calc', r.detail));
        const e = E.errMM(V('HC'), truth.HC);
        items.push(E.item(6, 'C 點高程', 35, E.band(e, [[20, 35], [30, 30], [40, 20], [50, 10]]), 'calc', isFinite(e) ? `誤差 ${e} mm` : '未作答'));
      } else {
        items.push(E.item(5, 'C 點 N、E 坐標', 30, 0, 'calc', '實測模式：需監評標準答案', { na: true }));
        items.push(E.item(6, 'C 點高程', 35, 0, 'calc', '實測模式：需監評標準答案', { na: true }));
      }
      if (sol) {
        if (isFinite(V('alphaA')) && Math.abs(V('alphaA') + sol.alphaA) < 1 / 3600 && Math.abs(sol.alphaA) > 1 / 60) hints.push({ lvl: 'bad', msg: '垂直角 αA 正負號相反：α = 90° − Z，Z < 90° 為仰角（+），Z > 90° 為俯角（−）。' });
        if (isFinite(V('HC'))) {
          const noI = S.rnd(V('AH') - S.rnd(sol.dAB * S.tanD(sol.alphaA), 3) + S.rnd(V('dBC') * S.tanD(sol.alphaC), 3), 3);
          if (E.errMM(V('HC'), noI) <= 3 && E.errMM(V('HC'), sol.HC) > 3) hints.push({ lvl: 'bad', msg: 'HC 疑似未計入覘標高 IA、IC：HB+iB = HA + IA − AB·tanαA；HC = HB+iB + BC·tanαC − IC。' });
          const sw = S.rnd(V('AH') - V('IA') - S.rnd(sol.dAB * S.tanD(sol.alphaA), 3) + S.rnd(V('dBC') * S.tanD(sol.alphaC), 3) + V('IC'), 3);
          if (E.errMM(V('HC'), sw) <= 3 && E.errMM(V('HC'), sol.HC) > 3) hints.push({ lvl: 'bad', msg: '覘標高加減方向相反：照準點覘標高應「加」在 A 點、「減」在 C 點。' });
        }
        if (isFinite(V('phiBC')) && E.errSec(V('phiBC'), S.norm360(sol.phiBA - sol.angB)) <= 5 && E.errSec(V('phiBC'), sol.phiBC) > 5) hints.push({ lvl: 'bad', msg: 'φBC 應為 φBA + ∠ABC（水平角由 A 順時針量至 C）。' });
      }
      return { items, hints };
    },

    draw(V, sol) {
      const pA = { id: 'A', N: V('AN'), E: V('AE'), color: '#94a3b8' }, pB = { id: 'B', N: V('BN'), E: V('BE'), color: '#1e293b', label: 'B（測站）' };
      if (!sol) return E.planSVG({ points: [pA, pB] });
      const pC = { id: 'C', N: sol.NC, E: sol.EC, label: `C  H=${S.fmtNum(sol.HC, 3)}` };
      return E.planSVG({
        points: [pA, pB, pC], h: 360,
        lines: [{ a: 'B', b: 'A', color: '#475569', arrow: true, label: `αA=${S.fmtDMS(sol.alphaA, { signed: true })}` }, { a: 'B', b: 'C', color: '#ea580c', arrow: true, w: 2.5, label: `αC=${S.fmtDMS(sol.alphaC, { signed: true })}` }],
        extra: P => {
          const b = P(pB);
          return `<text x="${b.x + 10}" y="${b.y + 22}" class="svg-lbl">∠ABC=${S.fmtDMS(sol.angB)}　HB+iB=${S.fmtNum(sol.HBi, 3)}</text>`;
        }
      });
    }
  };
  G.TK.register(task);
})(window);
