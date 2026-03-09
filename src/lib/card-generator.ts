export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export interface GeneratedCard {
  number: string;
  month: string;
  year: string;
  cvv: string;
  formatted: string;
}

export interface BinInfo {
  network: CardNetwork;
  cardLength: number;
  cvvLength: number;
  label: string;
}

export const NETWORK_BINS: Record<Exclude<CardNetwork, 'unknown'>, string> = {
  visa: '414720',
  mastercard: '530185',
  amex: '378282',
  discover: '601100',
};

function luhnComplete(partial: string): string {
  const digits = partial.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const posFromRight = i + 1;
    let d = digits[digits.length - 1 - i];
    if (posFromRight % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return partial + ((10 - (sum % 10)) % 10);
}

function randomDigits(count: number): string {
  let r = '';
  for (let i = 0; i < count; i++) r += Math.floor(Math.random() * 10).toString();
  return r;
}

export function detectNetwork(bin: string): CardNetwork {
  if (bin.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(bin)) return 'mastercard';
  if (/^3[47]/.test(bin)) return 'amex';
  if (/^6(?:011|5|4[4-9])/.test(bin)) return 'discover';
  return 'unknown';
}

export function getBinInfo(bin: string): BinInfo {
  const network = detectNetwork(bin);
  const isAmex = network === 'amex';
  const labels: Record<CardNetwork, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    unknown: 'Unknown',
  };
  return {
    network,
    cardLength: isAmex ? 15 : 16,
    cvvLength: isAmex ? 4 : 3,
    label: labels[network],
  };
}

export function generateFromBin(
  bin: string,
  month: string | 'random',
  year: string | 'random',
  cvv: string | 'random',
  quantity: number,
  formatTemplate?: string
): GeneratedCard[] {
  const cards: GeneratedCard[] = [];
  const cleanBin = bin.replace(/x/gi, '').replace(/\s/g, '');
  const length = detectNetwork(cleanBin) === 'amex' ? 15 : 16;
  const cvvLength = detectNetwork(cleanBin) === 'amex' ? 4 : 3;

  for (let i = 0; i < quantity; i++) {
    const partial = cleanBin + randomDigits(length - cleanBin.length - 1);
    const number = luhnComplete(partial);
    const mm = month === 'random' ? String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') : month;
    const yy = year === 'random' ? String(new Date().getFullYear() + Math.floor(Math.random() * 10)).slice(-2) : year;
    const cc = cvv === 'random' ? randomDigits(cvvLength) : cvv;
    const formatted = formatTemplate
      ? formatTemplate
          .replace(/\{number\}/g, number)
          .replace(/\{mm\}/g, mm)
          .replace(/\{yy\}/g, yy)
          .replace(/\{cvv\}/g, cc)
      : `${number}|${mm}|${yy}|${cc}`;
    cards.push({ number, month: mm, year: yy, cvv: cc, formatted });
  }
  return cards;
}

export function validateLuhn(num: string): boolean {
  const digits = num.replace(/\s/g, '').split('').map(Number);
  if (digits.some(isNaN) || digits.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[digits.length - 1 - i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function exportCards(cards: GeneratedCard[], format: 'txt' | 'csv' | 'json'): string {
  switch (format) {
    case 'txt':
      return cards.map((c) => c.formatted).join('\n');
    case 'csv':
      return 'Number,Month,Year,CVV\n' + cards.map((c) => `${c.number},${c.month},${c.year},${c.cvv}`).join('\n');
    case 'json':
      return JSON.stringify(
        cards.map((c) => ({ number: c.number, month: c.month, year: c.year, cvv: c.cvv })),
        null,
        2
      );
  }
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
