'use client'

import { useState } from 'react'
import Link from 'next/link'

type NavItem = { label: string; href: string }

interface MobileNavProps {
  isRealAdmin: boolean
  previewRole?: string
  ordersItems: NavItem[]
  qualityItems: NavItem[]
  settingsItems: NavItem[]
  kundeportalItems: NavItem[]
  userEmail: string
}

export default function MobileNav({
  isRealAdmin,
  previewRole,
  ordersItems,
  qualityItems,
  settingsItems,
  kundeportalItems,
  userEmail,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  function toggleGroup(name: string) {
    setExpandedGroup(prev => (prev === name ? null : name))
  }

  const groups = [
    { name: 'Varer og ydelser', items: ordersItems },
    { name: 'Kundekvalitet', items: qualityItems },
    { name: 'Kundeportal', items: kundeportalItems },
    { name: 'Indstillinger', items: settingsItems },
  ]

  return (
    <div className="relative md:hidden">
      {/* Hamburger knap */}
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label={open ? 'Luk menu' : 'Åbn menu'}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Bruger info */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>

          <nav className="py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              Overblik
            </Link>
            <Link
              href="/customers"
              onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              Kunder
            </Link>

            {/* Grupper med dropdown */}
            {groups.map(group => (
              <div key={group.name}>
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  {group.name}
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedGroup === group.name ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedGroup === group.name && (
                  <div className="bg-gray-50 border-y border-gray-100">
                    {group.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block pl-8 pr-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
