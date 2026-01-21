/**
 * AnimatedList - Liste avec animation staggered
 * Effet cascade premium pour les listes
 */

import React from 'react'
import { View, ViewStyle } from 'react-native'
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  Layout,
} from 'react-native-reanimated'

type AnimationDirection = 'up' | 'down' | 'left' | 'right'

interface AnimatedListProps {
  children: React.ReactNode[]
  direction?: AnimationDirection
  staggerDelay?: number
  duration?: number
  style?: ViewStyle
  itemStyle?: ViewStyle
}

const animations = {
  up: FadeInUp,
  down: FadeInDown,
  left: FadeInLeft,
  right: FadeInRight,
}

export function AnimatedList({
  children,
  direction = 'down',
  staggerDelay = 80,
  duration = 400,
  style,
  itemStyle,
}: AnimatedListProps) {
  const Animation = animations[direction]

  return (
    <View style={style}>
      {React.Children.map(children, (child, index) => {
        if (!child) return null

        return (
          <Animated.View
            key={index}
            entering={Animation
              .delay(index * staggerDelay)
              .duration(duration)
              .springify()
              .damping(15)}
            layout={Layout.springify()}
            style={itemStyle}
          >
            {child}
          </Animated.View>
        )
      })}
    </View>
  )
}

// Composant pour un seul item anime
interface AnimatedItemProps {
  children: React.ReactNode
  index?: number
  direction?: AnimationDirection
  delay?: number
  style?: ViewStyle
}

export function AnimatedItem({
  children,
  index = 0,
  direction = 'down',
  delay = 80,
  style,
}: AnimatedItemProps) {
  const Animation = animations[direction]

  return (
    <Animated.View
      entering={Animation
        .delay(index * delay)
        .springify()
        .damping(15)}
      layout={Layout.springify()}
      style={style}
    >
      {children}
    </Animated.View>
  )
}
