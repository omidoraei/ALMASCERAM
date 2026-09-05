import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '../../hooks/useTheme'

/**
 * Toggle between light and dark themes. Renders an icon button with
 * an accessible label that updates based on the next state.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
      title={isDark ? 'حالت روشن' : 'حالت تاریک'}
    >
      {isDark ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />}
    </button>
  )
}
