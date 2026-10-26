/* 試題五、單曲線中心樁坐標之計算及測設 04202-1060205 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { K, O, A, L } = G.TK;

  const task = {
    id: 5, code: '04202-1060205', title: '單曲線中心樁坐標之計算及測設', short: '單曲線測設', time: 80,
    intro: {
      goal: '已知外偏角 I、半徑 R、交點 V(I.P.) 樁號，及 D（第一切線上）、V、S、F 點坐標。計算切線長 T、曲線起點 A(B.C.) 與第一個副樁 P（整樁 20m）之樁號與坐標，並計算由控制點 S（後視 F）測設 A、P 之方位角與水平距離，再於現地以經緯儀及鋼捲尺放樣。',
      field: [
        '室內計算 40 分鐘：全組先於室內計算坐標與測設數據並收卷評分。',
        '實地操作 40 分鐘：於 S 點整置經緯儀，後視 F 點，依「放樣答案紙」數據（不得更改）測設 A 點與 P 點。',
        '測設角 = φSA − φSF（自 F 順時針旋轉），以鋼捲尺量水平距離定樁。'
      ],
      calc: [
        '切線長 T = R·tan(I/2)',
        'A 點樁號 = V 樁號 − T；P 點樁號 = A 之後第一個 20m 整樁；弧長 l = P − A',
        'φVD 由坐標反算；A 點：N = NV + T·cosφVD，E = EV + T·sinφVD',
        '偏角 δ = l / (2R)（弧度）×ρ；弦長 c = 2R·sinδ',
        'φAP = φDV ± δ（右偏 +、左偏 −）；P 點：N = NA + c·cosφAP，E = EA + c·sinφAP',
        '測設資料：φSF、SF、φSA、SA、φSP、SP 由坐標反算'
      ],
      pitfalls: [
        '偏角 δ = l/(2R) 的單位為弧度，必須 ×180/π 換成度，再化為度分秒。',
        '弦長 c = 2R·sinδ，不是弧長 l；本例 l = 9.550 m 時弦長也約 9.550 m，但 R 小時差異明顯。',
        '樁號格式 2K+390.450；放樣答案須與計算答案相同，否則該項以零分計。',
        'φSA、φSP 容許誤差 = ±0.005×206265"/距離（距離越短容許越大）。'
      ]
    },
    rubric: [
      [1, '切線長 T、A 與 P 點之樁號及 NE 坐標等 7 項', 28, '誤差在 ±5mm（含）以內者各得 4 分；未詳列計算式者該項 0 分。'],
      [2, '測設資料之方位角及水平距離等 6 項', 24, '水平距離 ±5mm 以內各 4 分；φSF ±2" 以內 4 分；φSA、φSP 誤差在 ±0.005×206265"/距離 以內各 4 分。'],
      [3, '使用儀器是否適當、熟練', 6, '觀察應檢人員使用儀器是否正確，定心及定平是否準確。'],
      [4, 'A 與 P 點之樁位測設誤差', 42, '±2.0cm 以內各 21 分；±2.1~3.0cm 14 分；±3.1~4.0cm 7 分；±4.1cm 以上 0 分。放樣答案須與計算答案相同。'],
      [5, '使用時間', 0, '室內計算與實地測設均不得超過規定時間，超過者總分以零分計。']
    ],
    pairs: [],
    layout: [
      {
        title: '術科測試辦理單位提供之數據', role: 'known',
        head: [['項目', '數值', '項目', '數值']],
        rows: [
          [L('外偏角 I'), K('I', 'dms'), L('半徑 R (m)'), K('R', 'num', { d: 3 })],
          [L('交點 V 樁號'), K('staV', 'sta'), L('曲線方向'), K('dir', 'sel', { options: [['R', '右偏（順時針）'], ['L', '左偏（逆時針）']] })],
          [L('整樁間距 (m)'), K('step', 'num', { d: 0 }), L(''), L('')]
        ]
      },
      {
        title: '已知坐標 (m)', role: 'known',
        head: [['點號', '縱坐標 N', '橫坐標 E']],
        rows: ['D', 'V', 'S', 'F'].map(p => [L(p, { cls: 'pt' }), K(p + 'N', 'num', { d: 3 }), K(p + 'E', 'num', { d: 3 })])
      },
      {
        title: '答案紙 1：切線長、樁號與坐標', role: 'ans',
        head: [['項目', '結果', '項目', '結果']],
        rows: [
          [L('切線長 T = VA = VB (m)'), A('T', 'num', { d: 3 }), L('φVD'), A('phiVD', 'dms')],
          [L('曲線起點 A 樁號'), A('staA', 'sta'), L('第一副樁 P 樁號'), A('staP', 'sta')],
          [L('弧長 l (m)'), A('arcl', 'num', { d: 3 }), L('偏角 δ'), A('delta', 'dms', { tol: 1.1 })],
          [L('弦長 AP (m)'), A('chord', 'num', { d: 3 }), L('φAP'), A('phiAP', 'dms', { tol: 1.1 })],
          [L('Na (m)'), A('NA', 'num', { d: 3 }), L('Ea (m)'), A('EA', 'num', { d: 3 })],
          [L('Np (m)'), A('NP', 'num', { d: 3 }), L('Ep (m)'), A('EP', 'num', { d: 3 })]
        ]
      },
      {
        title: '答案紙 2 ／ 放樣答案紙：測設資料（S 設站、後視 F）', role: 'ans',
        head: [['項目', '方位角', '水平距離 (m)', '測設角（自 F 順轉）']],
        rows: [
          [L('S → F', { cls: 'pt' }), A('phiSF', 'dms', { tol: 1.1 }), A('dSF', 'num', { d: 3 }), L('0°00\'00"')],
          [L('S → A', { cls: 'pt' }), A('phiSA', 'dms', { tol: 1.1 }), A('dSA', 'num', { d: 3 }), A('setA', 'dms', { tol: 2 })],
          [L('S → P', { cls: 'pt' }), A('phiSP', 'dms', { tol: 1.1 }), A('dSP', 'num', { d: 3 }), A('setP', 'dms', { tol: 2 })]
        ]
      },
      {
        title: '實地測設結果（監評量測放樣樁位誤差，可自評輸入）', role: 'obs',
        head: [['樁位', '測設誤差 (cm)', '說明']],
        rows: [
          [L('A 點', { cls: 'pt' }), O('errA', 'num', { d: 1, free: true }), L('實地放樣後與標準樁位之距離')],
          [L('P 點', { cls: 'pt' }), O('errP', 'num', { d: 1, free: true }), L('未填則此項不列入計分')]
        ]
      }
    ],

    official() {
      return {
        known: { I: 80, R: 500, staV: 2810, dir: 'R', step: 20, DN: 100, DE: 200, VN: 600, VE: 800, SN: 330, SE: 460, FN: 310, FE: 430 },
        obs: { errA: NaN, errP: NaN }
      };
    },

    random() {
      for (let i = 0; i < 500; i++) {
        const I = S.dmsToDeg(S.randInt(20, 90), S.pick([0, 0, 15, 30, 45]), 0);
        const R = S.pick([100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 600]);
        const staV = S.rnd(S.randInt(1, 3) * 1000 + S.rand(250, 900), 3);
        const T = R * S.tanD(I / 2);
        const V = { N: S.rnd(S.rand(300, 900), 3), E: S.rnd(S.rand(300, 900), 3) };
        const azDV = S.rand(0, 360);
        const D = S.polar(V, S.norm360(azDV + 180), T + S.rand(60, 300));
        const Dr = { N: S.rnd(D.N, 3), E: S.rnd(D.E, 3) };
        const dir = S.pick(['R', 'L']);
        // 依實際取整後之坐標推算 A、P
        const known = { I, R, staV, dir, step: 20, DN: Dr.N, DE: Dr.E, VN: V.N, VE: V.E, SN: 0, SE: 0, FN: 0, FE: 0 };
        const phiVD = S.azNE(V, Dr);
        const pA = S.polar(V, phiVD, T);
        const Sp = S.polar(pA, S.rand(0, 360), S.rand(12, 24));
        const Fp = S.polar(Sp, S.rand(0, 360), S.rand(25, 40));
        Object.assign(known, { SN: S.rnd(Sp.N, 3), SE: S.rnd(Sp.E, 3), FN: S.rnd(Fp.N, 3), FE: S.rnd(Fp.E, 3) });
        const staA = staV - T, l = Math.ceil(staA / 20 + 1e-9) * 20 - staA;
        const ph = S.norm360(phiVD - 180 + (dir === 'R' ? 1 : -1) * l / (2 * R) * S.R2D);
        const pP = S.polar(pA, ph, 2 * R * Math.sin(l / (2 * R)));
        const dSP = S.distNE(Sp, pP);
        if (dSP < 45 && dSP > 8 && l > 2) return { known, obs: { errA: NaN, errP: NaN }, obsPerfect: { errA: 0, errP: 0 } };
      }
    },

    solve(V) {
      V.req('I', 'R', 'staV', 'DN', 'DE', 'VN', 'VE', 'SN', 'SE', 'FN', 'FE');
      const I = V('I'), R = V('R'), step = isFinite(V('step')) && V('step') > 0 ? V('step') : 20, sg = V('dir') === 'L' ? -1 : 1;
      const T = S.rnd(R * S.tanD(I / 2), 3);
      const staA = S.rnd(V('staV') - T, 3);
      const staP = Math.ceil(staA / step - 1e-9) * step === staA ? staA + step : Math.ceil(staA / step) * step;
      const arcl = S.rnd(staP - staA, 3);
      const pV = { N: V('VN'), E: V('VE') }, pD = { N: V('DN'), E: V('DE') }, pS = { N: V('SN'), E: V('SE') }, pF = { N: V('FN'), E: V('FE') };
      const phiVD = S.roundSec(S.azNE(pV, pD));
      const NA = S.rnd(pV.N + T * S.cosD(phiVD), 3), EA = S.rnd(pV.E + T * S.sinD(phiVD), 3);
      const delta = S.roundSec(arcl / (2 * R) * S.R2D);
      const chord = S.rnd(2 * R * Math.sin(arcl / (2 * R)), 3);
      const phiDV = S.norm360(phiVD - 180);
      const phiAP = S.norm360(phiDV + sg * delta);
      const NP = S.rnd(NA + chord * S.cosD(phiAP), 3), EP = S.rnd(EA + chord * S.sinD(phiAP), 3);
      const pA = { N: NA, E: EA }, pP = { N: NP, E: EP };
      const phiSF = S.roundSec(S.azNE(pS, pF)), dSF = S.rnd(S.distNE(pS, pF), 3);
      const phiSA = S.roundSec(S.azNE(pS, pA)), dSA = S.rnd(S.distNE(pS, pA), 3);
      const phiSP = S.roundSec(S.azNE(pS, pP)), dSP = S.rnd(S.distNE(pS, pP), 3);
      const setA = S.norm360(phiSA - phiSF), setP = S.norm360(phiSP - phiSF);
      const f = S.fmtDMS, n3 = x => S.fmtNum(x, 3);
      const steps = [
        E.step('① 切線長與樁號', `T = R·tan(I/2) = ${n3(R)}×tan(${f(I)}/2) = <b>${n3(T)}</b> m`,
          `A 樁號 = ${S.fmtSta(V('staV'))} − ${n3(T)} = <b>${S.fmtSta(staA)}</b>`, `P 樁號（第一個 ${step}m 整樁）= <b>${S.fmtSta(staP)}</b>，l = ${n3(arcl)} m`),
        E.step('② A 點坐標', `φVD = <b>${f(phiVD)}</b>（φDV = ${f(phiDV)}）`, `Na = ${n3(pV.N)} + ${n3(T)}×cos${f(phiVD)} = <b>${n3(NA)}</b>`, `Ea = ${n3(pV.E)} + ${n3(T)}×sin${f(phiVD)} = <b>${n3(EA)}</b>`),
        E.step('③ P 點坐標（偏角法）', `δ = l/(2R) × 180/π = ${n3(arcl)}/(2×${n3(R)}) rad = <b>${f(delta)}</b>`, `弦長 AP = 2R·sinδ = <b>${n3(chord)}</b> m`,
          `φAP = φDV ${sg > 0 ? '+' : '−'} δ = ${f(phiDV)} ${sg > 0 ? '+' : '−'} ${f(delta)} = <b>${f(phiAP)}</b>`,
          `Np = ${n3(NA)} + ${n3(chord)}×cos${f(phiAP)} = <b>${n3(NP)}</b>；Ep = ${n3(EA)} + ${n3(chord)}×sin${f(phiAP)} = <b>${n3(EP)}</b>`),
        E.step('④ 測設資料', `φSF = <b>${f(phiSF)}</b>，SF = <b>${n3(dSF)}</b> m`, `φSA = <b>${f(phiSA)}</b>，SA = <b>${n3(dSA)}</b> m（測設角 ${f(setA)}）`, `φSP = <b>${f(phiSP)}</b>，SP = <b>${n3(dSP)}</b> m（測設角 ${f(setP)}）`,
          `φSA 容許誤差 = 0.005×206265"/${n3(dSA)} = ±${S.fmtNum(0.005 * S.RHO / dSA, 0)}"；φSP 容許 ±${S.fmtNum(0.005 * S.RHO / dSP, 0)}"`)
      ];
      return { ans: { T, staA, staP, arcl, phiVD, delta, chord, phiAP, NA, EA, NP, EP, phiSF, dSF, phiSA, dSA, phiSP, dSP, setA, setP, _phiDV: phiDV }, steps };
    },

    grade(ctx) {
      const { V, sol } = ctx; const items = [], hints = [];
      const ref = ctx.truth || sol;
      if (!ref) return { items: [E.item(1, '室內計算', 28, 0, 'calc', '已知資料不完整')], hints };
      let r = E.subScore([['T', 'T'], ['A 樁號', 'staA'], ['P 樁號', 'staP'], ['Na', 'NA'], ['Ea', 'EA'], ['Np', 'NP'], ['Ep', 'EP']].map(([l, k]) => ({ label: l, stu: V(k), ref: ref[k], kind: 'mm' })), [[5, 4]], 4);
      items.push(E.item(1, '切線長 T、A 與 P 點樁號及坐標（7 項）', 28, r.got, 'calc', r.detail));
      const tA = 0.005 * S.RHO / ref.dSA, tP = 0.005 * S.RHO / ref.dSP;
      const parts = [
        { label: 'φSF', e: E.errSec(V('phiSF'), ref.phiSF), lim: 2, u: '"' }, { label: 'SF', e: E.errMM(V('dSF'), ref.dSF), lim: 5, u: 'mm' },
        { label: 'φSA', e: E.errSec(V('phiSA'), ref.phiSA), lim: Math.floor(tA), u: '"' }, { label: 'SA', e: E.errMM(V('dSA'), ref.dSA), lim: 5, u: 'mm' },
        { label: 'φSP', e: E.errSec(V('phiSP'), ref.phiSP), lim: Math.floor(tP), u: '"' }, { label: 'SP', e: E.errMM(V('dSP'), ref.dSP), lim: 5, u: 'mm' }
      ];
      let got = 0; const det = parts.map(p => { const ok = isFinite(p.e) && p.e <= p.lim; if (ok) got += 4; return `${p.label}：${isFinite(p.e) ? p.e + p.u : '未作答'}（限 ±${p.lim}${p.u}）→ ${ok ? 4 : 0}/4`; });
      items.push(E.item(2, '測設資料方位角及水平距離（6 項）', 24, got, 'calc', det.join('；')));
      items.push(G.TK.fieldItem(3, '使用儀器是否適當、熟練', 6, ctx));
      const eA = V('errA'), eP = V('errP');
      if (isFinite(eA) || isFinite(eP)) {
        const sc = e => isFinite(e) ? E.band(Math.round(Math.abs(e) * 10) / 10, [[2.0, 21], [3.0, 14], [4.0, 7]]) : 0;
        const consistent = parts.every(p => isFinite(p.e) && p.e <= p.lim);
        const g = consistent ? sc(eA) + sc(eP) : 0;
        items.push(E.item(4, 'A 與 P 點樁位測設誤差', 42, g, 'obs', `${consistent ? '' : '【放樣資料錯誤，本項以零分計】'}A：${isFinite(eA) ? eA + 'cm → ' + sc(eA) : '未填'}；P：${isFinite(eP) ? eP + 'cm → ' + sc(eP) : '未填'}`));
      } else items.push(E.item(4, 'A 與 P 點樁位測設誤差', 42, 0, 'obs', '實地放樣誤差未填寫（於「實地測設結果」自評輸入），未列入計分', { na: true }));

      if (sol) {
        const wrongDelta = S.roundSec(sol.arcl / (2 * V('R')));
        if (isFinite(V('delta')) && E.errSec(V('delta'), wrongDelta) <= 2 && E.errSec(V('delta'), sol.delta) > 2) hints.push({ lvl: 'bad', msg: '偏角 δ = l/(2R) 的結果是「弧度」，須乘 180/π 換算為度。' });
        if (isFinite(V('chord')) && E.errMM(V('chord'), sol.arcl) <= 1 && E.errMM(V('chord'), sol.chord) > 1) hints.push({ lvl: 'warn', msg: '弦長應為 2R·sinδ，與弧長 l 不同（R 小時差異明顯）。' });
        const altP = S.norm360(sol._phiDV - (V('dir') === 'L' ? -1 : 1) * sol.delta);
        if (isFinite(V('phiAP')) && E.errSec(V('phiAP'), altP) <= 2 && E.errSec(V('phiAP'), sol.phiAP) > 2) hints.push({ lvl: 'bad', msg: `曲線方向錯誤：本題為${V('dir') === 'L' ? '左' : '右'}偏曲線，φAP = φDV ${V('dir') === 'L' ? '−' : '+'} δ。` });
        if (isFinite(V('T')) && E.errMM(V('T'), S.rnd(V('R') * S.tanD(V('I')), 3)) <= 2) hints.push({ lvl: 'bad', msg: '切線長 T = R·tan(I/2)，記得外偏角要除以 2。' });
        if (isFinite(V('staP')) && E.errMM(V('staP'), sol.staA) === 0) hints.push({ lvl: 'bad', msg: 'P 點為曲線起點之後的第一個整樁，不是 A 點本身。' });
      }
      return { items, hints };
    },

    draw(V, sol) {
      const pts = ['D', 'V', 'S', 'F'].map(p => ({ id: p, N: V(p + 'N'), E: V(p + 'E'), color: p === 'S' || p === 'F' ? '#1e293b' : '#94a3b8' }));
      if (!sol) return E.planSVG({ points: pts, lines: [{ a: 'D', b: 'V' }] });
      const R = V('R'), I = V('I'), sg = V('dir') === 'L' ? -1 : 1;
      const phiDV = sol._phiDV;
      const center = S.polar({ N: sol.NA, E: sol.EA }, S.norm360(phiDV + sg * 90), R);
      const arc = [];
      const az0 = S.azNE(center, { N: sol.NA, E: sol.EA });
      for (let k = 0; k <= 40; k++) arc.push(S.polar(center, S.norm360(az0 + sg * I * k / 40), R));
      const pB = arc[arc.length - 1];
      const pB2 = S.polar(pB, S.norm360(phiDV + sg * I), sol.T * 0.4);
      // 主圖：整條曲線
      const main = E.planSVG({
        w: 520, h: 330,
        points: [pts[0], pts[1], { id: 'A', N: sol.NA, E: sol.EA, label: 'A (B.C.)' }, { id: 'B', N: pB.N, E: pB.E, label: 'B (E.C.)', color: '#94a3b8' }],
        polylines: [{ pts: arc, color: '#ea580c', w: 2.5 }, { pts: [pts[0], pts[1], pB2], color: '#475569', dash: '6 4', w: 1.2 }],
        extra: P => { const v = P(pts[1]); return `<text x="${v.x + 8}" y="${v.y + 16}" class="svg-lbl">I=${S.fmtDMS(I)}  T=${S.fmtNum(sol.T, 3)}</text>`; }
      });
      // 局部放大：S、F、A、P
      const near = [pts[2], pts[3], { id: 'A', N: sol.NA, E: sol.EA, label: 'A' }, { id: 'P', N: sol.NP, E: sol.EP, label: 'P' }];
      const localArc = arc.filter(q => Math.hypot(q.N - sol.NA, q.E - sol.EA) < 60);
      const zoom = E.planSVG({
        w: 520, h: 300, points: near,
        polylines: [{ pts: localArc.length > 1 ? localArc : [], color: '#ea580c', w: 2 }],
        lines: [{ a: 'S', b: 'F', color: '#1e293b', arrow: true, label: '後視' }, { a: 'S', b: 'A', color: '#16a34a', arrow: true, label: `${S.fmtDMS(sol.setA)} / ${S.fmtNum(sol.dSA, 3)}` }, { a: 'S', b: 'P', color: '#2563eb', arrow: true, label: `${S.fmtDMS(sol.setP)} / ${S.fmtNum(sol.dSP, 3)}` }]
      });
      return `<div class="text-xs font-semibold text-slate-500 mb-1">全線示意</div>${main}<div class="text-xs font-semibold text-slate-500 mt-3 mb-1">放樣局部放大（S 設站、後視 F）</div>${zoom}`;
    }
  };
  G.TK.register(task);
})(window);
