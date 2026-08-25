import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, SignageConfig, SaveConfigRequest, RuntimeDisplayInfo, ActionResponse } from '../common/types';

export interface SignageAPI {
  getConfig: () => Promise<SignageConfig>;
  saveConfig: (payload: SaveConfigRequest) => Promise<ActionResponse>;
  getDisplays: () => Promise<RuntimeDisplayInfo[]>;
  identifyDisplays: () => Promise<ActionResponse>;
  testUrl: (url: string) => Promise<ActionResponse<{ status: number; ok: boolean }>>;
  openLogsFolder: () => Promise<ActionResponse>;
  restartApp: () => Promise<void>;
  closeSetup: () => Promise<ActionResponse>;
  retryDisplay: (displayId: number) => Promise<ActionResponse>;
  platform: NodeJS.Platform;
}

const api: SignageAPI = {
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG),
  saveConfig: (payload: SaveConfigRequest) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_CONFIG, payload),
  getDisplays: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DISPLAYS),
  identifyDisplays: () => ipcRenderer.invoke(IPC_CHANNELS.IDENTIFY_DISPLAYS),
  testUrl: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.TEST_URL, url),
  openLogsFolder: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_LOGS_FOLDER),
  restartApp: () => ipcRenderer.invoke(IPC_CHANNELS.RESTART_APP),
  closeSetup: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_SETUP),
  retryDisplay: (displayId: number) => ipcRenderer.invoke(IPC_CHANNELS.RETRY_DISPLAY, displayId),
  platform: process.platform,
};

contextBridge.exposeInMainWorld('signageAPI', api);
