/* 試題八、中心樁高程測量及縱斷面圖繪製 04202-1060208 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, LK = G.LK, { K, A, L } = G.TK;
  const SEQ = [{ pt: 'A', ty: 'bs' }, { pt: 'B', ty: 'tp' }, { pt: 'C', ty: 'tp' }, { pt: 'D', ty: 'tp' }, { pt: 'C', ty: 'tp', key: 'C' }, { pt: 'B', ty: 'tp', key: 'B' }, { pt: 'A', ty: 'end' }];
  const P = ['A', 'B', 'C', 'D'];

  const task = {
    id: 8, __seq: SEQ, code: '04202-1060208', title: '中心樁高程測量及縱斷面圖繪製', short: '中心樁縱斷面', time: 60,
    intro: {
      goal: '已知中心樁 A 之樁號與高程、AB、BC、CD 水平距、A 點挖土深度及設計坡度。於 A–B、B–C、C–D 間設站往測，再 D–C、C–B、B–A 返測，平差後求 B、C、D 樁頂高程，計算計畫路面高程、挖填深度、無挖填點樁號並繪製縱斷面圖。',
      field: [
        '往測：A→B→C→D 依次設站測定各樁頂間高程差；返測：D→C→B→A。',
        '共 6 站，各樁頂同時為轉點；水準尺須垂直立於鋼釘上。'
      ],
      calc: [
        '閉合差 W = 回到 A 之計算高程 − 已知 HA；改正數第 k 站累積 −W·k/6',
        'HB、HC 取往返改正後平均；HD 只觀測一次',
        '計畫高程：H\'A = HA − 挖土深度；H\'B = H\'A + g·AB；依序類推',
        '挖填：地面 − 計畫 > 0 為挖土，< 0 為填土',
        '無挖填點：設距 B 點 X，H\'B + g·X = HB + (HC − HB)·X / BC ⇒ X = (HB − H\'B) / [g − (HC − HB)/BC]',
        '縱斷面圖：縱軸格距 0.1m，每 0.5m 標註高程；橫軸格距 10m，標註 A、B、C、D 樁號'
      ],
      pitfalls: [
        '坡度 +1% 代表每 100m 上升 1m，計算時 g = 0.01。',
        'A 點「須挖土」表示計畫高程比地面低：H\'A = HA − 挖深。',
        '樁號 = A 樁號 + 累計距離，格式 1K+076.800。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 5, '觀察應檢人員使用儀器是否正確，定平是否準確。'],
      [2, '手簿記錄及計算是否正確', 5, '記錄是否清晰正確。'],
      [3, 'B、C、D 樁高程誤差', 45, '±5mm 以內各 15 分；±6~±8mm 10 分；±9~±11mm 5 分；±12mm 以上 0 分。'],
      [4, '縱斷面圖', 27, '全部正確 27 分；圖上高程誤差 ±0.05m 以上每點扣 3 分；地面高程、計畫高程、挖土深度與填土高度誤差 ±0.010m 以上每一數值扣 3 分，扣至 0 分為止。'],
      [5, '無挖填土點位之樁號', 18, '誤差 ±50.0cm 以內 18 分，超出 0 分。'],
      [6, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [],
    layout: [
      {
        title: '已知資料', role: 'known',
        head: [['項目', '數值', '項目', '數值']],
        rows: [
          [L('中心樁 A 點樁號'), K('staA0', 'sta'), L('A 點高程 (m)'), K('HA', 'num', { d: 3 })],
          [L('A 至 B 水平距 (m)'), K('dAB', 'num', { d: 3 }), L('B 至 C 水平距 (m)'), K('dBC', 'num', { d: 3 })],
          [L('C 至 D 水平距 (m)'), K('dCD', 'num', { d: 3 }), L('A 點須挖土 (m)'), K('cutA0', 'num', { d: 3 })],
          [L('A 至 D 設計坡度 (%)'), K('g', 'num', { d: 2, signed: true }), L(''), L('')]
        ]
      },
      { title: '1. 水準測量（往測 A→D、返測 D→A）', role: 'obs', book: true, wide: true, head: LK.bookHead(true), rows: LK.bookRows('r', SEQ, { noIS: true }) },
      {
        title: '2. 挖填土深度計算', role: 'ans',
        head: [['樁位', '樁號', '平均後地面高程', '計畫高程', '挖土深度', '填土高度']],
        rows: P.map(p => [L(p, { cls: 'pt' }), A('sta' + p, 'sta'), p === 'A' ? L('（已知）', { ref: 'HA' }) : A('H' + p, 'num', { d: 3 }), A('Hp' + p, 'num', { d: 3 }), A('cut' + p, 'num', { d: 3 }), A('fill' + p, 'num', { d: 3 })])
      },
      {
        title: '3. 無挖填方之中心樁樁號', role: 'ans',
        head: [['項目', '結果', '項目', '結果']],
        rows: [[L('距 B 點 X (m)'), A('X0', 'num', { d: 3, tol: 0.01 }), L('無挖填樁號'), A('sta0', 'sta', { tol: 0.01 })]]
      }
    ],

    official() {
      return {
        known: { staA0: 1000, HA: 99.995, dAB: 50, dBC: 40, dCD: 30, cutA0: 0.495, g: 1 },
        obs: { r0_bs: 1.507, r1_fs: 1.1, r1_bs: 1.198, r2_fs: 1.4, r2_bs: 1.598, r3_fs: 1.564, r3_bs: 1.63, r4_fs: 1.668, r4_bs: 1.41, r5_fs: 1.212, r5_bs: 1.193, r6_fs: 1.6 }
      };
    },

    random(level) {
      const sg = level === 'fine' ? 0.0006 : 0.0012;
      const staA = S.randInt(0, 3) * 1000 + S.pick([0, 100, 200, 500]);
      const dAB = S.randInt(3, 5) * 10, dBC = S.randInt(3, 5) * 10, dCD = S.randInt(3, 5) * 10;
      const g = S.pick([-1.5, -1.2, -1, -0.8, -0.5, 0.5, 0.8, 1, 1.2, 1.5]);
      const HA = S.rnd(S.rand(20, 120), 3), cutA = S.rnd(S.rand(0.2, 0.6), 3);
      const HpA = HA - cutA, HpB = HpA + g / 100 * dAB, HpC = HpB + g / 100 * dBC, HpD = HpC + g / 100 * dCD;
      const H = { A: HA, B: HpB + S.rand(0.1, 0.5), C: HpC - S.rand(0.1, 0.5), D: HpD - S.rand(0.1, 0.6) };
      const bl = level === 'blunder' ? 2 : -1;
      const sim = LK.simulate('r', SEQ, H, sg, bl);
      return { known: { staA0: staA, HA, dAB, dBC, dCD, cutA0: cutA, g }, obs: sim.obs, obsPerfect: sim.obsPerfect, truthOverride: { HB: S.rnd(H.B, 3), HC: S.rnd(H.C, 3), HD: S.rnd(H.D, 3) } };
    },

    solve(V) {
      V.req('staA0', 'HA', 'dAB', 'dBC', 'dCD', 'cutA0', 'g');
      const HA = V('HA');
      const R = LK.solveBook(V, 'r', SEQ, HA, HA);
      const a = R.ans;
      const HB = S.rnd((a.r1_Ha + a.r5_Ha) / 2, 3), HC = S.rnd((a.r2_Ha + a.r4_Ha) / 2, 3), HD = a.r3_Ha;
      const g = V('g') / 100, d = [0, V('dAB'), V('dBC'), V('dCD')];
      const sta = [V('staA0')]; for (let i = 1; i < 4; i++) sta.push(S.rnd(sta[i - 1] + d[i], 3));
      const Hp = [S.rnd(HA - V('cutA0'), 3)]; for (let i = 1; i < 4; i++) Hp.push(S.rnd(Hp[i - 1] + g * d[i], 3));
      const Hg = [HA, HB, HC, HD];
      const ans = Object.assign({}, a, { HB, HC, HD });
      P.forEach((p, i) => {
        ans['sta' + p] = sta[i]; ans['Hp' + p] = Hp[i];
        const df = S.rnd(Hg[i] - Hp[i], 3);
        ans['cut' + p] = df > 0 ? df : NaN; ans['fill' + p] = df < 0 ? -df : NaN;
      });
      // 無挖填點：逐段搜尋符號改變
      let X0 = NaN, seg = -1;
      for (let i = 0; i < 3; i++) {
        const d0 = Hg[i] - Hp[i], d1 = Hg[i + 1] - Hp[i + 1];
        if (d0 === 0) { X0 = 0; seg = i; break; }
        if (d0 * d1 < 0) { X0 = S.rnd(d0 / (d0 - d1) * d[i + 1], 3); seg = i; break; }
      }
      ans.X0 = X0; ans.sta0 = seg >= 0 ? S.rnd(sta[seg] + X0, 3) : NaN; ans._seg = seg;
      ans.__prof = { sta, Hg, Hp };
      const n3 = x => S.fmtNum(x, 3);
      const steps = [
        E.step('① 往返水準與閉合差', `回到 A 計算高程 = ${n3(a.r6_Hc)}，W = ${n3(a.r6_Hc)} − ${n3(HA)} = <b>${S.fmtNum(R.lv.W, 3, true)}</b> m`,
          `改正數（6 站累積）：${R.lv.rows.slice(1).map(o => `${o.pt} ${S.fmtNum(o.v, 3, true)}`).join('、')}`,
          `HB = (${n3(a.r1_Ha)} + ${n3(a.r5_Ha)})/2 = <b>${n3(HB)}</b>；HC = (${n3(a.r2_Ha)} + ${n3(a.r4_Ha)})/2 = <b>${n3(HC)}</b>；HD = <b>${n3(HD)}</b>`),
        E.step('② 計畫路面高程', `H'A = ${n3(HA)} − ${n3(V('cutA0'))} = ${n3(Hp[0])}`,
          `H'B = ${n3(Hp[0])} + ${d[1]}×${V('g')}/100 = <b>${n3(Hp[1])}</b>；H'C = <b>${n3(Hp[2])}</b>；H'D = <b>${n3(Hp[3])}</b>`,
          ...P.map((p, i) => `${p}：地面 − 計畫 = ${n3(Hg[i])} − ${n3(Hp[i])} = ${S.fmtNum(Hg[i] - Hp[i], 3, true)} → ${Hg[i] - Hp[i] >= 0 ? '挖' : '填'} ${n3(Math.abs(Hg[i] - Hp[i]))}`)),
        E.step('③ 無挖填點', seg >= 0 ? `位於 ${P[seg]}–${P[seg + 1]} 之間：H'${P[seg]} + g·X = H${P[seg]} + (H${P[seg + 1]} − H${P[seg]})·X / ${d[seg + 1]}` : '無符號改變，無挖填點不在 A–D 之間',
          seg >= 0 ? `X = <b>${n3(X0)}</b> m；樁號 = ${S.fmtSta(sta[seg])} + ${n3(X0)} = <b>${S.fmtSta(ans.sta0)}</b>` : '')
      ];
      return { ans, steps };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 5, ctx));
      let bookOk = !!sol;
      if (sol) for (let i = 1; i < SEQ.length; i++) if (E.errMM(V(`r${i}_h`), sol[`r${i}_h`]) > 0 || E.errMM(V(`r${i}_Ha`), sol[`r${i}_Ha`]) > 1) bookOk = false;
      items.push(E.item(2, '手簿記錄及計算', 5, bookOk ? 5 : 0, 'calc', bookOk ? '手簿高程差及改正正確' : '手簿高程差或改正後高程有誤'));
      if (truth) {
        const r = E.subScore(['B', 'C', 'D'].map(p => ({ label: 'H' + p, stu: V('H' + p), ref: truth['H' + p], kind: 'mm' })), [[5, 15], [8, 10], [11, 5]], 15);
        items.push(E.item(3, 'B、C、D 樁高程', 45, r.got, 'obs', r.detail));
      } else items.push(E.item(3, 'B、C、D 樁高程', 45, 0, 'obs', '實測模式：需監評標準值', { na: true }));
      const ref = truth || sol;
      if (ref) {
        let ded = 0; const bad = [];
        P.forEach(p => {
          const vals = [['地面', p === 'A' ? V('HA') : V('H' + p), p === 'A' ? V('HA') : ref['H' + p]], ['計畫', V('Hp' + p), ref['Hp' + p]]];
          const rc = ref['cut' + p], rf = ref['fill' + p];
          vals.push(['挖/填', isFinite(rc) ? V('cut' + p) : V('fill' + p), isFinite(rc) ? rc : rf]);
          vals.forEach(([n, s, r]) => { if (!isFinite(s) || Math.abs(s - r) >= 0.0105) { ded += 3; bad.push(p + n); } });
        });
        items.push(E.item(4, '縱斷面圖（表列數值）', 27, Math.max(0, 27 - ded), 'calc', ded ? `誤差 ≥ 0.010m：${bad.join('、')}（每項扣 3 分）` : '地面、計畫、挖填數值全部正確'));
        const e = isFinite(V('sta0')) ? Math.abs(V('sta0') - ref.sta0) * 100 : NaN;
        items.push(E.item(5, '無挖填土點位之樁號', 18, isFinite(e) && e <= 50 ? 18 : 0, 'calc', isFinite(e) ? `誤差 ${S.fmtNum(e, 1)} cm（標準 ${S.fmtSta(ref.sta0)}）` : '未作答'));
      }
      if (sol) {
        const W = sol.rW, v6 = V('r6_v');
        if (isFinite(v6) && W !== 0 && v6 !== 0 && Math.sign(v6) === Math.sign(W)) hints.push({ lvl: 'bad', msg: '改正數符號應與閉合差相反。' });
        if (isFinite(V('HpB')) && E.errMM(V('HpB'), S.rnd(V('HA') + V('cutA0') + V('g') / 100 * V('dAB'), 3)) <= 1) hints.push({ lvl: 'bad', msg: 'A 點「須挖土」，計畫高程 H\'A = HA − 挖深（不是加）。' });
        if (isFinite(V('HpB')) && E.errMM(V('HpB'), S.rnd(V('HA') - V('cutA0') + V('g') * V('dAB'), 3)) <= 1) hints.push({ lvl: 'bad', msg: '坡度單位為 %，計算時須 ÷100（+1% → 0.01）。' });
        P.forEach(p => { if (isFinite(sol['cut' + p]) && isFinite(V('fill' + p)) && !isFinite(V('cut' + p))) hints.push({ lvl: 'bad', msg: `${p} 點挖填判斷相反：地面高於計畫為「挖土」。` }); });
        if (isFinite(V('X0')) && isFinite(V('sta0')) && Math.abs(V('sta0') - V('X0')) < 1) hints.push({ lvl: 'bad', msg: '無挖填點樁號須加上 B 點樁號（樁號 = B 樁號 + X）。' });
      }
      return { items, hints };
    },

    draw(V, sol) {
      if (!sol) return E.emptySVG(520, 320, '完成觀測與計算後顯示縱斷面圖');
      const { sta, Hg, Hp } = sol.__prof;
      const s0 = sta[0];
      const xg = []; for (let x = 0; x <= sta[3] - s0 + 1e-6; x += 10) xg.push(x);
      const ground = P.map((p, i) => ({ x: sta[i] - s0, y: Hg[i], label: p }));
      const design = P.map((p, i) => ({ x: sta[i] - s0, y: Hp[i] }));
      const vl = isFinite(sol.sta0) ? [{ x: sol.sta0 - s0, label: `無挖填 ${S.fmtSta(sol.sta0)}` }] : [];
      return E.profileSVG({
        h: 340, yStep: 0.1, yLabelEvery: 5, yDec: 2, yTitle: '高程 (m)  縱軸格距 0.1m',
        xGrid: xg, xTicks: P.map((p, i) => ({ x: sta[i] - s0, label: S.fmtSta(sta[i], 0) })),
        series: [{ name: '現有地面', color: '#1e293b', pts: ground }, { name: '計畫路面', color: '#ea580c', dash: '7 4', pts: design }],
        vlines: vl
      });
    }
  };
  G.TK.register(task);
})(window);
