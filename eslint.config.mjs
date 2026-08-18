// eslint-config-next 16 ships native flat configs, so they are imported
// directly rather than wrapped in FlatCompat.
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      // Machine-written, and regenerated on every build.
      'lib/docs/manifest.generated.ts',
      'lib/docs/registry.generated.ts',
    ],
  },
];

export default config;
