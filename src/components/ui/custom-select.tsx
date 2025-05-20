"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Option {
  label: string
  value: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  
  // Find the selected option
  const selectedOption = options.find(option => option.value === value)

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div 
      ref={ref}
      className={cn(
        "relative w-full",
        className
      )}
    >
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
        aria-expanded={open}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  option.value === value && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
