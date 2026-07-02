/**
 * M3 typography tokens, per Nexo's spec:
 *
 * - Poppins ("brand"): titles, emphasis, and labels. Its modern,
 *   geometric design with clean lines and rounded shapes adds clarity
 *   and visual appeal. https://fonts.google.com/specimen/Poppins
 * - Open Sans ("plain"): paragraphs and long-form text. Its humanist,
 *   readable design works well even in long text blocks and across
 *   sizes/resolutions; it's also more accessible for people with
 *   dyslexia. https://fonts.google.com/specimen/Open+Sans
 *
 * Note: Angular Material's M3 engine only exposes two families at the
 * global level (`brand-family`/`plain-family`), mapped by default to
 * brand -> display/headline/title, plain -> body/label. Nexo departs
 * from that: it also asks for Poppins in label (see `_typography.scss`).
 * That's why the full type scale (`$coto-type-scale` in
 * `_typography.scss`) sets every level explicitly — family included —
 * instead of relying on `mat.theme()`'s automatic mapping.
 */
export interface M3TypographyTokens {
  /** Poppins — display, headline, title, and label (label is the exception to the M3 default categories). */
  brandFamily: string;
  /** Open Sans — body. */
  plainFamily: string;
}

export const COTO_TYPOGRAPHY: M3TypographyTokens = {
  brandFamily: '"Poppins", sans-serif',
  plainFamily: '"Open Sans", sans-serif',
};
