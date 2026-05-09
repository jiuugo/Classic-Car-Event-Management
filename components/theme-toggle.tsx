"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "@phosphor-icons/react"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) {
    return <Button variant="ghost" size="icon" className={className} />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    >
      <Sun className="hidden dark:inline" weight="bold" />
      <Moon className="inline dark:hidden" weight="bold" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
