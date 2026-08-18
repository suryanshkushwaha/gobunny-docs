/**
 * next/link and next/image prefix basePath automatically; a raw fetch() does
 * not. Anything that reaches for a file in public/ has to prepend this.
 *
 * NEXT_PUBLIC_ vars are inlined at build time, so this is a constant in the
 * bundle rather than a runtime lookup.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
