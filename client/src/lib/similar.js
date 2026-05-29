export function findSimilar(target, all, n = 4) {
  if (!target || !Array.isArray(all)) return [];

  const targetCc = Number(target.engineCc) || 0;
  const targetPrice = Number(target.price) || 0;

  return all
    .filter((m) => m.id !== target.id)
    .map((m) => {
      let score = 0;
      if (m.type === target.type) score += 50;
      if (m.brand === target.brand) score += 15;

      const cc = Number(m.engineCc) || 0;
      if (targetCc > 0) {
        const ccDiff = Math.abs(cc - targetCc) / targetCc;
        if (ccDiff < 0.2) score += 25 * (1 - ccDiff / 0.2);
      }

      const price = Number(m.price) || 0;
      if (targetPrice > 0) {
        const priceDiff = Math.abs(price - targetPrice) / targetPrice;
        if (priceDiff < 0.3) score += 20 * (1 - priceDiff / 0.3);
      }

      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.m);
}
