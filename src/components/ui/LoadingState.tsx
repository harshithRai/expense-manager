import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function LoadingState({ label = "Loading your finances..." }: { label?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerWrap}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonBlock, styles.skeletonShort]} />
        <View style={styles.skeletonBlock} />
        <View style={[styles.skeletonBlock, styles.skeletonMedium]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 180,
    ...theme.shadow.soft,
  },
  spinnerWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(121,168,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.16)",
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    textAlign: "center",
  },
  skeletonRow: {
    width: "100%",
    gap: 10,
    marginTop: 4,
  },
  skeletonBlock: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  skeletonShort: {
    width: "38%",
  },
  skeletonMedium: {
    width: "62%",
  },
});
