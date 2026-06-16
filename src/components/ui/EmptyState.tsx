import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WalletCards } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { PressableScale } from "@/components/ui/PressableScale";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <WalletCards color={theme.colors.accent} size={22} />
      </View>
      <Text style={styles.eyebrow}>Nothing here yet</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <PressableScale haptic="light" onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.soft,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(121,168,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.18)",
    marginBottom: 4,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.tiny,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h3,
    fontWeight: "800",
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 13,
    ...theme.shadow.soft,
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: "800",
  },
});
