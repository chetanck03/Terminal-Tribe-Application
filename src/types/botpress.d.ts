interface BotpressWebChat {
  init: (config: {
    configUrl: string;
    containerWidth?: string;
    containerHeight?: string;
    hideWidget?: boolean;
    disableAnimations?: boolean;
    closeOnExternalClick?: boolean;
    [key: string]: any;
  }) => void;
  open: () => void;
  close: () => void;
}

declare global {
  interface Window {
    botpressWebChat: BotpressWebChat;
  }
}

export {}; 