const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: tüm workspace'i izle (packages/ dahil)
config.watchFolders = [workspaceRoot];

// Node modules'ü hem proje hem workspace root'tan çöz
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm symlink'lerini takip et
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
