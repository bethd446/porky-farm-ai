"use client"

import { useEffect, useState, useRef } from "react"
import { Users, PiggyBank, Star, Clock } from "lucide-react"

const stats = [
  { value: 458, suffix: "+", label: "Éleveurs actifs", icon: Users, color: "from-emerald-500 to-green-600" },
  { value: 13750, suffix: "+", label: "Porcs suivis", icon: PiggyBank, color: "from-amber-500 to-orange-500" },
  { value: 98, suffix: "%", label: "Satisfaction", icon: Star, color: "from-blue-500 to-indigo-600" },
  { value: 24, suffix: "/7", label: "Support", icon: Clock, color: "from-purple-500 to-pink-500" },
]

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [value, inView])

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (count === 0 && !hasAnimated.current) {
        hasAnimated.current = true
        setCount(value)
      }
    }, 1000)
    return () => clearTimeout(fallbackTimer)
  }, [value, count])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function LandingStats() {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setInView(true)
    }, 300)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          clearTimeout(fallbackTimer)
        }
      },
      { threshold: 0.05, rootMargin: "100px" },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  return (
    <section id="stats" className="relative z-20 -mt-16 sm:-mt-20 px-4">
      <div className="mx-auto max-w-6xl" ref={ref}>
        <div className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 md:p-12 shadow-2xl shadow-black/10 border border-gray-100">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 md:gap-12">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`group text-center transition-all duration-500 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className={`mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform group-hover:scale-110`}
                >
                  <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
