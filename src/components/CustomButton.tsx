import {
    Pressable,
    StyleSheet,
    type PressableProps,
    type StyleProp,
    type TextStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

export interface CustomButtonProps extends Omit<PressableProps, "children"> {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  textStyle?: StyleProp<TextStyle>;
}

export function CustomButton({
  title,
  variant = "primary",
  disabled,
  style,
  textStyle,
  ...props
}: CustomButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <ThemedText
        style={[
          styles.text,
          styles[`${variant}Text` as keyof typeof styles],
          textStyle,
        ]}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  primary: {
    backgroundColor: "#0a7ea4",
  },
  secondary: {
    backgroundColor: "#687076",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#0a7ea4",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#0a7ea4",
  },
});
