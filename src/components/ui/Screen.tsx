import React from "react";
import { ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { theme } from "@/constants/theme";

type Props = ScrollViewProps & {
  children: React.ReactNode;
};

export function Screen({ children, contentContainerStyle, ...props }: Props) {
  return (
    <LinearGradient colors={["#04070D", "#0B1220", "#080B12"]} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={styles.topAccent}>
          <Svg width="100%" height="100%" viewBox="0 0 420 420">
            <Defs>
              <RadialGradient id="topGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#79A8FF" stopOpacity="0.24" />
                <Stop offset="35%" stopColor="#79A8FF" stopOpacity="0.12" />
                <Stop offset="70%" stopColor="#79A8FF" stopOpacity="0.02" />
                <Stop offset="100%" stopColor="#79A8FF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width="420" height="420" fill="url(#topGlow)" />
          </Svg>
        </View>
        <View pointerEvents="none" style={styles.midAccent}>
          <Svg width="100%" height="100%" viewBox="0 0 340 340">
            <Defs>
              <RadialGradient id="midGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#33D69F" stopOpacity="0.18" />
                <Stop offset="42%" stopColor="#33D69F" stopOpacity="0.08" />
                <Stop offset="78%" stopColor="#33D69F" stopOpacity="0.02" />
                <Stop offset="100%" stopColor="#33D69F" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width="340" height="340" fill="url(#midGlow)" />
          </Svg>
        </View>
        <View pointerEvents="none" style={styles.bottomAccent}>
          <Svg width="100%" height="100%" viewBox="0 0 360 360">
            <Defs>
              <RadialGradient id="bottomGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FF6B81" stopOpacity="0.14" />
                <Stop offset="35%" stopColor="#9B8CFF" stopOpacity="0.08" />
                <Stop offset="70%" stopColor="#9B8CFF" stopOpacity="0.02" />
                <Stop offset="100%" stopColor="#9B8CFF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width="360" height="360" fill="url(#bottomGlow)" />
          </Svg>
        </View>
        <ScrollView
          {...props}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topAccent: {
    position: "absolute",
    top: -210,
    right: -170,
    width: 420,
    height: 420,
  },
  midAccent: {
    position: "absolute",
    top: 180,
    left: -140,
    width: 340,
    height: 340,
  },
  bottomAccent: {
    position: "absolute",
    bottom: -210,
    left: -170,
    width: 360,
    height: 360,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
    gap: 20,
  },
});
