"use client"

import { useEffect, useState } from "react"

const stats = [
  { value: 500, suffix: "+", label: "Éleveurs actifs" },
  { value: 15000, suffix: "+", label: "Porcs suivis" },
  { value: 98, suffix: "%", label: "Satisfaction" },
  { value: 24, suffix: "/7", label: "Support" },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
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
  }, [value])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function LandingStats() {
  return (
    <section className="relative z-20 -mt-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="glass rounded-3xl p-8 shadow-soft md:p-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
