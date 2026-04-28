'use client'

// src/components/layout/Navbar.tsx
// VERCE BD — Premium Glassmorphism Navigation

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ShoppingBag,
  Search,
  User,
  Heart,
  Menu,
  X,
  ChevronDown,
  Globe,
  LogOut,
  Package,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { useCartStore, useLanguageStore } from '@/store/cart-store'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { key: 'nav.home', href: '/' },
  {
    key: 'nav.shop',
    href: '/products',
    children: [
      { label: 'New Arrivals', labelBn: 'নতুন আগমন', href: '/products?tag=new-arrival' },
      { label: 'Men', labelBn: 'পুরুষ', href: '/products?category=men' },
      { label: 'Women', labelBn: 'মহিলা', href: '/products?category=women' },
      { label: 'Accessories', labelBn: 'আনুষাঙ্গিক', href: '/products?category=accessories' },
      { label: 'Sale', labelBn: 'সেল', href: '/products?tag=sale' },
    ],
  },
  { key: 'nav.collections', href: '/collections' },
  { key: 'nav.about', href: '/about' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation('common')
  const { data: session } = useSession()
  const totalItems = useCartStore((s) => s.totalItems)
  const openCart = useCartStore((s) => s.openCart)
  const { language, toggleLanguage } = useLanguageStore()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Sync i18n with store
  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language, i18n])

  const handleDropdownEnter = (key: string) => {
    clearTimeout(dropdownTimeout.current)
    setActiveDropdown(key)
  }
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  const cartCount = totalItems()
  const isBn = language === 'bn'

  return (
    <>
      {/* ── TOP ANNOUNCEMENT BAR ─────────────────────────────────────────── */}
      <div className="bg-brand-black text-brand-silver text-xs text-center py-2 tracking-widest uppercase overflow-hidden">
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={isBn ? 'font-bangla' : 'font-sans'}
        >
          {isBn
            ? 'বিনামূল্যে ডেলিভারি ৳২,০০০+ অর্ডারে • নতুন কালেকশন এসেছে'
            : 'Free delivery on orders ৳2,000+ • New collection now live'}
        </motion.span>
      </div>

      {/* ── MAIN NAVBAR ──────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-500',
          scrolled
            ? 'backdrop-blur-xl bg-brand-black/70 border-b border-brand-silver/10 shadow-glass'
            : 'bg-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">

            {/* ── LOGO ─────────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                {/* Animated V monogram */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <defs>
                      <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#94A3B8" />
                        <stop offset="50%" stopColor="#F8FAFC" />
                        <stop offset="100%" stopColor="#64748B" />
                      </linearGradient>
                    </defs>
                    {/* V shape */}
                    <path
                      d="M4 6 L20 34 L36 6"
                      fill="none"
                      stroke="url(#vGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Diagonal slash */}
                    <path
                      d="M14 6 L26 22"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  </svg>
                </motion.div>
              </div>
              <div>
                <span
                  className={cn(
                    'text-brand-white font-display text-xl tracking-widest uppercase',
                    'group-hover:text-brand-silver transition-colors duration-300'
                  )}
                >
                  VERCE
                </span>
                <span className="text-brand-silver font-sans text-xs ml-1 tracking-wider">BD</span>
              </div>
            </Link>

            {/* ── DESKTOP NAV LINKS ─────────────────────────────────── */}
            <ul className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li
                  key={link.key}
                  className="relative"
                  onMouseEnter={() => link.children && handleDropdownEnter(link.key)}
                  onMouseLeave={() => link.children && handleDropdownLeave()}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-lg',
                      'text-brand-silver hover:text-brand-white',
                      isBn ? 'font-bangla text-sm' : 'font-sans text-sm tracking-wide',
                      'transition-all duration-200 hover:bg-brand-silver/5',
                      activeDropdown === link.key && 'text-brand-white'
                    )}
                  >
                    {t(link.key)}
                    {link.children && (
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          activeDropdown === link.key && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          'absolute top-full left-0 mt-2 w-52 rounded-2xl overflow-hidden',
                          'backdrop-blur-xl bg-brand-black/90 border border-brand-silver/10',
                          'shadow-glass-lg'
                        )}
                      >
                        <div className="p-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                'flex items-center justify-between px-4 py-2.5 rounded-xl',
                                'text-brand-silver hover:text-brand-white hover:bg-brand-silver/8',
                                isBn ? 'font-bangla text-sm' : 'font-sans text-sm',
                                'transition-all duration-150 group/item'
                              )}
                            >
                              <span>{isBn ? child.labelBn : child.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 -translate-x-1 group-hover/item:translate-x-0 transition-all" />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>

            {/* ── RIGHT ACTIONS ─────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {/* Language Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl',
                  'text-brand-silver hover:text-brand-white hover:bg-brand-silver/8',
                  'transition-all duration-200 font-sans text-xs tracking-widest'
                )}
                title="Toggle Language"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">
                  {language === 'en' ? 'EN' : 'বাং'}
                </span>
              </motion.button>

              {/* Search */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Wishlist — desktop only */}
              <Link
                href="/account/wishlist"
                className="hidden md:flex p-2 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={openCart}
                className="relative p-2 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all duration-200"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={cn(
                        'absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full',
                        'bg-brand-accent text-white text-[10px] font-bold',
                        'flex items-center justify-center leading-none',
                        'min-w-[1.1rem] px-0.5'
                      )}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Account */}
              {session ? (
                <AccountMenu session={session} t={t} isBn={isBn} />
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white hover:border-brand-silver/30 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className={cn(isBn ? 'font-bangla text-sm' : 'font-sans text-xs tracking-wide')}>
                    {t('nav.login')}
                  </span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all duration-200"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </nav>

        {/* ── MOBILE MENU ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden border-t border-brand-silver/10 backdrop-blur-xl bg-brand-black/95"
            >
              <div className="max-w-7xl mx-auto px-4 py-6 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-xl',
                        'text-brand-silver hover:text-brand-white hover:bg-brand-silver/8',
                        isBn ? 'font-bangla text-base' : 'font-sans text-sm tracking-wide',
                        'transition-all duration-150'
                      )}
                    >
                      {t(link.key)}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 border-t border-brand-silver/10">
                  {session ? (
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-brand-silver hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className={isBn ? 'font-bangla text-sm' : 'font-sans text-sm'}>{t('nav.logout')}</span>
                    </button>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all duration-150"
                    >
                      <User className="w-4 h-4" />
                      <span className={isBn ? 'font-bangla text-sm' : 'font-sans text-sm'}>{t('nav.login')}</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── SEARCH OVERLAY ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] backdrop-blur-xl bg-brand-black/80"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto mt-32 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden border border-brand-silver/20 shadow-glass-lg bg-brand-navy/90">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-silver" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                    }
                    if (e.key === 'Escape') setSearchOpen(false)
                  }}
                  placeholder={t('common.search_placeholder')}
                  className={cn(
                    'w-full bg-transparent pl-14 pr-14 py-5',
                    'text-brand-white placeholder-brand-silver/50 outline-none',
                    isBn ? 'font-bangla text-lg' : 'font-sans text-lg'
                  )}
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-brand-silver hover:text-brand-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-brand-silver/40 text-xs mt-4 font-sans">
                Press <kbd className="bg-brand-silver/10 rounded px-1.5 py-0.5">Enter</kbd> to search •{' '}
                <kbd className="bg-brand-silver/10 rounded px-1.5 py-0.5">Esc</kbd> to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <MobileBottomNav cartCount={cartCount} openCart={openCart} t={t} isBn={isBn} />
    </>
  )
}

// ─── ACCOUNT DROPDOWN ────────────────────────────────────────────────────────
function AccountMenu({ session, t, isBn }: { session: any; t: any; isBn: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative hidden md:block">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all duration-200"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? 'User'}
            width={28}
            height={28}
            className="rounded-full ring-1 ring-brand-silver/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-silver/20 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden backdrop-blur-xl bg-brand-black/90 border border-brand-silver/10 shadow-glass-lg"
          >
            <div className="px-4 py-3 border-b border-brand-silver/10">
              <p className="text-brand-white font-medium text-sm truncate">{session.user?.name}</p>
              <p className="text-brand-silver/60 text-xs truncate">{session.user?.email}</p>
            </div>
            <div className="p-2">
              {[
                { icon: Package, label: t('account.my_orders'), labelBn: 'আমার অর্ডার', href: '/account/orders' },
                { icon: Heart, label: t('nav.wishlist'), labelBn: 'উইশলিস্ট', href: '/account/wishlist' },
                { icon: Settings, label: t('account.settings'), labelBn: 'সেটিংস', href: '/account/settings' },
              ].map(({ icon: Icon, label, labelBn, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all duration-150"
                >
                  <Icon className="w-4 h-4" />
                  <span className={cn('text-sm', isBn ? 'font-bangla' : 'font-sans')}>
                    {isBn ? labelBn : label}
                  </span>
                </Link>
              ))}
              <button
                onClick={() => { signOut(); setOpen(false) }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-brand-silver hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span className={cn('text-sm', isBn ? 'font-bangla' : 'font-sans')}>{t('nav.logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MOBILE BOTTOM NAVIGATION ────────────────────────────────────────────────
function MobileBottomNav({
  cartCount, openCart, t, isBn,
}: {
  cartCount: number
  openCart: () => void
  t: any
  isBn: boolean
}) {
  const { data: session } = useSession()

  const items = [
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>, label: isBn ? 'হোম' : 'Home', href: '/', action: null },
    { icon: <Search className="w-5 h-5" />, label: isBn ? 'খুঁজুন' : 'Search', href: '/products', action: null },
    {
      icon: (
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-accent text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
      ),
      label: isBn ? 'কার্ট' : 'Cart',
      href: null,
      action: openCart,
    },
    {
      icon: <User className="w-5 h-5" />,
      label: isBn ? 'অ্যাকাউন্ট' : 'Account',
      href: session ? '/account' : '/auth/login',
      action: null,
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* frosted glass pill */}
      <div className="mx-3 mb-3 rounded-2xl backdrop-blur-xl bg-brand-black/85 border border-brand-silver/15 shadow-glass-lg overflow-hidden">
        <div className="flex">
          {items.map((item, i) => {
            const Tag = item.action ? 'button' : Link
            const props = item.action
              ? { onClick: item.action, className: '' }
              : { href: item.href as string, className: '' }

            return (
              <Tag
                key={i}
                {...(props as any)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-brand-silver hover:text-brand-white active:text-brand-white transition-colors duration-150"
              >
                {item.icon}
                <span className={cn('text-[10px] leading-none', isBn ? 'font-bangla' : 'font-sans tracking-wide')}>
                  {item.label}
                </span>
              </Tag>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
