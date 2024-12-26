declare global {
  interface Window {
    dataLayer: any[];
  }
}

declare function gtag(command: string, ...params: any[]): void;
