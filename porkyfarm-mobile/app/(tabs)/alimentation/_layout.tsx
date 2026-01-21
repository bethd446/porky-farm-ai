/**
 * Layout Module Alimentation
 * ==========================
 * Navigation interne pour le module alimentation:
 * - Dashboard (index)
 * - Stock (liste et ajout)
 * - Formules (liste et creation)
 * - Plans de rationnement
 * - Historique distributions
 */

import { Stack } from 'expo-router'
import { colors } from '../../../lib/designTokens'

export default function AlimentationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="stock/index" />
      <Stack.Screen name="stock/add" />
      <Stack.Screen name="formulas/index" />
      <Stack.Screen name="formulas/create" />
      <Stack.Screen name="formulas/[id]" />
      <Stack.Screen name="plans/index" />
      <Stack.Screen name="history" />
    </Stack>
  )
}
