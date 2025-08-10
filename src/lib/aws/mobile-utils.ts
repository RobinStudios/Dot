import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isMobile = () => Capacitor.isNativePlatform();

export const setupMobileApp = async () => {
  if (!isMobile()) return;

  // Configure status bar
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#1f2937' });

  // Configure keyboard
  Keyboard.addListener('keyboardWillShow', () => {
    document.body.classList.add('keyboard-open');
  });

  Keyboard.addListener('keyboardWillHide', () => {
    document.body.classList.remove('keyboard-open');
  });
};

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
  if (!isMobile()) return;
  await Haptics.impact({ style });
};

export const getDeviceInfo = () => ({
  platform: Capacitor.getPlatform(),
  isNative: Capacitor.isNativePlatform(),
  isWeb: !Capacitor.isNativePlatform(),
});

export const optimizeForMobile = {
  canvas: {
    maxWidth: isMobile() ? 375 : 1920,
    maxHeight: isMobile() ? 667 : 1080,
    touchEnabled: isMobile(),
  },
  ui: {
    sidebarWidth: isMobile() ? '100%' : '320px',
    toolbarHeight: isMobile() ? '60px' : '48px',
    fontSize: isMobile() ? '16px' : '14px',
  },
};