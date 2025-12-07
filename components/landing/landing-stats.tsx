"use client"

import { useEffect, useState, useRef } from "react"
import { Users, PiggyBank, Star, Clock } from "lucide-react"

const stats = [
  { value: 458, suffix: "+", label: "Éleveurs actifs", icon: Users, color: "from-emerald-500 to-green-600" },
  { value: 13750, suffix: "+", label: "Porcs suivis", icon: PiggyBank, color: "from-amber-500 to-orange-500" },
  { value: 89, suffix: "%", label: "Satisfaction", icon: Star, color: "from-blue-500 to-indigo-600" },
  { value: 21, suffix: "/7", label: "Support", icon: Clock, color: "from-purple-500 to-pink-500" },
]

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    const duration = 2500
    const steps = 80
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
  }, [value, inView])

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="stats" className="relative z-20 -mt-20 px-4">
      <div className="mx-auto max-w-6xl" ref={ref}>
        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-black/10 border border-gray-100 md:p-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`group text-center transition-all duration-500 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform group-hover:scale-110`}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
                </div>
                <div className="mt-2 text-sm font-medium text-muted-foreground md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
