"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  children?: React.ReactNode
  className?: string
}

export function FormField({ label, name, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string
  required?: boolean
  icon?: React.ReactNode
}

export function FormInput({ label, name, error, required, icon, className, ...props }: FormInputProps) {
  return (
    <FormField label={label} name={name} error={error} required={required}>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <Input
          id={name}
          name={name}
          className={cn(icon && "pl-10", error && "border-destructive", className)}
          aria-invalid={!!error}
          {...props}
        />
      </div>
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  error?: string
  required?: boolean
}

export function FormTextarea({ label, name, error, required, className, ...props }: FormTextareaProps) {
  return (
    <FormField label={label} name={name} error={error} required={required}>
      <Textarea
        id={name}
        name={name}
        className={cn(error && "border-destructive", className)}
        aria-invalid={!!error}
        {...props}
      />
    </FormField>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  label: string
  name: string
  error?: string
  required?: boolean
  placeholder?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function FormSelect({
  label,
  name,
  error,
  required,
  placeholder = "Sélectionner",
  options,
  value,
  onChange,
  disabled,
}: FormSelectProps) {
  return (
    <FormField label={label} name={name} error={error} required={required}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
