import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin.js';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  externals: [
    nodeExternals({
      modulesDir: join(__dirname, '..', '..', 'node_modules'),
      allowlist: [/^@market-mind\//],
    }),
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
      externalDependencies: [],
      mergeExternals: true,
    }),
  ],
};
