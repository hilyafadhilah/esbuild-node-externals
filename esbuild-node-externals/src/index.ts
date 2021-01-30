import { Plugin } from 'esbuild';
import { findPackagePaths, findDependencies } from './utils';

export interface Options {
  packagePath?: string | string[];
  dependencies?: boolean;
  devDependencies?: boolean;
  peerDependencies?: boolean;
  optionalDependencies?: boolean;
}

export const nodeExternalsPlugin = (paramsOptions: Options = {}): Plugin => {
  const options = {
    dependencies: true,
    devDependencies: true,
    peerDependencies: true,
    optionalDependencies: true,
    ...paramsOptions,
    packagePath:
      paramsOptions.packagePath && typeof paramsOptions.packagePath === 'string'
        ? [paramsOptions.packagePath]
        : (paramsOptions.packagePath as string[] | undefined),
  };

  const nodeModules = findDependencies({
    packagePaths: options.packagePath
      ? options.packagePath
      : findPackagePaths(),
    dependencies: options.dependencies,
    devDependencies: options.devDependencies,
    peerDependencies: options.peerDependencies,
    optionalDependencies: options.optionalDependencies,
  });

  return {
    name: 'node-externals',
    setup(build) {
      // On every module resolved, we check if the module name should be an external
      build.onResolve({ namespace: 'file', filter: /.*/ }, (args) => {

        // Mark the module as external so it is not resolved
        if (nodeModules.find((module) => args.path.indexOf(module) === 0)) {
          return { path: args.path, external: true };
        }

        return null;
      });
    },
  };
};

export default nodeExternalsPlugin;
