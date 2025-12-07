"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LivestockFiltersProps {
  onCategoryChange?: (category: string) => void
  onViewModeChange?: (mode: "grid" | "list") => void
  onSearchChange?: (search: string) => void
}

const categories = ["Tous", "Truies", "Verrats", "Porcelets", "Engraissement"]

export function LivestockFilters({ onCategoryChange, onViewModeChange, onSearchChange }: LivestockFiltersProps = {}) {
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    onCategoryChange?.(cat)
  }

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode)
    onViewModeChange?.(mode)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearchChange?.(value)
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-soft md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 ${
              activeCategory === cat ? "bg-primary text-white hover:bg-primary-dark" : "hover:bg-muted"
            }`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un animal..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <div className="flex rounded-lg border border-border p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleViewModeChange("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
