"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setExcludedArchitectures = exports.addMapLibreInstallerBlock = exports.addInstallerBlock = exports.applyCocoaPodsModifications = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
let pkg = {
    name: '@maplibre/maplibre-react-native',
};
try {
    pkg = require('@maplibre/maplibre-react-native/package.json');
}
catch {
    // empty catch block
}
/**
 * Dangerously adds the custom installer hooks to the Podfile.
 * In the future this should be removed in favor of some custom hooks provided by Expo autolinking.
 *
 * https://github.com/maplibre/maplibre-react-native/blob/main/ios/install.md
 * @param config
 * @returns
 */
const withCocoaPodsInstallerBlocks = c => {
    return (0, config_plugins_1.withDangerousMod)(c, [
        'ios',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        async (config) => {
            const file = path_1.default.join(config.modRequest.platformProjectRoot, 'Podfile');
            const contents = await fs_1.promises.readFile(file, 'utf8');
            await fs_1.promises.writeFile(file, applyCocoaPodsModifications(contents), 'utf-8');
            return config;
        },
    ]);
};
// Only the preinstaller block is required, the post installer block is
// used for spm (swift package manager) which Expo doesn't currently support.
function applyCocoaPodsModifications(contents) {
    // Ensure installer blocks exist
    // let src = addInstallerBlock(contents, 'pre');
    let src = addInstallerBlock(contents, 'post');
    // src = addMapLibreInstallerBlock(src, 'pre');
    src = addMapLibreInstallerBlock(src, 'post');
    return src;
}
exports.applyCocoaPodsModifications = applyCocoaPodsModifications;
function addInstallerBlock(src, blockName) {
    const matchBlock = new RegExp(`${blockName}_install do \\|installer\\|`);
    const tag = `${blockName}_installer`;
    for (const line of src.split('\n')) {
        const contents = line.trim();
        // Ignore comments
        if (!contents.startsWith('#')) {
            // Prevent adding the block if it exists outside of comments.
            if (contents.match(matchBlock)) {
                // This helps to still allow revisions, since we enabled the block previously.
                // Only continue if the generated block exists...
                const modified = (0, generateCode_1.removeGeneratedContents)(src, tag);
                if (!modified) {
                    return src;
                }
            }
        }
    }
    return (0, generateCode_1.mergeContents)({
        tag,
        src,
        newSrc: [`  ${blockName}_install do |installer|`, '  end'].join('\n'),
        anchor: /use_react_native/,
        // We can't go after the use_react_native block because it might have parameters, causing it to be multi-line (see react-native template).
        offset: 0,
        comment: '#',
    }).contents;
}
exports.addInstallerBlock = addInstallerBlock;
function addMapLibreInstallerBlock(src, blockName) {
    return (0, generateCode_1.mergeContents)({
        tag: `@maplibre/maplibre-react-native-${blockName}_installer`,
        src,
        newSrc: `    $RNMBGL.${blockName}_install(installer)`,
        anchor: new RegExp(`${blockName}_install do \\|installer\\|`),
        offset: 1,
        comment: '#',
    }).contents;
}
exports.addMapLibreInstallerBlock = addMapLibreInstallerBlock;
/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
function setExcludedArchitectures(project) {
    const configurations = project.pbxXCBuildConfigurationSection();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (const { name, buildSettings } of Object.values(configurations || {})) {
        // Guessing that this is the best way to emulate Xcode.
        // Using `project.addToBuildSettings` modifies too many targets.
        if (name === 'Release' &&
            typeof buildSettings?.PRODUCT_NAME !== 'undefined') {
            buildSettings['"EXCLUDED_ARCHS[sdk=iphonesimulator*]"'] = '"arm64"';
        }
    }
    return project;
}
exports.setExcludedArchitectures = setExcludedArchitectures;
const withoutSignatures = config => {
    const shellScript = `if [ "$XCODE_VERSION_MAJOR" = "1500" ]; then
    echo "Remove signature files (Xcode 15 workaround)";
    rm -rf "$CONFIGURATION_BUILD_DIR/Mapbox.xcframework-ios.signature";
  fi`;
    return (0, config_plugins_1.withXcodeProject)(config, async (config) => {
        const xcodeProject = config.modResults;
        xcodeProject.addBuildPhase([], 'PBXShellScriptBuildPhase', 'Remove signature files (Xcode 15 workaround)', null, {
            shellPath: '/bin/sh',
            shellScript,
        });
        return config;
    });
};
const withExcludedSimulatorArchitectures = c => {
    return (0, config_plugins_1.withXcodeProject)(c, config => {
        config.modResults = setExcludedArchitectures(config.modResults);
        return config;
    });
};
const withMapLibre = config => {
    config = withoutSignatures(withExcludedSimulatorArchitectures(config));
    return withCocoaPodsInstallerBlocks(config);
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withMapLibre, pkg.name, pkg.version);
