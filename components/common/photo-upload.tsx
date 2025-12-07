"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Camera, X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  value?: string | null
  onChange: (photo: string | null) => void
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "button" | "dropzone"
  placeholder?: string
  accept?: string
  capture?: "environment" | "user"
}

export function PhotoUpload({
  value,
  onChange,
  className,
  size = "md",
  variant = "button",
  placeholder = "Ajouter une photo",
  accept = "image/*",
  capture = "environment",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-32 w-32",
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result as string)
        setIsLoading(false)
      }
      reader.onerror = () => {
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  if (variant === "dropzone") {
    return (
      <div className={cn("space-y-2", className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          capture={capture}
          className="hidden"
          onChange={handleFileChange}
        />
        {value ? (
          <div className="relative inline-block">
            <img
              src={value || "/placeholder.svg"}
              alt="Aperçu"
              className={cn("rounded-xl object-cover border border-border", sizeClasses[size])}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90 transition"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors",
              sizeClasses[size],
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Photo</span>
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="gap-2 bg-transparent"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {value ? "Changer la photo" : placeholder}
      </Button>
      {value && (
        <div className="relative">
          <img
            src={value || "/placeholder.svg"}
            alt="Aperçu"
            className="h-12 w-12 rounded-lg object-cover border border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white shadow-sm hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
