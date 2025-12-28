/**
 * Modal d'actions rapides pour le bouton central +
 * Actions : Ajouter animal, cas santé, gestation, mouvement stock
 */

import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, typography, radius, shadows } from '../lib/designTokens'
import { PiggyBank, Heart, Baby, Package, X } from 'lucide-react-native'

interface ActionsModalProps {
  visible: boolean
  onClose: () => void
}

export function ActionsModal({ visible, onClose }: ActionsModalProps) {
  const router = useRouter()

  const actions = [
    {
      id: 'animal',
      label: 'Ajouter un animal',
      icon: PiggyBank,
      route: '/(tabs)/livestock/add',
      color: colors.primary,
    },
    {
      id: 'health',
      label: 'Nouveau cas santé',
      icon: Heart,
      route: '/(tabs)/health/add',
      color: colors.error,
    },
    {
      id: 'gestation',
      label: 'Nouvelle gestation',
      icon: Baby,
      route: '/(tabs)/reproduction/add',
      color: colors.info,
    },
    {
      id: 'stock',
      label: 'Mouvement de stock',
      icon: Package,
      route: '/(tabs)/feeding/add-stock',
      color: colors.warning,
    },
  ]

  const handleAction = (route: string) => {
    onClose()
    router.push(route as any)
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Actions rapides</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsGrid}>
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionButton, { borderColor: action.color }]}
                  onPress={() => handleAction(action.route)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <Icon size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  closeButton: {
    padding: spacing.xs,
  },
  actionsGrid: {
    gap: spacing.base,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.background,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  actionLabel: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
    flex: 1,
  },
})

