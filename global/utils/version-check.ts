import { useState, useEffect } from 'react';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { useGlobalStore, IVersionCheckResponse } from '@/store/useGlobalStore';

// ✅ Internal interface for version check result
interface VersionCheckResult {
  latestVersion: string;
  forceUpdate: boolean;
  updateMessage:  string;
  storeUrls: {
    webUrl: string;
    deepLink: string;
  };
}

export const useVersionCheck = () => {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);

 
  // ✅ Get data and actions from global store
  const {appVersion,getAppVersion,isLoadingVersion} = useGlobalStore() 

  useEffect(() => {
    // ✅ Call the store action to fetch version info
    getAppVersion();
  }, []);

  useEffect(() => {
    // ✅ When appVersion changes, check if update is required
    if (appVersion) {
      const currentVersion = Application.nativeApplicationVersion || '1.0.0';
      
      // ✅ Get latest version based on platform
      const latestVersion = Platform.OS === 'ios' 
        ? appVersion.latestIosVersion 
        : appVersion.latestAndroidVersion;
      
      // ✅ Get store URLs based on platform
      const platformStoreUrls = Platform.OS === 'ios'
        ? appVersion.storeUrls.ios
        : appVersion.storeUrls.android;
      
      const needsUpdate = compareVersions(currentVersion, latestVersion) < 0;
      
      if (needsUpdate) {
        setUpdateRequired(true);
        setUpdateInfo({
          latestVersion,
          forceUpdate:  true, // Always force update (as per your requirement)
          updateMessage: 'A new version is available. Please update to continue using the app.',
          storeUrls: platformStoreUrls,
        });
      } else {
        setUpdateRequired(false);
        setUpdateInfo({
          latestVersion,
          forceUpdate: false,
          updateMessage: 'You are using the latest version.',
          storeUrls: platformStoreUrls,
        });
      }
    }
  }, [appVersion]);

  const compareVersions = (current: string, latest: string): number => {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;

      if (currentPart > latestPart) return 1;
      if (currentPart < latestPart) return -1;
    }
    return 0;
  };

  const recheckVersion = () => {
    getAppVersion();
  };

  return { 
    updateRequired, 
    updateInfo, 
    isLoadingVersion, 
    recheckVersion 
  };
};