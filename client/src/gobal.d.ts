export {};
declare module "@tawk.to/tawk-messenger-react";

declare global {
  interface Window {
          Tawk_API: {
                  onLoad: () => void;
                  hideWidget: () => void;
                  showWidget: () => void;
          };
    Tawk_LoadStart: Date;
  }
}