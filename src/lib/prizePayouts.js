function formatMoney(value) {
  if (!value) return null;
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

function getCoveredPrizes(prizes, rank, tieCount) {
  const startIndex = Math.max(0, rank - 1);
  return prizes.slice(startIndex, startIndex + tieCount);
}

function formatPrizeRange(coveredPrizes) {
  return coveredPrizes.map((prize) => prize.placeLabel).join(" + ");
}

function buildPayoutLabel({ rankLabel, coveredPrizes, tieCount }) {
  if (!coveredPrizes.length) return null;

  const cashPool = coveredPrizes.reduce((sum, prize) => sum + (prize.cashValue || 0), 0);
  const nonCashPrizes = coveredPrizes.filter((prize) => !prize.cashValue);
  const cashEach = cashPool / tieCount;
  const cashLabel = formatMoney(cashEach);
  const nonCashLabel = nonCashPrizes.map((prize) => prize.prize).join(" + ");

  if (tieCount === 1) {
    return {
      shortLabel: `${coveredPrizes[0].placeLabel} · ${coveredPrizes[0].prize}`,
      detailLabel: coveredPrizes[0].prize,
      cashEach,
      coveredPrizes,
    };
  }

  const parts = [];
  if (cashLabel) parts.push(`projected ${cashLabel}`);
  if (nonCashLabel) parts.push(`${nonCashLabel} TBD`);
  const splitLabel = `Splits ${formatPrizeRange(coveredPrizes)} prizes`;

  return {
    shortLabel: `${rankLabel} · ${parts.join(" + ")}`,
    detailLabel: `${parts.join(" + ")} · ${splitLabel}`,
    cashEach,
    coveredPrizes,
  };
}

export function applyProjectedPayouts(sortedEntries, prizes = []) {
  sortedEntries.forEach((entry) => {
    entry.projectedPayout = null;
  });

  if (!prizes.length) return sortedEntries;

  let index = 0;
  while (index < sortedEntries.length) {
    const entry = sortedEntries[index];
    const tiedEntries = sortedEntries.filter((team) => team.totalScore === entry.totalScore);
    const rankLabel = tiedEntries.length > 1 ? `T${entry.rank}` : String(entry.rank);
    const payout = buildPayoutLabel({
      rankLabel,
      coveredPrizes: getCoveredPrizes(prizes, entry.rank, tiedEntries.length),
      tieCount: tiedEntries.length,
    });

    tiedEntries.forEach((team) => {
      team.projectedPayout = payout;
    });

    index += tiedEntries.length;
  }

  return sortedEntries;
}
