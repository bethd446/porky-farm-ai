/**
 * AnimalCategoryGrid - Grille 2 colonnes pour sélection de catégorie
 * Résout le problème de texte tronqué avec "Porc d'engraissement"
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing, typography, radius, gradients } from '../../lib/designTokens'

// Icones et couleurs par catégorie
const CATEGORY_CONFIG: Record<string, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; gradientColors: readonly [string, string] }> = {
  sow: {
    icon: 'pig',
    color: '#E76F51',
    gradientColors: ['#FCE7F3', '#FDF2F8'] as const,
  },
  boar: {
    icon: 'pig-variant',
    color: '#457B9D',
    gradientColors: ['#DBEAFE', '#EFF6FF'] as const,
  },
  piglet: {
    icon: 'pig',
    color: '#52B788',
    gradientColors: ['#D1FAE5', '#ECFDF5'] as const,
  },
  fattening: {
    icon: 'pig',
    color: '#E9C46A',
    gradientColors: ['#FEF3C7', '#FFFBEB'] as const,
  },
}

interface CategoryOption {
  label: string
  value: string
}

interface AnimalCategoryGridProps {
  options: CategoryOption[]
  value: string
  onChange: (value: string) => void
  label?: string
}

export function AnimalCategoryGrid({ options, value, onChange, label }: AnimalCategoryGridProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.grid}>
        {options.map((option) => {
          const isSelected = option.value === value
          const config = CATEGORY_CONFIG[option.value] || {
            icon: 'pig' as keyof typeof MaterialCommunityIcons.glyphMap,
            color: colors.primary,
            gradientColors: ['#D8F3DC', '#F1F8F4'] as const,
          }

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isSelected && { borderColor: config.color },
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
            >
              {isSelected ? (
                <LinearGradient
                  colors={config.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <MaterialCommunityIcons name={config.icon} size={32} color={config.color} />
                  <Text style={[styles.cardLabel, { color: config.color }]} numberOfLines={2}>
                    {option.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.cardContent}>
                  <MaterialCommunityIcons name={config.icon} size={32} color={colors.mutedForeground} />
                  <Text style={styles.cardLabel} numberOfLines={2}>
                    {option.label}
                  </Text>
                </View>
              )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  cardSelected: {
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 90,
    justifyContent: 'center',
  },
  cardContent: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 90,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    textAlign: 'center',
  },
})
