/// <reference types="vite/client" />

declare global {
  interface Window {
    desktopFolderWatch?: {
      isAvailable: boolean;
      selectDirectory(): Promise<{ path: string; name: string } | null>;
      start(root: string): Promise<string>;
      stop(): Promise<boolean>;
      readFile(path: string): Promise<ArrayBuffer>;
      onFile(callback: (payload: { path: string; reason: string; size: number; modifiedAt: string }) => void): () => void;
      onDeleted(callback: (payload: { path: string }) => void): () => void;
    };
  }
}

export {};
