import type ThePlugin from './main';
import { checksumForString } from './features/githubUtils';

export interface ThemeInforamtion {
  repo: string;
  // checksum of theme file (either theme.css or theme-beta.css)
  lastUpdate: string;
}

export interface PluginFrozenVersion {
  repo: string;
  version: string;
}

export interface Settings {
  pluginList: string[];
  pluginSubListFrozenVersion: PluginFrozenVersion[];
  themesList: ThemeInforamtion[];
  updateAtStartup: boolean;
  updateThemesAtStartup: boolean;
  enableAfterInstall: boolean;
  loggingEnabled: boolean;
  loggingPath: string;
  loggingVerboseEnabled: boolean;
  debuggingMode: boolean;
  notificationsEnabled: boolean;
  personalAccessToken?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  pluginList: [],
  pluginSubListFrozenVersion: [],
  themesList: [],
  updateAtStartup: true,
  updateThemesAtStartup: true,
  enableAfterInstall: true,
  loggingEnabled: false,
  loggingPath: 'BRAT-log',
  loggingVerboseEnabled: false,
  debuggingMode: false,
  notificationsEnabled: true,
  personalAccessToken: '',
};

/**
 * Adds a plugin for beta testing to the data.json file of this  plugin
 *
 * @param  plugin - the plugin object
 * @param  repositoryPath - path to the GitHub repository
 * @param  specifyVersion  - if the plugin needs to stay at the frozen version, we need to also record the version
 */
export function addBetaPluginToList(
  plugin: ThePlugin,
  repositoryPath: string,
  specifyVersion = ''
): void {
  let save = false;
  if (!plugin.settings.pluginList.contains(repositoryPath)) {
    plugin.settings.pluginList.unshift(repositoryPath);
    save = true;
  }
  if (
    specifyVersion !== '' &&
    plugin.settings.pluginSubListFrozenVersion.filter((x) => x.repo === repositoryPath)
      .length === 0
  ) {
    plugin.settings.pluginSubListFrozenVersion.unshift({
      repo: repositoryPath,
      version: specifyVersion,
    });
    save = true;
  }
  if (save) {
    void plugin.saveSettings();
  }
}

/**
 * Tests if  a  plugin  is in data.json
 *
 * @param plugin - the plugin object
 * @param repositoryPath - path to the GitHub repository
 *
 */
export function existBetaPluginInList(
  plugin: ThePlugin,
  repositoryPath: string
): boolean {
  return plugin.settings.pluginList.contains(repositoryPath);
}

/**
 * Adds a theme for beta testing to the data.json file of this  plugin
 *
 * @param plugin - the plugin object
 * @param repositoryPath - path to the GitHub repository
 * @param themeCss - raw text of the theme. It is checksummed and this is used for tracking if changes occurred to the theme
 *
 */
export function addBetaThemeToList(
  plugin: ThePlugin,
  repositoryPath: string,
  themeCss: string
): void {
  const newTheme: ThemeInforamtion = {
    repo: repositoryPath,
    lastUpdate: checksumForString(themeCss),
  };
  plugin.settings.themesList.unshift(newTheme);
  void plugin.saveSettings();
}

/**
 * Tests if a  theme  is in data.json
 *
 * @param plugin - the plugin object
 * @param repositoryPath - path to the GitHub repository
 *
 */
export function existBetaThemeinInList(
  plugin: ThePlugin,
  repositoryPath: string
): boolean {
  const testIfThemExists = plugin.settings.themesList.find(
    (t) => t.repo === repositoryPath
  );
  return testIfThemExists ? true : false;
}

/**
 * Update the lastUpate field for the theme
 *
 * @param plugin - the plugin object
 * @param repositoryPath - path to the GitHub repository
 * @param checksum - checksum of file. In past we used the date of file update, but this proved to not be consisent with the GitHub cache.
 *
 */
export function updateBetaThemeLastUpdateChecksum(
  plugin: ThePlugin,
  repositoryPath: string,
  checksum: string
): void {
  plugin.settings.themesList.forEach((t) => {
    if (t.repo === repositoryPath) {
      t.lastUpdate = checksum;
      void plugin.saveSettings();
    }
  });
}
