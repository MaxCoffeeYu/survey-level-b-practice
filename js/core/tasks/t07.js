/* 試題七、閉合水準測量及間視點高程測量 04202-1060207 */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, LK = G.LK, { K, A, L } = G.TK;
  const P4 = ['B', 'C', 'D', 'E'];

  const FWD = [
    { pt: 'A', ty: 'bs' }, { pt: 'TP1', ty: 'tp' }, { pt: 'B', ty: 'is' }, { pt: 'C', ty: 'is' }, { pt: 'TP2', ty: 'tp' }, { pt: 'TP3', ty: 'tp' },
    { pt: 'TP4', ty: 'tp' }, { pt: 'D', ty: 'is' }, { pt: 'TP5', ty: 'tp' }, { pt: 'E', ty: 'is' }, { pt: 'A', ty: 'end' }
  ];
  const BWD = [
    { pt: 'A', ty: 'bs' }, { pt: 'E', ty: 'is' }, { pt: "TP1'", ty: 'tp' }, { pt: 'D', ty: 'is' }, { pt: "TP2'", ty: 'tp' }, { pt: "TP3'", ty: 'tp' },
    { pt: "TP4'", ty: 'tp' }, { pt: 'C', ty: 'is' }, { pt: 'B', ty: 'is' }, { pt: "TP5'", ty: 'tp' }, { pt: 'A', ty: 'end' }
  ];
  const idx = (seq, p) => seq.findIndex(r => r.pt === p && r.ty === 'is');

  const task = {
    id: 7, __seq: { f: FWD, b: BWD }, code: '04202-1060207', title: '閉合水準測量及間視點高程測量', short: '閉合水準', time: 60,
    intro: {
      goal: '由已知水準點 A 出發，依規定路線順（逆）時針往測、逆（順）時針返測各一次閉合水準測量（各 6 站、5 個轉點），同時觀測間視點 B、C、D、E；往返測分別平差後計算 B、C、D、E 高程平均值。',
      field: [
        '往測：測站 2 觀測間視 B、C；測站 5 觀測間視 D；測站 6 觀測間視 E。',
        '返測：測站 1\' 觀測間視 E；測站 2\' 觀測 D；測站 5\' 觀測 B、C。',
        '轉點放置鐵墊（尺墊），返測轉點必須重新擺置。水準尺須垂直立於木樁鋼釘上。'
      ],
      calc: [
        '高程差 h = 該站後視 − 前視（或間視）；高程計算值 = 該站後視點高程 + h',
        '閉合差 W = [b] − [f]（= 回到 A 之計算高程 − 已知高程）',
        '改正數依測站數累積配賦：第 k 站 v = −W·k / n（n = 6）',
        '間視點的改正數 = 該測站後視點的累積改正數',
        '平均高程 H = (往測改正後 + 返測改正後) / 2'
      ],
      pitfalls: [
        '間視點不是轉點：不計入前視總和 [f]，也不增加測站數。',
        '改正數符號與 W 相反；最後回到 A 的改正後高程必須等於已知高程。',
        '間視點的高程差是相對於「該站後視點」，不是相對於前一個間視點。'
      ]
    },
    rubric: [
      [1, '使用儀器是否適當及熟練', 4, '觀察應檢人員使用儀器是否正確，定平是否準確。'],
      [2, '手簿記錄及計算是否正確', 4, '記錄是否清晰正確。'],
      [3, '分別檢查往返測閉合差之絕對值', 20, '6mm（含）以內各 10 分；7~9mm 8 分；10~12mm 6 分；13~15mm 4 分；16~18mm 2 分；19mm 以上 0 分。'],
      [4, '分別檢查往返測之 B、C、D、E 樁改正後高程', 64, '±5mm 以內各 8 分；±6~±8mm 6 分；±9~±11mm 4 分；±12~±14mm 2 分；±15mm 以上 0 分。'],
      [5, '檢查 B、C、D、E 點高程之平均值', 8, '±5mm 以內各 2 分；±10mm 各 1 分；±11mm 以上 0 分。'],
      [6, '使用時間', 0, '超過規定之使用時間者總分以零分計。']
    ],
    pairs: [],
    layout: [
      { title: '已知資料', role: 'known', head: [['點號', '高程 (m)']], rows: [[L('A', { cls: 'pt' }), K('HA', 'num', { d: 3 })]] },
      { title: '1. 往測成果平差改正計算', role: 'obs', book: true, wide: true, head: LK.bookHead(false), rows: LK.bookRows('f', FWD) },
      { title: '2. 返測成果平差改正計算', role: 'obs', book: true, wide: true, head: LK.bookHead(false), rows: LK.bookRows('b', BWD) },
      {
        title: '3. B、C、D、E 點高程之平均值', role: 'ans',
        head: [['點號', '往測改正後', '返測改正後', '平均值 (m)']],
        rows: P4.map(p => [L(p, { cls: 'pt' }), L('—', { ref: 'f' + idx(FWD, p) + '_Ha' }), L('—', { ref: 'b' + idx(BWD, p) + '_Ha' }), A('H' + p, 'num', { d: 3 })])
      }
    ],

    official() {
      const f = [[1.252], [1.54, 1.483], [1.321], [1.446], [1.797, 1.642], [1.355, 2.03], [1.411, 1.552], [1.21], [1.648, 1.387], [1.397], [1.589]];
      const b = [[1.505], [1.319], [1.25, 1.697], [1.31], [1.483, 1.385], [1.68, 1.346], [1.298, 1.548], [2.01], [1.893], [1.552, 1.58], [1.786]];
      const obs = {};
      const fill = (pre, seq, arr) => seq.forEach((r, i) => {
        const v = arr[i], k = pre + i;
        if (r.ty === 'bs') obs[k + '_bs'] = v[0];
        else if (r.ty === 'tp') { obs[k + '_fs'] = v[0]; obs[k + '_bs'] = v[1]; }
        else if (r.ty === 'is') obs[k + '_is'] = v[0];
        else obs[k + '_fs'] = v[0];
      });
      fill('f', FWD, f); fill('b', BWD, b);
      return { known: { HA: 49.95 }, obs };
    },

    random(level) {
      const sg = level === 'fine' ? 0.0006 : 0.0011;
      const HA = S.rnd(S.rand(20, 90), 3);
      const H = { A: HA };
      H.B = HA + S.rand(-0.45, 0.45); H.C = H.B + S.rand(-0.2, 0.2); H.D = HA + S.rand(-0.45, 0.45); H.E = HA + S.rand(-0.45, 0.45);
      const Hf = Object.assign({}, H), Hb = Object.assign({}, H);
      ['TP1', 'TP2', 'TP3', 'TP4', 'TP5'].forEach(t => Hf[t] = HA + S.rand(-0.5, 0.5));
      ["TP1'", "TP2'", "TP3'", "TP4'", "TP5'"].forEach(t => Hb[t] = HA + S.rand(-0.5, 0.5));
      const bl = level === 'blunder' ? S.pick([2, 7]) : -1;
      const a = LK.simulate('f', FWD, Hf, sg, bl), b = LK.simulate('b', BWD, Hb, sg);
      const t = {}; P4.forEach(p => { t['H' + p] = S.rnd(H[p], 3); t['f' + idx(FWD, p) + '_Ha'] = S.rnd(H[p], 3); t['b' + idx(BWD, p) + '_Ha'] = S.rnd(H[p], 3); });
      return { known: { HA }, obs: Object.assign(a.obs, b.obs), obsPerfect: Object.assign(a.obsPerfect, b.obsPerfect), truthOverride: t };
    },

    solve(V) {
      V.req('HA');
      const HA = V('HA');
      const F = LK.solveBook(V, 'f', FWD, HA, HA), B = LK.solveBook(V, 'b', BWD, HA, HA);
      const ans = Object.assign({}, F.ans, B.ans);
      const n3 = x => S.fmtNum(x, 3);
      const lines = [];
      P4.forEach(p => {
        const a = ans['f' + idx(FWD, p) + '_Ha'], b = ans['b' + idx(BWD, p) + '_Ha'];
        ans['H' + p] = S.rnd((a + b) / 2, 3);
        lines.push(`H${p} = (${n3(a)} + ${n3(b)}) / 2 = <b>${n3(ans['H' + p])}</b>`);
      });
      const desc = (lv, seq) => lv.rows.filter(o => o.kind !== 'start').map((o, i) => `${o.pt}${o.kind === 'is' ? '（間視）' : ''}：v = ${S.fmtNum(o.v, 3, true)}`).join('、');
      const steps = [
        E.step('① 往測閉合差', `[b] = ${n3(F.lv.sumBS)}，[f] = ${n3(F.lv.sumFS)}`, `W = [b] − [f] = <b>${S.fmtNum(F.lv.W, 3, true)}</b> m（n = ${F.lv.n} 站，每站 ${S.fmtNum(-F.lv.W / F.lv.n * 1000, 2)} mm）`, desc(F.lv)),
        E.step('② 返測閉合差', `[b] = ${n3(B.lv.sumBS)}，[f] = ${n3(B.lv.sumFS)}`, `W = <b>${S.fmtNum(B.lv.W, 3, true)}</b> m（n = ${B.lv.n} 站）`, desc(B.lv)),
        E.step('③ 平均高程', ...lines)
      ];
      return { ans, steps, extra: { F: F.lv, B: B.lv } };
    },

    grade(ctx) {
      const { V, sol, truth } = ctx; const items = [], hints = [];
      items.push(G.TK.fieldItem(1, '使用儀器是否適當及熟練', 4, ctx));
      let bookOk = !!sol;
      if (sol) for (const pre of ['f', 'b']) { const seq = pre === 'f' ? FWD : BWD; seq.forEach((r, i) => { if (i > 0 && E.errMM(V(`${pre}${i}_h`), sol[`${pre}${i}_h`]) > 0) bookOk = false; }); }
      items.push(E.item(2, '手簿記錄及計算', 4, bookOk ? 4 : 0, 'calc', bookOk ? '高程差計算正確' : '手簿高程差有誤或未填'));
      if (sol) {
        const sc = w => E.band(Math.round(Math.abs(w) * 1000), [[6, 10], [9, 8], [12, 6], [15, 4], [18, 2]]);
        items.push(E.item(3, '往返測閉合差', 20, sc(sol.fW) + sc(sol.bW), 'obs', `往測 |W| = ${Math.round(Math.abs(sol.fW) * 1000)} mm → ${sc(sol.fW)}/10；返測 |W| = ${Math.round(Math.abs(sol.bW) * 1000)} mm → ${sc(sol.bW)}/10`));
      }
      if (truth) {
        const list = [];
        P4.forEach(p => { const fk = 'f' + idx(FWD, p) + '_Ha', bk = 'b' + idx(BWD, p) + '_Ha'; list.push({ label: '往' + p, stu: V(fk), ref: truth[fk], kind: 'mm' }, { label: '返' + p, stu: V(bk), ref: truth[bk], kind: 'mm' }); });
        let r = E.subScore(list, [[5, 8], [8, 6], [11, 4], [14, 2]], 8);
        items.push(E.item(4, '往返測 B、C、D、E 改正後高程', 64, r.got, 'calc', r.detail));
        r = E.subScore(P4.map(p => ({ label: p, stu: V('H' + p), ref: truth['H' + p], kind: 'mm' })), [[5, 2], [10, 1]], 2);
        items.push(E.item(5, 'B、C、D、E 高程平均值', 8, r.got, 'calc', r.detail));
      } else {
        items.push(E.item(4, '往返測 B、C、D、E 改正後高程', 64, 0, 'calc', '實測模式：需監評標準值', { na: true }));
        items.push(E.item(5, 'B、C、D、E 高程平均值', 8, 0, 'calc', '實測模式：需監評標準值', { na: true }));
      }
      if (sol) {
        for (const pre of ['f', 'b']) {
          const seq = pre === 'f' ? FWD : BWD, W = sol[pre + 'W'];
          if (isFinite(V(pre + 'sumFS'))) {
            const withIS = S.rnd(seq.reduce((a, r, i) => a + (isFinite(V(`${pre}${i}_fs`)) ? V(`${pre}${i}_fs`) : 0) + (isFinite(V(`${pre}${i}_is`)) ? V(`${pre}${i}_is`) : 0), 0), 3);
            if (E.errMM(V(pre + 'sumFS'), withIS) === 0 && E.errMM(withIS, sol[pre + 'sumFS']) > 0) hints.push({ lvl: 'bad', msg: `${pre === 'f' ? '往' : '返'}測前視總和 [f] 不應包含間視讀數。` });
          }
          const vEnd = V(`${pre}${seq.length - 1}_v`);
          if (isFinite(vEnd) && W !== 0 && vEnd !== 0 && Math.sign(vEnd) === Math.sign(W)) hints.push({ lvl: 'bad', msg: `${pre === 'f' ? '往' : '返'}測改正數符號應與閉合差相反（終點改正數 = −W）。` });
          seq.forEach((r, i) => {
            if (r.ty !== 'is') return;
            const stu = V(`${pre}${i}_v`), right = sol[`${pre}${i}_v`];
            const wrong = S.cumCorr(W, seq.slice(0, i + 1).filter((x, j) => j > 0 && x.ty !== 'is').length + 1, 6);
            if (isFinite(stu) && stu !== right && E.errMM(stu, wrong) === 0) hints.push({ lvl: 'warn', msg: `間視點 ${r.pt} 的改正數應取該站後視點之累積改正數（${S.fmtNum(right, 3, true)}），間視點不增加測站數。` });
          });
        }
        if (Math.abs(sol.fW) > 0.018 || Math.abs(sol.bW) > 0.018) hints.push({ lvl: 'bad', msg: '閉合差超過 18mm（評分得 0 分），請檢查讀數或是否有轉點移動。' });
      }
      return { items, hints };
    },

    draw(V, sol) {
      if (!sol) return E.emptySVG(520, 300, '完成往返測觀測後顯示高程剖面');
      const mk = (lv, color, name, dash) => {
        let x = 0; const pts = [];
        lv.rows.forEach((o, i) => { if (o.kind !== 'is') { pts.push({ x, y: o.Ha, label: o.pt.startsWith('TP') ? '' : o.pt, r: o.pt.startsWith('TP') ? 2.5 : 4 }); x += 1; } });
        return { name, color, dash, pts };
      };
      const isPts = (lv, pre) => {
        const out = []; let x = 0;
        lv.rows.forEach(o => { if (o.kind === 'is') out.push({ x: x - 0.5, y: o.Ha, label: o.pt }); else x += 1; });
        return out;
      };
      const F = sol.__extra ? sol.__extra.F : null;
      return E.profileSVG({
        h: 320, yTitle: '改正後高程 (m)',
        series: [mk(sol.__lvF, '#ea580c', '往測（轉點）'), mk(sol.__lvB, '#2563eb', '返測（轉點）', '5 4'),
          { name: '間視點', color: '#16a34a', w: 0.01, pts: isPts(sol.__lvF).concat(isPts(sol.__lvB)) }],
        xTicks: [0, 1, 2, 3, 4, 5, 6].map(i => ({ x: i, label: i === 0 ? 'A' : i === 6 ? 'A' : '站' + i }))
      });
    }
  };
  // 為繪圖保留路線結果
  const _solve = task.solve;
  task.solve = V => { const r = _solve(V); r.ans.__lvF = r.extra.F; r.ans.__lvB = r.extra.B; return r; };
  G.TK.register(task);
})(window);
