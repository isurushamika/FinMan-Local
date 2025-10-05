import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finman.app',
  appName: 'FinMan',
  webDir: 'dist',
  
  server: {
    // For development: point to your local dev server
    // url: 'http://192.168.1.100:5173',
    // cleartext: true,
    
    // For production: point to your Ubuntu server
    // url: 'https://finman.yourdomain.com',
    
    // For local build (offline mode)
    androidScheme: 'https'
  },
  
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e293b',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
