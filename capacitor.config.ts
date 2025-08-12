import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.aigraphicdesigner.app',
  appName: 'AI Graphic Designer',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1f2937',
      showSpinner: true,
      spinnerColor: '#3b82f6'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1f2937'
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark
    }
  }
};

export default config;