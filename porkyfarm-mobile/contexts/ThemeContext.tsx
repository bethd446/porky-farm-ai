/**
 * PORKYFARM - THEME CONTEXT 2026
 * ==============================
 * Dark mode auto + tokens premium
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme, StatusBar } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  lightTheme,
  darkTheme,
  ThemeColors,
  colors as tokenColors,
  getCategoryColor as getCategoryColorFn,
  getStatusColor as getStatusColorFn,
} from '../lib/theme/tokens'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  mode: ThemeMode
  isDark: boolean
  colors: ThemeColors
  tokenColors: typeof tokenColors
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  getCategoryColor: (category: string) => string
  getStatusColor: (status: string) => string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_KEY = '@porkyfarm:theme_mode'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setModeState(saved as ThemeMode)
        }
      })
      .finally(() => setIsLoaded(true))
  }, [])

  const isDark = mode === 'system'
    ? systemColorScheme === 'dark'
    : mode === 'dark'

  const colors = isDark ? darkTheme : lightTheme

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode)
    await AsyncStorage.setItem(THEME_KEY, newMode)
  }

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark'
    setMode(newMode)
  }

  const getCategoryColor = (category: string) => getCategoryColorFn(category)
  const getStatusColor = (status: string) => getStatusColorFn(status, colors)

  useEffect(() => {
    if (isLoaded) {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true)
    }
  }, [isDark, isLoaded])

  if (!isLoaded) {
    return null
  }

  return (
    <ThemeContext.Provider value={{
      mode,
      isDark,
      colors,
      tokenColors,
      setMode,
      toggleTheme,
      getCategoryColor,
      getStatusColor,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export function useColors() {
  const { colors } = useTheme()
  return colors
}
