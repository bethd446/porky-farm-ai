import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, typography, radius } from '../../lib/designTokens'
import { elevation } from '../../lib/design/elevation'

interface SegmentedControlOption {
  label: string
  value: string
}

interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  label?: string
}

export function SegmentedControl({ options, value, onChange, label }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.segments}>
        {options.map((option) => {
          const isSelected = option.value === value
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.segment, isSelected && styles.segmentSelected]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.card,
    ...elevation.xs,
  },
  segmentText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.mutedForeground,
  },
  segmentTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
})

