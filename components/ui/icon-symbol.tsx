import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';
import { StyleSheet } from 'react-native';

export type IconSymbolProps = SymbolViewProps & {
  size?: number;
  name: string;
  color?: string;
};

export function IconSymbol({ size = 24, name, color, style, ...props }: IconSymbolProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      style={style}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  icon: {},
});
