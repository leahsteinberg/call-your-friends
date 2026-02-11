const isIos = Platform.OS === 'ios';
import OrganicGradientBackground from "@/components/OrganicGradientBackground";
import { useIsBroadcasting, useIsClaimedBroadcasting } from "@/hooks/useIsBroadcasting";
import { APP_BACKGROUND_COLOR } from "@/styles/styles";
import React from 'react';

import { Platform, StyleSheet, View } from 'react-native';
import { useSelector } from "react-redux";
const safePadding = Platform.OS === 'ios' ? 45 : 10;

interface StylingWrapperProps {
  children: React.ReactElement; // Or JSX.Element
  showGradientBackground?: boolean;
}


export const FullScreenStylingWrapper: React.FC<StylingWrapperProps> = ({children, showGradientBackground = false}) => {
  const userId = useSelector((state: RootState)=> state.auth.user.id);
  const isBroadcasting = useIsBroadcasting();
  const isClaimedBroadcasting = useIsClaimedBroadcasting(userId);
  return (
      <OrganicGradientBackground mode={(isBroadcasting || isClaimedBroadcasting) ? "fast" : "slow"}>
          <View style={styles.padding}/>
          {children}
      </OrganicGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  padding: {
    minHeight: safePadding,
    zIndex: 100,
  },
});
