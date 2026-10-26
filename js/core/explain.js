/* =========================================================
 * explain.js — 欄位計算說明（v2）
 * 每題提供 explain(k, V, a)：
 *   k 欄位鍵、V 目前輸入值、a 依應檢人觀測值推算的全部答案
 * 回傳 { f: 公式, s: 代入數值, deps: [來源欄位鍵] }，無說明則回傳 null
 * ========================================================= */
(function (G) {
  'use strict';
  const S = G.SU;
  const d = x => S.fmtDMS(x), ds = x => S.fmtDMS(x, { signed: true });
  const n = x => S.fmtNum(x, 3), ns = x => S.fmtNum(x, 3, true);
  const X = (f, s, deps) => ({ f, s, deps: deps || [] });
  /** 正倒鏡平均 */
  const meanEx = (base, V) => X('正倒鏡平均值 = [正鏡 + (倒鏡 ± 180°)] / 2', `[${d(V(base + '_L'))} + (${d(V(base + '_R'))} − 180°)] / 2`, [base + '_L', base + '_R']);
  /** 天頂距 */
  const zenEx = (base, V) => X('天頂距 Z = (正鏡 − 倒鏡 + 360°) / 2', `(${d(V(base + '_L'))} − ${d(V(base + '_R'))} + 360°) / 2`, [base + '_L', base + '_R']);
  /** 兩點反算 */
  const invAz = (from, to, V, nk = p => [p + 'N', p + 'E']) => {
    const [fN, fE] = nk(from), [tN, tE] = nk(to);
    return X(`φ = tan⁻¹(ΔE / ΔN)，依 ΔE、ΔN 正負判斷象限`, `ΔE = ${n(V(tE))} − ${n(V(fE))} = ${ns(V(tE) - V(fE))}，ΔN = ${n(V(tN))} − ${n(V(fN))} = ${ns(V(tN) - V(fN))}`, [fN, fE, tN, tE]);
  };
  const invDist = (from, to, V, nk = p => [p + 'N', p + 'E']) => {
    const [fN, fE] = nk(from), [tN, tE] = nk(to);
    return X('距離 = √(ΔN² + ΔE²)', `√[(${n(V(tN))} − ${n(V(fN))})² + (${n(V(tE))} − ${n(V(fE))})²]`, [fN, fE, tN, tE]);
  };
  const EX = {};

  /* ---------- 試題一 閉合導線 ---------- */
  EX[1] = (k, V, a) => {
    const legs = { AB: ['A', 'B'], BC: ['B', 'C'], CD: ['C', 'D'], DA: ['D', 'A'] };
    const prevLeg = { B: 'AB', C: 'BC', D: 'CD', A: 'DA' };
    const ptFrom = { AB: 'A0', BC: 'B', CD: 'C', DA: 'D' };
    const ptTo = { AB: 'B', BC: 'C', CD: 'D', DA: 'A' };
    let m;
    if ((m = k.match(/^([CD]_[A-D])_M$/))) return meanEx(m[1], V);
    if (k === 'angC') return X('∠C = 前視 D 平均 − 後視 B 平均', `${d(a.C_D_M)} − ${d(a.C_B_M)}`, ['C_D_M', 'C_B_M']);
    if (k === 'angD') return X('∠D = 前視 A 平均 − 後視 C 平均', `${d(a.D_A_M)} − ${d(a.D_C_M)}`, ['D_A_M', 'D_C_M']);
    if (k === 'BCm') return X('平均值 = (第一次 + 第二次) / 2', `(${n(V('BC1'))} + ${n(V('BC2'))}) / 2`, ['BC1', 'BC2']);
    if (k === 'CDm') return X('平均值 = (第一次 + 第二次) / 2', `(${n(V('CD1'))} + ${n(V('CD2'))}) / 2`, ['CD1', 'CD2']);
    if (k === 'EA0') return X('起點 A 坐標照抄已知資料', `EA = ${n(V('AE'))}`, ['AE']);
    if (k === 'NA0') return X('起點 A 坐標照抄已知資料', `NA = ${n(V('AN'))}`, ['AN']);
    if (k === 'aA') return X('照抄已知 ∠A', d(V('angA')), ['angA']);
    if (k === 'aB') return X('照抄已知 ∠B', d(V('angB')), ['angB']);
    if (k === 'aC') return X('照抄手簿 ∠C（改正後平均值）', d(a.angC), ['angC']);
    if (k === 'aD') return X('照抄手簿 ∠D（改正後平均值）', d(a.angD), ['angD']);
    if ((m = k.match(/^v([A-D])$/))) return X('折角改正數 v = −fw / n（n = 4，餘數依序分配），Σv = −fw', `−(${a.fw}") / 4 → v${m[1]} = ${a[k]}"`, ['fw']);
    if (k === 'phiAB') return X('起始方位角照抄已知 φAB', d(V('phiAB0')), ['phiAB0']);
    const nextLeg = { phiBC: ['phiAB', 'B'], phiCD: ['phiBC', 'C'], phiDA: ['phiCD', 'D'], phiAB2: ['phiDA', 'A'] };
    if (nextLeg[k]) {
      const [pk, p] = nextLeg[k];
      return X(`φ前 = φ後 + β(改正後) − 180°（超過 360° 減 360°）${k === 'phiAB2' ? '；應等於 φAB 作為檢核' : ''}`, `${d(a[pk])} + (${d(a['a' + p])} ${a['v' + p] >= 0 ? '+' : '−'} ${Math.abs(a['v' + p])}") − 180°`, [pk, 'a' + p, 'v' + p]);
    }
    if ((m = k.match(/^S_(AB|BC|CD|DA)$/))) {
      const src = { AB: 'dAB', BC: 'BCm', CD: 'CDm', DA: 'dDA' }[m[1]];
      return X(`邊長 ${m[1]} 取${src.startsWith('d') ? '已知資料' : '距離手簿平均值'}`, n(V(src)), [src]);
    }
    if ((m = k.match(/^d([EN])_(AB|BC|CD|DA)$/))) {
      const L = m[2], fn = m[1] === 'E' ? 'sin' : 'cos', pk = L === 'AB' ? 'phiAB' : 'phi' + L;
      return X(`${m[1] === 'E' ? '橫距 ΔE = S·sinφ' : '縱距 ΔN = S·cosφ'}`, `${n(a['S_' + L])} × ${fn}${d(a[pk])}`, ['S_' + L, pk]);
    }
    if ((m = k.match(/^v([EN])_(AB|BC|CD|DA)$/))) {
      const W = 'W' + m[1];
      return X(`羅盤法則 v${m[1]} = −W${m[1]} × S / ΣS（mm 取整，餘數給較長邊）`, `−(${ns(a[W])}) × ${n(a['S_' + m[2]])} / ${n(a.sumS)}`, [W, 'S_' + m[2], 'sumS']);
    }
    if ((m = k.match(/^([EN])([A-D])$/))) {
      const c = m[1], p = m[2], L = prevLeg[p], from = ptFrom[L];
      return X(`${c}${p} = ${c}(前點) + Δ${c} + v${c}`, `${n(a[c + from])} + (${ns(a['d' + c + '_' + L])}) + (${ns(a['v' + c + '_' + L])})`, [c + from, 'd' + c + '_' + L, 'v' + c + '_' + L]);
    }
    if (k === 'sumAng') return X('Σβ = ∠A + ∠B + ∠C + ∠D', `${d(a.aA)} + ${d(a.aB)} + ${d(a.aC)} + ${d(a.aD)}`, ['aA', 'aB', 'aC', 'aD']);
    if (k === 'sumS') return X('ΣS = 四邊長總和', `${n(a.S_AB)} + ${n(a.S_BC)} + ${n(a.S_CD)} + ${n(a.S_DA)}`, ['S_AB', 'S_BC', 'S_CD', 'S_DA']);
    if (k === 'WE' || k === 'WN') { const c = k[1]; return X(`W${c} = ΣΔ${c}（閉合導線理論上應為 0）`, ['AB', 'BC', 'CD', 'DA'].map(L => ns(a['d' + c + '_' + L])).join(' + '), ['AB', 'BC', 'CD', 'DA'].map(L => 'd' + c + '_' + L)); }
    if (k === 'fw') return X(`fw = Σβ − 理論值（外角 (n+2)×180° = 1080°）`, `${d(a.sumAng)} − ${a._theo}°`, ['sumAng']);
    if (k === 'WL') return X('WL = √(WE² + WN²)', `√[(${ns(a.WE)})² + (${ns(a.WN)})²]`, ['WE', 'WN']);
    if (k === 'K') return X('閉合比數 = WL / ΣS = 1 / K ⇒ K = ΣS / WL', `${n(a.sumS)} / ${n(a.WL)}`, ['sumS', 'WL']);
    return null;
  };

  /* ---------- 試題二 前方交會 ---------- */
  EX[2] = (k, V, a) => {
    const nk = p => [p + 'N', p + 'E'];
    let m;
    if ((m = k.match(/^([AB]_[ABC])_M$/))) return meanEx(m[1], V);
    if (k === 'angA') return X('∠A = 照準 B 平均 − 照準 C 平均', `${d(a.A_B_M)} − ${d(a.A_C_M)}`, ['A_B_M', 'A_C_M']);
    if (k === 'angB') return X('∠B = 照準 C 平均 − 照準 A 平均', `${d(a.B_C_M)} − ${d(a.B_A_M)}`, ['B_C_M', 'B_A_M']);
    if (k === 'angC') return X('∠C = 180° − ∠A − ∠B', `180° − ${d(a.angA)} − ${d(a.angB)}`, ['angA', 'angB']);
    if (k === 'dAB') return invDist('A', 'B', V, nk);
    if (k === 'phiAB') return invAz('A', 'B', V, nk);
    if (k === 'phiAC') return X('φAC = φAB − ∠A（∠A 由 C 順時針量至 B）', `${d(a.phiAB)} − ${d(a.angA)}`, ['phiAB', 'angA']);
    if (k === 'dAC') return X('正弦定律 AC = AB·sin∠B / sin∠C', `${n(a.dAB)} × sin${d(a.angB)} / sin${d(a.angC)}`, ['dAB', 'angB', 'angC']);
    if (k === 'EcA') return X('Ec = EA + AC·sinφAC', `${n(V('AE'))} + ${n(a.dAC)} × sin${d(a.phiAC)}`, ['AE', 'dAC', 'phiAC']);
    if (k === 'NcA') return X('Nc = NA + AC·cosφAC', `${n(V('AN'))} + ${n(a.dAC)} × cos${d(a.phiAC)}`, ['AN', 'dAC', 'phiAC']);
    if (k === 'phiBC') return X('φBC = φAB − 180° + ∠B', `${d(a.phiAB)} − 180° + ${d(a.angB)}`, ['phiAB', 'angB']);
    if (k === 'dBC') return X('正弦定律 BC = AB·sin∠A / sin∠C', `${n(a.dAB)} × sin${d(a.angA)} / sin${d(a.angC)}`, ['dAB', 'angA', 'angC']);
    if (k === 'EcB') return X('Ec = EB + BC·sinφBC', `${n(V('BE'))} + ${n(a.dBC)} × sin${d(a.phiBC)}`, ['BE', 'dBC', 'phiBC']);
    if (k === 'NcB') return X('Nc = NB + BC·cosφBC', `${n(V('BN'))} + ${n(a.dBC)} × cos${d(a.phiBC)}`, ['BN', 'dBC', 'phiBC']);
    if (k === 'Ec') return X("Ec' = (由 A 之 Ec + 由 B 之 Ec) / 2", `(${n(a.EcA)} + ${n(a.EcB)}) / 2`, ['EcA', 'EcB']);
    if (k === 'Nc') return X("Nc' = (由 A 之 Nc + 由 B 之 Nc) / 2", `(${n(a.NcA)} + ${n(a.NcB)}) / 2`, ['NcA', 'NcB']);
    return null;
  };

  /* ---------- 試題三 光線法高程 ---------- */
  EX[3] = (k, V, a) => {
    const nk = p => [p + 'N', p + 'E'];
    if (k === 'ZA') return zenEx('ZA', V);
    if (k === 'ZC') return zenEx('ZC', V);
    if (k === 'alphaA') return X('垂直角 α = 90° − Z（仰角 +、俯角 −）', `90° − ${d(a.ZA)}`, ['ZA']);
    if (k === 'alphaC') return X('垂直角 α = 90° − Z（仰角 +、俯角 −）', `90° − ${d(a.ZC)}`, ['ZC']);
    if (k === 'B_A_M' || k === 'B_C_M') return meanEx(k.slice(0, -2), V);
    if (k === 'angB') return X('∠ABC = 照準 C 平均 − 照準 A 平均', `${d(a.B_C_M)} − ${d(a.B_A_M)}`, ['B_C_M', 'B_A_M']);
    if (k === 'dAB') return invDist('B', 'A', V, nk);
    if (k === 'phiBA') return invAz('B', 'A', V, nk);
    if (k === 'phiBC') return X('φBC = φBA + ∠ABC', `${d(a.phiBA)} + ${d(a.angB)}`, ['phiBA', 'angB']);
    if (k === 'NC') return X('NC = NB + BC·cosφBC', `${n(V('BN'))} + ${n(V('dBC'))} × cos${d(a.phiBC)}`, ['BN', 'dBC', 'phiBC']);
    if (k === 'EC') return X('EC = EB + BC·sinφBC', `${n(V('BE'))} + ${n(V('dBC'))} × sin${d(a.phiBC)}`, ['BE', 'dBC', 'phiBC']);
    if (k === 'HBi') return X('HB + iB = HA + IA − AB·tanαA', `${n(V('AH'))} + ${n(V('IA'))} − ${n(a.dAB)} × tan${ds(a.alphaA)}`, ['AH', 'IA', 'dAB', 'alphaA']);
    if (k === 'HC') return X('HC = (HB + iB) + BC·tanαC − IC', `${n(a.HBi)} + ${n(V('dBC'))} × tan${ds(a.alphaC)} − ${n(V('IC'))}`, ['HBi', 'dBC', 'alphaC', 'IC']);
    return null;
  };

  /* ---------- 試題四 空間點位 ---------- */
  EX[4] = (k, V, a) => {
    const st = V('st') === 'Q' ? 'Q' : 'P', ob = st === 'P' ? 'Q' : 'P';
    let m;
    if ((m = k.match(/^(S_[OABC])_M$/))) return meanEx(m[1], V);
    if ((m = k.match(/^ang([ABC])$/))) return X(`∠${ob}${st}${m[1]} = 照準 ${m[1]} 平均 − 後視平均`, `${d(a['S_' + m[1] + '_M'])} − ${d(a.S_O_M)}`, ['S_' + m[1] + '_M', 'S_O_M']);
    if ((m = k.match(/^d([ABC])$/))) return X('平均值 = (第一次 + 第二次) / 2', `(${n(V('d' + m[1] + '1'))} + ${n(V('d' + m[1] + '2'))}) / 2`, ['d' + m[1] + '1', 'd' + m[1] + '2']);
    if ((m = k.match(/^Z([ABC])$/))) return zenEx('Z' + m[1], V);
    if ((m = k.match(/^al([ABC])$/))) return X('垂直角 α = 90° − Z', `90° − ${d(a['Z' + m[1]])}`, ['Z' + m[1]]);
    if ((m = k.match(/^([NE])([ABC])$/))) {
      const c = m[1], p = m[2], fn = c === 'N' ? 'cos' : 'sin';
      return X(`${c}${p} = ${c}${st} + d·${fn}(φ${st}${ob} + ∠${p})`, `${n(V(st + c))} + ${n(a['d' + p])} × ${fn}${d(a['phi' + p])}（φ${st}${p} = φ${st}${ob} + ${d(a['ang' + p])}）`, [st + c, st + 'N', st + 'E', ob + 'N', ob + 'E', 'ang' + p, 'd' + p]);
    }
    if ((m = k.match(/^H([ABC])$/))) {
      const p = m[1];
      return X(`H${p} = H${st} + i + d·tanα − t${p}`, `${n(V(st + 'H'))} + ${n(V('iS'))} + ${n(a['d' + p])} × tan${ds(a['al' + p])} − ${n(V('t' + p))}`, [st + 'H', 'iS', 'd' + p, 'al' + p, 't' + p]);
    }
    const P6 = ['NA', 'EA', 'NB', 'EB', 'NC', 'EC'];
    if (k === 'aream2') return X('坐標法面積 A = ½|NA(EB−EC) + NB(EC−EA) + NC(EA−EB)|', `½|${n(a.NA)}(${n(a.EB)}−${n(a.EC)}) + ${n(a.NB)}(${n(a.EC)}−${n(a.EA)}) + ${n(a.NC)}(${n(a.EA)}−${n(a.EB)})|`, P6);
    if (k === 'area') return X('坪 = m² × 0.3025', `${S.fmtNum(a.aream2, 2)} × 0.3025`, ['aream2']);
    if (k === 'angInA') return X('∠A = |φAC − φAB|（取內角）', `φAB = ${d(S.azNE({ N: a.NA, E: a.EA }, { N: a.NB, E: a.EB }))}，φAC = ${d(S.azNE({ N: a.NA, E: a.EA }, { N: a.NC, E: a.EC }))}`, P6);
    if (k === 'dBC') return X('BC = √(ΔN² + ΔE²)', `√[(${n(a.NC)} − ${n(a.NB)})² + (${n(a.EC)} − ${n(a.EB)})²]`, ['NB', 'EB', 'NC', 'EC']);
    if (k === 'dHBC') return X('ΔHBC = HC − HB', `${n(a.HC)} − ${n(a.HB)}`, ['HC', 'HB']);
    if (k === 'gBC') return X('gBC = ΔHBC / BC × 100%', `${ns(a.dHBC)} / ${n(a.dBC)} × 100%`, ['dHBC', 'dBC']);
    if (k === 'dV') return X('ΔV = A / 3 × [(HA−Hd) + (HB−Hd) + (HC−Hd)]', `${S.fmtNum(a.aream2, 2)} / 3 × [(${n(a.HA)}−${n(V('Hd'))}) + (${n(a.HB)}−${n(V('Hd'))}) + (${n(a.HC)}−${n(V('Hd'))})]`, ['aream2', 'HA', 'HB', 'HC', 'Hd']);
    return null;
  };

  /* ---------- 試題五 單曲線 ---------- */
  EX[5] = (k, V, a) => {
    const nk = p => [p + 'N', p + 'E'];
    const sg = V('dir') === 'L' ? '−' : '+';
    if (k === 'T') return X('切線長 T = R·tan(I/2)', `${n(V('R'))} × tan(${d(V('I'))} / 2)`, ['R', 'I']);
    if (k === 'staA') return X('A 樁號 = V 樁號 − T', `${S.fmtSta(V('staV'))} − ${n(a.T)}`, ['staV', 'T']);
    if (k === 'staP') return X('P 樁號 = A 之後第一個整樁（整樁間距 20m）', `${S.fmtSta(a.staA)} → ${S.fmtSta(a.staP)}`, ['staA', 'step']);
    if (k === 'arcl') return X('弧長 l = P 樁號 − A 樁號', `${S.fmtSta(a.staP)} − ${S.fmtSta(a.staA)}`, ['staP', 'staA']);
    if (k === 'phiVD') return invAz('V', 'D', V, nk);
    if (k === 'delta') return X('偏角 δ = l / (2R)（弧度）× 180/π', `${n(a.arcl)} / (2 × ${n(V('R'))}) × 180/π`, ['arcl', 'R']);
    if (k === 'chord') return X('弦長 AP = 2R·sin[l/(2R)]', `2 × ${n(V('R'))} × sin(${n(a.arcl)} / ${n(2 * V('R'))} rad)`, ['R', 'arcl']);
    if (k === 'phiAP') return X(`φAP = φDV ${sg} δ（φDV = φVD − 180°；${sg === '+' ? '右' : '左'}偏）`, `${d(a.phiVD)} − 180° ${sg} ${d(a.delta)}`, ['phiVD', 'delta', 'dir']);
    if (k === 'NA') return X('Na = NV + T·cosφVD', `${n(V('VN'))} + ${n(a.T)} × cos${d(a.phiVD)}`, ['VN', 'T', 'phiVD']);
    if (k === 'EA') return X('Ea = EV + T·sinφVD', `${n(V('VE'))} + ${n(a.T)} × sin${d(a.phiVD)}`, ['VE', 'T', 'phiVD']);
    if (k === 'NP') return X('Np = Na + AP·cosφAP', `${n(a.NA)} + ${n(a.chord)} × cos${d(a.phiAP)}`, ['NA', 'chord', 'phiAP']);
    if (k === 'EP') return X('Ep = Ea + AP·sinφAP', `${n(a.EA)} + ${n(a.chord)} × sin${d(a.phiAP)}`, ['EA', 'chord', 'phiAP']);
    if (k === 'phiSF') return invAz('S', 'F', V, nk);
    if (k === 'dSF') return invDist('S', 'F', V, nk);
    const sx = { phiSA: ['A', 'az'], dSA: ['A', 'd'], phiSP: ['P', 'az'], dSP: ['P', 'd'] }[k];
    if (sx) {
      const [p, ty] = sx, deps = ['SN', 'SE', 'N' + p, 'E' + p];
      return ty === 'az' ? X('φ = tan⁻¹(ΔE / ΔN)，依象限修正', `ΔE = ${n(a['E' + p])} − ${n(V('SE'))}，ΔN = ${n(a['N' + p])} − ${n(V('SN'))}`, deps)
        : X('距離 = √(ΔN² + ΔE²)', `√[(${n(a['N' + p])} − ${n(V('SN'))})² + (${n(a['E' + p])} − ${n(V('SE'))})²]`, deps);
    }
    if (k === 'setA') return X('測設角 = φSA − φSF（自 F 順時針旋轉）', `${d(a.phiSA)} − ${d(a.phiSF)}`, ['phiSA', 'phiSF']);
    if (k === 'setP') return X('測設角 = φSP − φSF（自 F 順時針旋轉）', `${d(a.phiSP)} − ${d(a.phiSF)}`, ['phiSP', 'phiSF']);
    return null;
  };

  /* ---------- 試題六 視準軸＋附合水準 ---------- */
  EX[6] = (k, V, a) => {
    let m;
    if (k === 'x') return X('x = [(dB − dC) − (aB − aC)] / (2×25) × 206265"（+ 偏上）', `[(${n(V('D_B'))} − ${n(V('D_C'))}) − (${n(V('A_B'))} − ${n(V('A_C'))})] / 50 × 206265"`, ['D_B', 'D_C', 'A_B', 'A_C']);
    if ((m = k.match(/^dist_([pq][EFG])$/))) return X('視距 d = (上絲 − 下絲) × 100', `(${n(V(m[1] + 'u'))} − ${n(V(m[1] + 'l'))}) × 100`, [m[1] + 'u', m[1] + 'l']);
    if ((m = k.match(/^cor_([pq][EFG])$/))) return X('視準軸改正量 = −d·x / 206265"', `−${S.fmtNum(a['dist_' + m[1]], 1)} × ${a.x}" / 206265"`, ['dist_' + m[1], 'x']);
    if ((m = k.match(/^mid_([pq][EFG])$/))) return X('改正後中絲 = 中絲 + 改正量', `${n(V(m[1] + 'm'))} + (${ns(a['cor_' + m[1]])})`, [m[1] + 'm', 'cor_' + m[1]]);
    const copy = { bsE: 'mid_pE', fsF: 'mid_pF', bsF: 'mid_qF', fsG: 'mid_qG' }[k];
    if (copy) return X('照抄改正後中絲讀數', n(a[copy]), [copy]);
    if (k === 'h1') return X('高程差 = 後視 − 前視', `${n(a.bsE)} − ${n(a.fsF)}`, ['bsE', 'fsF']);
    if (k === 'h2') return X('高程差 = 後視 − 前視', `${n(a.bsF)} − ${n(a.fsG)}`, ['bsF', 'fsG']);
    if (k === 'HcE' || k === 'HaE') return X('起點 E 高程照抄已知', n(V('HE')), ['HE']);
    if (k === 'HcF') return X('高程計算值 = 前點高程 + 高程差', `${n(V('HE'))} + (${ns(a.h1)})`, ['HcE', 'h1']);
    if (k === 'HcG') return X('高程計算值 = 前點高程 + 高程差', `${n(a.HcF)} + (${ns(a.h2)})`, ['HcF', 'h2']);
    if (k === 'W') return X('閉合差 W = G 計算值 − G 已知高程', `${n(a.HcG)} − ${n(V('HG'))}`, ['HcG', 'HG']);
    if (k === 'vF') return X('改正數（等權、2 站）v = −W × 1 / 2', `−(${ns(a.W)}) × 1/2`, ['W']);
    if (k === 'vG') return X('改正數 v = −W × 2 / 2', `−(${ns(a.W)})`, ['W']);
    if (k === 'HF') return X('改正後高程 = 計算值 + 改正數', `${n(a.HcF)} + (${ns(a.vF)})`, ['HcF', 'vF']);
    if (k === 'HaG') return X('改正後高程 = 計算值 + 改正數（應等於已知 HG）', `${n(a.HcG)} + (${ns(a.vG)})`, ['HcG', 'vG']);
    return null;
  };

  /* ---------- 水準手簿共用說明（試題七、八） ---------- */
  function levelEx(k, V, a, pre, seq, H0key, Hendkey) {
    const m = k.match(new RegExp(`^${pre}(\\d+)_(h|Hc|v|Ha)$`));
    const startOf = i => { for (let j = i - 1; j >= 0; j--) if (seq[j].ty === 'bs' || seq[j].ty === 'tp') return j; return 0; };
    if (m) {
      const i = +m[1], f = m[2], r = seq[i];
      if (f === 'h') {
        const s0 = startOf(i), rk = `${pre}${i}_${r.ty === 'is' ? 'is' : 'fs'}`;
        return X(`高程差 = 本站後視（${seq[s0].pt}）− ${r.ty === 'is' ? '間視' : '前視'}（${r.pt}）`, `${n(V(`${pre}${s0}_bs`))} − ${n(V(rk))}`, [`${pre}${s0}_bs`, rk]);
      }
      if (f === 'Hc') {
        if (i === 0) return X('起點高程照抄已知', n(V(H0key)), [H0key]);
        const s0 = startOf(i);
        return X(`高程計算值 = 本站後視點（${seq[s0].pt}）高程 + 高程差`, `${n(a[`${pre}${s0}_Hc`])} + (${ns(a[`${pre}${i}_h`])})`, [`${pre}${s0}_Hc`, `${pre}${i}_h`]);
      }
      if (f === 'v') {
        const nSt = seq.filter((x, j) => j > 0 && (x.ty === 'tp' || x.ty === 'end')).length;
        const kSt = seq.slice(1, i + 1).filter(x => x.ty === 'tp' || x.ty === 'end').length;
        return X(r.ty === 'is' ? '間視點改正數 = 該站後視點的累積改正數 −W·k/n' : '改正數依測站數累積：v = −W × k / n', `−(${ns(a[pre + 'W'])}) × ${kSt} / ${nSt}`, [pre + 'W']);
      }
      if (f === 'Ha') return X('改正後高程 = 高程計算值 + 改正數', `${n(a[`${pre}${i}_Hc`])} + (${ns(i === 0 ? 0 : a[`${pre}${i}_v`])})`, i === 0 ? [`${pre}0_Hc`] : [`${pre}${i}_Hc`, `${pre}${i}_v`]);
    }
    if (k === pre + 'sumBS') { const ks = seq.map((r, i) => (r.ty === 'bs' || r.ty === 'tp') ? `${pre}${i}_bs` : null).filter(Boolean); return X('[b] = 所有後視讀數總和（不含間視）', ks.map(x => n(V(x))).join(' + '), ks); }
    if (k === pre + 'sumFS') { const ks = seq.map((r, i) => (r.ty === 'tp' || r.ty === 'end') ? `${pre}${i}_fs` : null).filter(Boolean); return X('[f] = 所有前視讀數總和（不含間視）', ks.map(x => n(V(x))).join(' + '), ks); }
    if (k === pre + 'W') return X('閉合差 W = [b] − [f] + (起點高程 − 終點已知高程)', `${n(a[pre + 'sumBS'])} − ${n(a[pre + 'sumFS'])} + (${n(V(H0key))} − ${n(V(Hendkey))})`, [pre + 'sumBS', pre + 'sumFS', H0key]);
    return null;
  }

  /* ---------- 試題七 閉合水準 ---------- */
  EX[7] = (k, V, a) => {
    const t = G.TASKS.find(x => x.id === 7);
    const FWD = t.__seq.f, BWD = t.__seq.b;
    if (/^f/.test(k)) return levelEx(k, V, a, 'f', FWD, 'HA', 'HA');
    if (/^b/.test(k)) return levelEx(k, V, a, 'b', BWD, 'HA', 'HA');
    const m = k.match(/^H([BCDE])$/);
    if (m) {
      const fi = FWD.findIndex(r => r.pt === m[1] && r.ty === 'is'), bi = BWD.findIndex(r => r.pt === m[1] && r.ty === 'is');
      return X(`H${m[1]} = (往測改正後 + 返測改正後) / 2`, `(${n(a[`f${fi}_Ha`])} + ${n(a[`b${bi}_Ha`])}) / 2`, [`f${fi}_Ha`, `b${bi}_Ha`]);
    }
    return null;
  };

  /* ---------- 試題八 中心樁縱斷面 ---------- */
  EX[8] = (k, V, a) => {
    const t = G.TASKS.find(x => x.id === 8);
    if (/^r/.test(k)) return levelEx(k, V, a, 'r', t.__seq, 'HA', 'HA');
    const P = ['A', 'B', 'C', 'D'], dk = { B: 'dAB', C: 'dBC', D: 'dCD' }, prev = { B: 'A', C: 'B', D: 'C' };
    const gk = { A: 'HA', B: 'HB', C: 'HC', D: 'HD' };
    let m;
    if (k === 'HB') return X('HB = (往測改正後 + 返測改正後) / 2', `(${n(a.r1_Ha)} + ${n(a.r5_Ha)}) / 2`, ['r1_Ha', 'r5_Ha']);
    if (k === 'HC') return X('HC = (往測改正後 + 返測改正後) / 2', `(${n(a.r2_Ha)} + ${n(a.r4_Ha)}) / 2`, ['r2_Ha', 'r4_Ha']);
    if (k === 'HD') return X('HD 只觀測一次，取改正後高程', n(a.r3_Ha), ['r3_Ha']);
    if ((m = k.match(/^sta([A-D])$/))) {
      const p = m[1];
      return p === 'A' ? X('A 點樁號照抄已知', S.fmtSta(V('staA0')), ['staA0']) : X(`${p} 樁號 = ${prev[p]} 樁號 + 水平距`, `${S.fmtSta(a['sta' + prev[p]])} + ${n(V(dk[p]))}`, ['sta' + prev[p], dk[p]]);
    }
    if ((m = k.match(/^Hp([A-D])$/))) {
      const p = m[1];
      return p === 'A' ? X("H'A = HA − A 點挖土深度", `${n(V('HA'))} − ${n(V('cutA0'))}`, ['HA', 'cutA0'])
        : X(`H'${p} = H'${prev[p]} + 坡度 × 水平距`, `${n(a['Hp' + prev[p]])} + ${S.fmtNum(V('g'), 2, true)}% × ${n(V(dk[p]))}`, ['Hp' + prev[p], 'g', dk[p]]);
    }
    if ((m = k.match(/^(cut|fill)([A-D])$/))) {
      const p = m[2];
      return X(`${m[1] === 'cut' ? '挖土深度 = 地面 − 計畫（> 0 才挖）' : '填土高度 = 計畫 − 地面（> 0 才填）'}`, `${n(p === 'A' ? V('HA') : a['H' + p])} − ${n(a['Hp' + p])} = ${ns((p === 'A' ? V('HA') : a['H' + p]) - a['Hp' + p])}`, [gk[p], 'Hp' + p]);
    }
    if (k === 'X0' || k === 'sta0') {
      const sg = a._seg;
      if (sg < 0) return X('A–D 間地面與計畫路面無交點', '—', []);
      const p0 = P[sg], p1 = P[sg + 1];
      if (k === 'sta0') return X(`無挖填樁號 = ${p0} 樁號 + X`, `${S.fmtSta(a['sta' + p0])} + ${n(a.X0)}`, ['sta' + p0, 'X0']);
      return X(`H'${p0} + g·X = H${p0} + (H${p1} − H${p0})·X / ${p0}${p1}`, `X = (地面 − 計畫)₍${p0}₎ / [(地面 − 計畫)₍${p0}₎ − (地面 − 計畫)₍${p1}₎] × ${n(V(dk[p1]))}`, [gk[p0], gk[p1], 'Hp' + p0, 'Hp' + p1, dk[p1]]);
    }
    return null;
  };

  /* ---------- 試題九 縱斷面豎曲線 ---------- */
  EX[9] = (k, V, a) => {
    const P7 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const gk = { A: 'H_A', B: 'HB', C: 'HC', D: 'HD', E: 'HE', F: 'HF', G: 'HGc' };
    let m;
    if (k === 'W') return X('W = (HA + Σ後視 − Σ前視) − HG', `(${n(V('HA'))} + ${n(V('bsA'))} + ${n(V('bsD'))} − ${n(V('fsD'))} − ${n(V('fsG'))}) − ${n(V('HG'))}`, ['HA', 'bsA', 'bsD', 'fsD', 'fsG', 'HG']);
    if (/^c(bsA|fsD|bsD|fsG)$/.test(k)) return X('−W 依序平均分配於 後視A、前視D、後視D、前視G（各約 −W/4，取至 mm，總和 = −W）', `−(${ns(a.W)}) / 4 ≈ ${S.fmtNum(-a.W / 4, 4, true)} → ${ns(a[k])}`, ['W']);
    if (k === 'HI1') return X('視準軸高程 HI₁ = HA + 後視A + 改正', `${n(V('HA'))} + ${n(V('bsA'))} + (${ns(a.cbsA)})`, ['HA', 'bsA', 'cbsA']);
    if (k === 'HI2') return X('HI₂ = HD + 後視D + 改正', `${n(a.HD)} + ${n(V('bsD'))} + (${ns(a.cbsD)})`, ['HD', 'bsD', 'cbsD']);
    if (k === 'H_A') return X('A 點高程照抄已知', n(V('HA')), ['HA']);
    if (k === 'HB' || k === 'HC') return X('間視點高程 = HI₁ − 間視讀數', `${n(a.HI1)} − ${n(V('is' + k[1]))}`, ['HI1', 'is' + k[1]]);
    if (k === 'HE' || k === 'HF') return X('間視點高程 = HI₂ − 間視讀數', `${n(a.HI2)} − ${n(V('is' + k[1]))}`, ['HI2', 'is' + k[1]]);
    if (k === 'HD') return X('HD = HI₁ − 前視D + 改正', `${n(a.HI1)} − ${n(V('fsD'))} + (${ns(a.cfsD)})`, ['HI1', 'fsD', 'cfsD']);
    if (k === 'HGc') return X('HG = HI₂ − 前視G + 改正（應等於已知 HG）', `${n(a.HI2)} − ${n(V('fsG'))} + (${ns(a.cfsG)})`, ['HI2', 'fsG', 'cfsG']);
    if ((m = k.match(/^Hd([A-G])$/))) {
      const x = P7.indexOf(m[1]) * (V('sp') || 20);
      return X("設計高程 H(x) = H'A + G1·x + (G2 − G1)·x² / (2L)", `${n(V('HpA'))} + ${S.fmtNum(V('G1'), 2, true)}% × ${x} + (${S.fmtNum(V('G2'), 2, true)}% − ${S.fmtNum(V('G1'), 2, true)}%) × ${x}² / (2 × ${V('Lv')})`, ['HpA', 'G1', 'G2', 'Lv']);
    }
    if ((m = k.match(/^(cut|fill)([A-G])$/))) {
      const p = m[2], g = a[gk[p]];
      return X(`${m[1] === 'cut' ? '挖土深度 = 樁頂 − 設計（> 0 才挖）' : '填土高度 = 設計 − 樁頂（> 0 才填）'}`, `${n(g)} − ${n(a['Hd' + p])} = ${ns(g - a['Hd' + p])}`, [gk[p], 'Hd' + p]);
    }
    return null;
  };

  /* ---------- 試題十 方格水準 ---------- */
  EX[10] = (k, V, a) => {
    const G4 = { 1: ['C', 'D', 'H', 'L', 'M', 'O'], 2: ['E', 'G', 'I', 'N'], 3: ['F', 'K'], 4: ['J'] };
    let m;
    const hd = { fT_h: ['fA_bs', 'fT_fs'], fB_h: ['fT_bs', 'fB_fs'], bT_h: ['bB_bs', 'bT_fs'], bA_h: ['bT_bs', 'bA_fs'] }[k];
    if (hd) return X('高程差 = 後視 − 前視', `${n(V(hd[0]))} − ${n(V(hd[1]))}`, hd);
    if (k === 'hAB') return X('往測 hAB = 兩站高程差相加', `${ns(a.fT_h)} + ${ns(a.fB_h)}`, ['fT_h', 'fB_h']);
    if (k === 'hBA') return X('返測 hBA = 兩站高程差相加', `${ns(a.bT_h)} + ${ns(a.bA_h)}`, ['bT_h', 'bA_h']);
    if (k === 'Wd') return X('較差 W = |hAB + hBA|', `|${ns(a.hAB)} + (${ns(a.hBA)})|`, ['hAB', 'hBA']);
    if (k === 'hm') return X('h̄AB = (hAB − hBA) / 2', `(${ns(a.hAB)} − (${ns(a.hBA)})) / 2`, ['hAB', 'hBA']);
    if (k === 'HB') return X('HB = HA + h̄AB', `${n(V('HA'))} + (${ns(a.hm)})`, ['HA', 'hm']);
    if (k === 'HIg') return X('視準軸高程 HI = HB + 後視', `${n(a.HB)} + ${n(V('gB_bs'))}`, ['HB', 'gB_bs']);
    if ((m = k.match(/^H([C-O])$/))) return X('地面高程 = HI − 前視', `${n(a.HIg)} − ${n(V('g' + m[1]))}`, ['HIg', 'g' + m[1]]);
    if ((m = k.match(/^s([1-4])$/))) {
      const pts = G4[m[1]];
      return X(`Σh${m[1]} = 屬於 ${m[1]} 個方格的點（${pts.join('、')}）高程和`, pts.map(p => n(a['H' + p])).join(' + '), pts.map(p => 'H' + p));
    }
    if (k === 'Vol') return X('V = a² / 4 × (Σh1 + 2Σh2 + 3Σh3 + 4Σh4)', `${V('a')}² / 4 × (${n(a.s1)} + 2×${n(a.s2)} + 3×${n(a.s3)} + 4×${n(a.s4)})`, ['a', 's1', 's2', 's3', 's4']);
    if (k === 'nCell') return X('方格數：本題 L 形配置共 6 格', '6', []);
    if (k === 'short') return X('土方不足 = a²·n·H設計 − V', `${V('a')}² × ${a.nCell} × ${n(V('Hd'))} − ${n(a.Vol)}`, ['a', 'nCell', 'Hd', 'Vol']);
    if (k === 'Hbal') return X("挖填平衡 H' = V / (a²·n)", `${n(a.Vol)} / (${V('a')}² × ${a.nCell})`, ['Vol', 'a', 'nCell']);
    return null;
  };

  G.EXPLAIN = EX;
})(window);
