export const highlightText = (text: string, riskTolerance: string, interests: string[]) => {
  if (!text) return text;

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const terms = [riskTolerance, ...interests].filter(Boolean);
  if (terms.length === 0) return text;

  const searchTerms: string[] = [];
  for (const term of terms) {
    searchTerms.push(escapeRegExp(term));
    const splitTerm = term.replace(/([A-Z])/g, ' $1').trim();
    if (splitTerm !== term) {
      searchTerms.push(escapeRegExp(splitTerm));
    }
  }

  const pattern = new RegExp(`\\b(${searchTerms.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) => {
        const lowercasePart = part.toLowerCase();
        const matchesAnyTerm = searchTerms.some(
          (st) => lowercasePart === st.toLowerCase().replace(/\\/g, ''),
        );

        if (matchesAnyTerm) {
          return (
            <span key={i} className="text-primary font-semibold">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};
