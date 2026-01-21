/**
 * GestationAlerts - Alertes pour les mises bas proches
 * =====================================================
 * Affiche les gestations arrivant à terme (J-14 ou moins)
 * Migré de Moti vers React Native Animated
 */

import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/theme'
import { useSlideIn, useListItemAnimation } from '@/hooks/useAnimations'

export interface GestationAlert {
  id: string
  sow_name: string
  sow_identifier?: string | null
  days_remaining: number
  expected_date: string
  alert_level: 'critical' | 'warning' | 'info'
}

interface GestationAlertsProps {
  alerts: GestationAlert[]
  onPress: (id: string) => void
}

const getAlertColor = (level: GestationAlert['alert_level']): string => {
  switch (level) {
    case 'critical':
      return '#DC2626' // Rouge - J-2 ou moins
    case 'warning':
      return '#F59E0B' // Orange - J-5 ou moins
    default:
      return '#3B82F6' // Bleu - J-14 ou moins
  }
}

const getAlertBgColor = (level: GestationAlert['alert_level']): string => {
  switch (level) {
    case 'critical':
      return '#FEE2E2'
    case 'warning':
      return '#FEF3C7'
    default:
      return '#DBEAFE'
  }
}

// Composant pour chaque alerte individuelle
const AlertItem: React.FC<{
  alert: GestationAlert
  index: number
  onPress: (id: string) => void
}> = ({ alert, index, onPress }) => {
  const { animate, animatedStyle } = useListItemAnimation(index, 50, 300)
  const alertColor = getAlertColor(alert.alert_level)
  const alertBg = getAlertBgColor(alert.alert_level)

  useEffect(() => {
    const timer = setTimeout(() => animate(), 350)
    return () => clearTimeout(timer)
  }, [animate])

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.alertCard, { borderLeftColor: alertColor }]}
        onPress={() => onPress(alert.id)}
        activeOpacity={0.7}
      >
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.sowName} numberOfLines={1}>
              {alert.sow_name || alert.sow_identifier || 'Truie'}
            </Text>
            <View style={[styles.badge, { backgroundColor: alertBg }]}>
              <Text style={[styles.badgeText, { color: alertColor }]}>
                {alert.days_remaining === 0
                  ? "Aujourd'hui"
                  : alert.days_remaining === 1
                  ? 'Demain'
                  : `J-${alert.days_remaining}`}
              </Text>
            </View>
          </View>
          <Text style={styles.alertText}>
            Mise bas prévue{' '}
            {alert.days_remaining === 0
              ? "aujourd'hui"
              : alert.days_remaining === 1
              ? 'demain'
              : `dans ${alert.days_remaining} jours`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export function GestationAlerts({ alerts, onPress }: GestationAlertsProps) {
  const { slideIn, animatedStyle } = useSlideIn('bottom', 20, 400, 300)

  useEffect(() => {
    slideIn()
  }, [slideIn])

  if (!alerts || alerts.length === 0) return null

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.header}>
        <Ionicons name="warning" size={20} color="#EC4899" />
        <Text style={styles.title}>Alertes Gestations</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{alerts.length}</Text>
        </View>
      </View>

      {alerts.slice(0, 3).map((alert, index) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          index={index}
          onPress={onPress}
        />
      ))}

      {alerts.length > 3 && (
        <TouchableOpacity style={styles.seeMoreBtn}>
          <Text style={styles.seeMoreText}>Voir les {alerts.length - 3} autres alertes</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary[500]} />
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#EC4899',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sowName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  alertText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
})

export default GestationAlerts
