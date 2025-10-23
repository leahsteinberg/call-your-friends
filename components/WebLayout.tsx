import { useEffect } from 'react';
import { Platform } from 'react-native';

export function WebLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Prevent FOUC by adding loaded class
      const timer = setTimeout(() => {
        document.body.classList.add('loaded');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return <>{children}</>;
}
