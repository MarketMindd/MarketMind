import { Fragment, type ReactNode } from 'react';

const NUMBER = '\\$?\\d[\\d,]*(?:\\.\\d+)?%';
const SIGNED = `[+-]${NUMBER}`;
const UP_WORDS = 'up|gained?|rose|risen|rising|increased?|higher|climbed|surged|jumped|grew|growing';
const DOWN_WORDS = 'down|dropped?|fell|fallen|falling|decreased?|lower|declined?|slipped|sank|sunk|plunged';

const PRICE_CHANGE_REGEX = new RegExp(
  `(${SIGNED})` +
    `|\\b(?:${UP_WORDS})\\b[^.%\\n]{0,30}?(${NUMBER})` +
    `|\\b(?:${DOWN_WORDS})\\b[^.%\\n]{0,30}?(${NUMBER})`,
  'gi',
);

const splitAndWrap = (
  text: string,
  pattern: RegExp,
  classNameFor: (part: string) => string | undefined,
  fallback: (part: string) => ReactNode = (part) => part,
) => {
  const parts = text.split(pattern);
  if (parts.length === 1) return fallback(text);

  return (
    <>
      {parts.map((part, i) => {
        const className = classNameFor(part);
        if (className) {
          return (
            <span key={i} className={className}>
              {part}
            </span>
          );
        }
        return <Fragment key={i}>{fallback(part)}</Fragment>;
      })}
    </>
  );
};

export const colorizePriceChanges = (text: string): ReactNode => {
  if (!text) return text;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(PRICE_CHANGE_REGEX)) {
    const start = match.index ?? 0;
    const [fullMatch, signed, upNumber, downNumber] = match;
    const number = signed ?? upNumber ?? downNumber ?? '';
    const isPositive = signed ? signed.startsWith('+') : Boolean(upNumber);
    const prefix = fullMatch.slice(0, fullMatch.length - number.length);

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    if (prefix) nodes.push(prefix);
    nodes.push(
      <span
        key={key++}
        className={isPositive ? 'text-success font-semibold' : 'text-destructive font-semibold'}
      >
        {number}
      </span>,
    );
    lastIndex = start + fullMatch.length;
  }

  if (nodes.length === 0) return text;
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return <>{nodes}</>;
};

export const highlightText = (text: string, riskTolerance: string, interests: string[]) => {
  if (!text) return text;

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const terms = [riskTolerance, ...interests].filter(Boolean);
  if (terms.length === 0) return colorizePriceChanges(text);

  const searchTerms: string[] = [];
  for (const term of terms) {
    searchTerms.push(escapeRegExp(term));
    const splitTerm = term.replace(/([A-Z])/g, ' $1').trim();
    if (splitTerm !== term) {
      searchTerms.push(escapeRegExp(splitTerm));
    }
  }

  const pattern = new RegExp(`\\b(${searchTerms.join('|')})\\b`, 'gi');

  return splitAndWrap(
    text,
    pattern,
    (part) => {
      const lowercasePart = part.toLowerCase();
      const matchesAnyTerm = searchTerms.some(
        (st) => lowercasePart === st.toLowerCase().replace(/\\/g, ''),
      );
      return matchesAnyTerm ? 'text-primary font-semibold' : undefined;
    },
    colorizePriceChanges,
  );
};
