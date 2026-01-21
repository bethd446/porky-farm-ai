/**
 * AnimalCard Component Premium
 * ============================
 * Carte animée pour afficher les informations d'un animal
 * Avec gradient, animations Reanimated et haptic feedback
 */

import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { theme } from '../../constants/theme'
import type { Animal as AnimalDB } from '../../services/animals'
import { animalToUI } from '../../lib/animalHelpers'

// Interface compatible avec Animal de services/animals.ts
// Utiliser Partial pour permettre les propriétés optionnelles UI sans conflit
interface AnimalUI {
  // Propriétés optionnelles pour compatibilité UI
  birthDate?: string
  weight?: number
  healthStatus?: 'good' | 'warning' | 'critical'
}

type Animal = AnimalDB & AnimalUI

interface AnimalCardProps {
  animal: Animal
  onPress: () => void
  index?: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function AnimalCard({ animal, onPress, index = 0 }: AnimalCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  // Convertir l'animal DB en format UI
  const animalUI = animalToUI(animal)
  
  // Helper pour obtenir les valeurs normalisées
  const getIdentifier = () => animal.identifier || animalUI.identifier || 'N/A'
  const getBirthDate = () => animal.birthDate || animal.birth_date || null
  const getWeight = () => {
    if (animal.weight) return animal.weight
    if (animalUI.weight) return animalUI.weight
    return 0
  }
  const getGender = (): 'male' | 'female' => {
    if (animal.gender) return animal.gender
    const sex = animal.sex
    if (sex === 'male') return 'male'
    if (sex === 'female') return 'female'
    // Inférer du category
    if (animal.category === 'truie') return 'female'
    if (animal.category === 'verrat') return 'male'
    return 'male' // Default
  }
  const getCategory = (): 'piglet' | 'grower' | 'finisher' | 'sow' | 'boar' => {
    // Mapper les catégories françaises vers les labels UI
    const cat = animal.category
    if (cat === 'truie') return 'sow'
    if (cat === 'verrat') return 'boar'
    if (cat === 'porcelet') return 'piglet'
    if (cat === 'engraissement') return 'grower'
    return 'grower' // Default
  }
  const getHealthStatus = (): 'good' | 'warning' | 'critical' => {
    if (animal.healthStatus) return animal.healthStatus
    const status = animal.status?.toLowerCase() || ''
    if (status.includes('sick') || status.includes('critical')) return 'critical'
    if (status.includes('warning') || status.includes('attention')) return 'warning'
    return 'good'
  }

  const getAge = (birthDate: string | null): string => {
    if (!birthDate) return 'N/A'
    try {
      const birth = new Date(birthDate)
      if (isNaN(birth.getTime())) return 'N/A'
      
      const now = new Date()
      const months = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30))
      
      if (months < 1) return 'Nouveau-né'
      if (months < 12) return `${months} mois`
      
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      
      if (remainingMonths > 0) {
        return `${years}a ${remainingMonths}m`
      }
      return `${years} an${years > 1 ? 's' : ''}`
    } catch {
      return 'N/A'
    }
  }

  const healthConfig = {
    good: { 
      color: '#10B981', 
      bg: '#D1FAE5', 
      label: 'Bonne santé', 
      icon: 'checkmark-circle' as const 
    },
    warning: { 
      color: '#F59E0B', 
      bg: '#FEF3C7', 
      label: 'À surveiller', 
      icon: 'alert-circle' as const 
    },
    critical: { 
      color: '#EF4444', 
      bg: '#FEE2E2', 
      label: 'Urgent', 
      icon: 'warning' as const 
    },
  }

  const categoryLabels: Record<string, string> = {
    piglet: 'Porcelet',
    grower: 'Croissance',
    finisher: 'Finition',
    sow: 'Truie',
    boar: 'Verrat',
  }

  const gender = getGender()
  const category = getCategory()
  const healthStatus = getHealthStatus()
  const health = healthConfig[healthStatus]

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 80).springify().damping(14)}
      style={styles.wrapper}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, animatedStyle]}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#FEF9F0', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            {/* Avatar avec genre */}
            <View style={[
              styles.avatar,
              { backgroundColor: gender === 'male' ? '#DBEAFE' : '#FCE7F3' }
            ]}>
              <Ionicons 
                name={gender === 'male' ? 'male' : 'female'} 
                size={20} 
                color={gender === 'male' ? '#3B82F6' : '#EC4899'} 
              />
            </View>

            {/* Infos principales */}
            <View style={styles.mainInfo}>
              <Text style={styles.identifier}>{getIdentifier()}</Text>
              <Text style={styles.breed}>{animal.breed || 'Non renseigné'}</Text>
            </View>

            {/* Badge santé */}
            <View style={[styles.healthBadge, { backgroundColor: health.bg }]}>
              <Ionicons name={health.icon} size={14} color={health.color} />
              <Text style={[styles.healthText, { color: health.color }]}>
                {health.label}
              </Text>
            </View>
          </View>

          {/* Catégorie */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryLabels[category]}</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="calendar-outline" size={16} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{getAge(getBirthDate())}</Text>
            <Text style={styles.statLabel}>Âge</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="scale-outline" size={16} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{getWeight()} kg</Text>
            <Text style={styles.statLabel}>Poids</Text>
          </View>
        </View>

        {/* Action Footer */}
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Voir le profil complet</Text>
          <Ionicons name="chevron-forward" size={18} color="#D97706" />
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  identifier: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  breed: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 2,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  healthText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#78716C',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  statLabel: {
    fontSize: 12,
    color: '#A8A29E',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E7E5E4',
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
})

