import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

// Hosting is still undecided, so both targets are supported without a code
// change. Default build serves from the root (Vercel / Cloudflare). For GitHub
// Pages under a project path, set both:
//   STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/gobunny-docs pnpm build
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const isStaticExport = process.env.STATIC_EXPORT === '1';

// rehype-pretty-code emits both themes as CSS variables on every token, and
// globals.css picks one per colour scheme. keepBackground:false hands the block
// background back to us so it can use the GoBunny --muted token instead of
// whatever the Shiki theme ships.
const prettyCodeOptions = {
  theme: { light: 'github-light-default', dark: 'github-dark-default' },
  keepBackground: false,
  defaultLang: 'plaintext',
};

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx'],
  basePath: basePath || undefined,
  output: isStaticExport ? 'export' : undefined,
  images: { unoptimized: isStaticExport },
  trailingSlash: false,
};

// Plugins are passed as string names rather than imported functions so they
// stay serialisable for Turbopack, which is the default bundler in Next 16.
const withMDX = createMDX({
  options: {
    // remark-frontmatter must be passed bare: an options object is read as a
    // custom "matter" definition and rejected for having no `type`. Bare means
    // its default, which is YAML — what the docs use.
    remarkPlugins: ['remark-frontmatter', ['remark-gfm', {}]],
    rehypePlugins: ['rehype-slug', ['rehype-pretty-code', prettyCodeOptions]],
  },
});

export default withMDX(nextConfig);
