/** 
 * pnpmfile.cjs – hooks to modify package manifests before install
 */
module.exports = {
  hooks: {
    readPackage(pkg) {
      // Strip noisy peer dependency metadata
      delete pkg.peerDependenciesMeta
      return pkg
    }
  }
}