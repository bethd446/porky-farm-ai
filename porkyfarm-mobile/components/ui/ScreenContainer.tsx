import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native'
import { colors, spacing } from '../../lib/designTokens'
import { ReactNode } from 'react'

interface ScreenContainerProps {
  children: ReactNode
  scrollable?: boolean
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
}

export function ScreenContainer({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
}: ScreenContainerProps) {
  const containerStyle = [styles.container, style]

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    )
  }

  return <View style={containerStyle}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
  },
})

