import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CONTACTO_FAQ } from '@/data/contacto'

const ease = [0.25, 0.1, 0.25, 1]

export function ContactFaq() {
  const [openId, setOpenId] = useState(null)

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      {CONTACTO_FAQ.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-card border border-border bg-white"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-ink transition-colors hover:bg-surface/80 sm:px-6 sm:py-4"
            >
              {item.question}
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
                strokeWidth={1.75}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-ink-muted sm:px-6">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
