const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: workspace root'u izle (node_modules erişimi için şart)
config.watchFolders = [workspaceRoot];

// Node modules'ü hem proje hem workspace root'tan çöz
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm symlink'lerini takip et
config.resolver.unstable_enableSymlinks = true;

// Root node_modules'daki paketleri explicit olarak map et
// (pnpm hoisting bazı paketleri mobile/node_modules'a koymuyor)
config.resolver.extraNodeModules = {
  'expo-document-picker': path.resolve(workspaceRoot, 'node_modules/expo-document-picker'),
};

// Sürekli değişen klasörleri izleme dışında bırak
// (Next.js build dosyaları ve diğer projeler Metro'yu tetiklemesin)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
config.resolver.blockList = [
  new RegExp(escapeRegex(path.join(workspaceRoot, 'yeni akdemihubiai', '.next'))),
  new RegExp(escapeRegex(path.join(workspaceRoot, 'yeni akdemihubiai', 'node_modules'))),
  new RegExp(escapeRegex(path.join(workspaceRoot, 'akademihub'))),
  new RegExp(escapeRegex(path.join(workspaceRoot, 'perseonemuhasebe'))),
];

module.exports = config;
