/* =========================================================
 * levelkit.js — 水準手簿共用：路線定義 → 手簿格線、模擬觀測、求解
 * 路線 seq：[{pt, ty:'bs'|'tp'|'is'|'end'}]
 *   bs 起點（只有後視） tp 轉點（前視+後視） is 間視點 end 終點（只有前視）
 * ========================================================= */
(function (G) {
  'use strict';
  const S = G.SU, E = G.SE, { O, A, L } = G.TK;

  /** 產生「後視/間視/前視/高程差/高程計算值/改正數/改正後高程」手簿列 */
  function bookRows(pre, seq, opt = {}) {
    const rows = seq.map((r, i) => {
      const k = `${pre}${i}`;
      const bs = (r.ty === 'bs' || r.ty === 'tp') ? O(k + '_bs', 'num', { d: 3 }) : L('');
      const is = r.ty === 'is' ? O(k + '_is', 'num', { d: 3 }) : L('');
      const fs = (r.ty === 'tp' || r.ty === 'end') ? O(k + '_fs', 'num', { d: 3 }) : L('');
      const cells = [L(r.pt, { cls: r.ty === 'is' ? 'pt is' : 'pt' }), bs];
      if (!opt.noIS) cells.push(is);
      cells.push(fs);
      cells.push(r.ty === 'bs' ? L('') : A(k + '_h', 'num', { d: 3, signed: true }));
      cells.push(A(k + '_Hc', 'num', { d: 3 }), r.ty === 'bs' ? L('0.000') : A(k + '_v', 'num', { d: 3, signed: true }), A(k + '_Ha', 'num', { d: 3 }));
      return cells;
    });
    const span = opt.noIS ? 1 : 2;
    rows.push([L('後視總和 [b]', { cls: 'pt' }), A(pre + 'sumBS', 'num', { d: 3 }), L('前視總和 [f]', { cs: span }), A(pre + 'sumFS', 'num', { d: 3 }), L('閉合差 W'), A(pre + 'W', 'num', { d: 3, signed: true }), L('')]);
    return rows;
  }
  function bookHead(noIS) {
    return [noIS ? ['測點', '後視', '前視', '高程差 (±)', '高程計算值', '改正數', '改正後高程'] : ['測點', '後視', '間視', '前視', '高程差 (±)', '高程計算值', '改正數', '改正後高程']];
  }

  /** 讀取觀測值並以 levelRoute 求解；回傳 ans 物件片段 */
  function solveBook(V, pre, seq, H0, Hend) {
    const rows = seq.map((r, i) => ({ pt: r.pt, bs: V(`${pre}${i}_bs`), is: V(`${pre}${i}_is`), fs: V(`${pre}${i}_fs`) }));
    const need = [];
    seq.forEach((r, i) => {
      if (r.ty === 'bs' || r.ty === 'tp') need.push(`${pre}${i}_bs`);
      if (r.ty === 'is') need.push(`${pre}${i}_is`);
      if (r.ty === 'tp' || r.ty === 'end') need.push(`${pre}${i}_fs`);
    });
    V.req(...need);
    const lv = E.levelRoute(rows, H0, Hend);
    const ans = {};
    lv.rows.forEach((o, i) => {
      const k = `${pre}${i}`;
      if (i > 0) { ans[k + '_h'] = o.h; ans[k + '_v'] = o.v; }
      ans[k + '_Hc'] = o.Hc; ans[k + '_Ha'] = o.Ha;
    });
    ans[pre + 'sumBS'] = lv.sumBS; ans[pre + 'sumFS'] = lv.sumFS; ans[pre + 'W'] = lv.W;
    return { ans, lv };
  }

  /**
   * 模擬水準觀測：H 為各點真實高程（含轉點），回傳 {obs, obsPerfect}
   * sigma 單位 m
   */
  function simulate(pre, seq, H, sigma, blunderIdx = -1) {
    const obs = {}, perf = {};
    let HI = NaN, HIp = NaN;
    seq.forEach((r, i) => {
      const k = `${pre}${i}`;
      const h = H[r.key || r.pt];
      if (r.ty === 'is' || r.ty === 'tp' || r.ty === 'end') {
        const p = HIp - h;
        perf[k + (r.ty === 'is' ? '_is' : '_fs')] = p;
        obs[k + (r.ty === 'is' ? '_is' : '_fs')] = S.rnd(p + S.noise(sigma) + (i === blunderIdx ? 0.01 : 0), 3);
      }
      if (r.ty === 'bs' || r.ty === 'tp') {
        const b = S.rnd(S.rand(1.15, 1.85), 3);
        perf[k + '_bs'] = b; obs[k + '_bs'] = S.rnd(b + S.noise(sigma), 3);
        HIp = h + b;
      }
    });
    return { obs, obsPerfect: perf };
  }

  G.LK = { bookRows, bookHead, solveBook, simulate };
})(window);
