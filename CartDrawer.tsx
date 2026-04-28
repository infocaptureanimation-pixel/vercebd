'use client'

// src/components/cart/CartDrawer.tsx
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCartStore, useLanguageStore } from '@/store/cart-store'
import { cn, formatPriceEn } from '@/lib/utils'

export default function CartDrawer() {
  const { t } = useTranslation('common')
  const { language } = useLanguageStore()
  const isBn = language === 'bn'

  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } = useCartStore()
  const sub = subtotal()
  const count = totalItems()
  const FREE_SHIPPING_THRESHOLD = 2000
  const shippingProgress = Math.min((sub / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - sub, 0)

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-brand-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-[75] w-full max-w-md',
              'flex flex-col bg-brand-black border-l border-brand-silver/10',
              'shadow-glass-lg'
            )}
          >
            {/* ── HEADER ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-silver/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-silver" />
                <h2 className={cn('text-brand-white font-medium', isBn ? 'font-bangla text-lg' : 'font-sans text-base')}>
                  {t('cart.title')}
                </h2>
                {count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent text-xs font-bold">
                    {count}
                  </span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="p-2 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-silver/8 transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* ── FREE SHIPPING PROGRESS ───────────────────────── */}
            {sub > 0 && (
              <div className="px-6 py-3 bg-brand-navy/40 border-b border-brand-silver/8 flex-shrink-0">
                {remaining > 0 ? (
                  <p className={cn('text-brand-silver/70 text-xs mb-2', isBn && 'font-bangla')}>
                    {isBn
                      ? `বিনামূল্যে ডেলিভারির জন্য আরও ${formatPriceEn(remaining)} দরকার`
                      : `${formatPriceEn(remaining)} more for free delivery`}
                  </p>
                ) : (
                  <p className={cn('text-green-400 text-xs mb-2 font-medium', isBn && 'font-bangla')}>
                    🎉 {isBn ? 'বিনামূল্যে ডেলিভারি পাচ্ছেন!' : "You've unlocked free delivery!"}
                  </p>
                )}
                <div className="h-1 rounded-full bg-brand-silver/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={cn('h-full rounded-full', shippingProgress >= 100 ? 'bg-green-400' : 'bg-brand-accent')}
                  />
                </div>
              </div>
            )}

            {/* ── CART ITEMS ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overscroll-contain py-4 px-6 space-y-3">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full py-20 text-center"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-brand-silver/8 flex items-center justify-center mb-6">
                      <Package className="w-12 h-12 text-brand-silver/30" />
                    </div>
                    <p className={cn('text-brand-white text-xl mb-2', isBn ? 'font-bangla font-bold' : 'font-display')}>
                      {t('cart.empty')}
                    </p>
                    <p className={cn('text-brand-silver/50 text-sm mb-8', isBn && 'font-bangla')}>
                      {t('cart.empty_desc')}
                    </p>
                    <button
                      onClick={closeCart}
                      className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-2xl',
                        'bg-brand-silver/8 border border-brand-silver/15',
                        'text-brand-silver hover:text-brand-white transition-all',
                        isBn && 'font-bangla'
                      )}
                    >
                      {t('cart.continue_shopping')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3 p-3 rounded-2xl bg-brand-navy/40 border border-brand-silver/8 hover:border-brand-silver/15 transition-colors"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-brand-slate/20"
                      >
                        <Image
                          src={item.product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=240&fit=crop'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                            className={cn(
                              'text-brand-white text-sm font-medium line-clamp-2 leading-snug hover:text-brand-silver transition-colors',
                              isBn && 'font-bangla'
                            )}
                          >
                            {isBn ? item.product.nameBn : item.product.name}
                          </Link>
                          {item.variant && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.variant.options).map(([k, v]) => (
                                <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-silver/10 text-brand-silver/60 capitalize">
                                  {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Qty Controls */}
                          <div className="flex items-center gap-1 bg-brand-silver/8 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-brand-silver hover:text-brand-white hover:bg-brand-silver/15 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-brand-white text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-brand-silver hover:text-brand-white hover:bg-brand-silver/15 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price + Remove */}
                          <div className="flex items-center gap-2">
                            <span className="text-brand-white font-medium text-sm">
                              {formatPriceEn((item.variant?.price ?? item.product.price) * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product.id, item.variant?.id)}
                              className="p-1.5 rounded-lg text-brand-silver/40 hover:text-red-400 hover:bg-red-500/8 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* ── FOOTER ───────────────────────────────────────── */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-brand-silver/10 space-y-4 flex-shrink-0 bg-brand-black/50 backdrop-blur-sm">
                {/* Subtotal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-brand-silver/60 text-sm', isBn && 'font-bangla')}>
                      {t('cart.subtotal')}
                    </span>
                    <span className="text-brand-white font-medium">{formatPriceEn(sub)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-brand-silver/60 text-sm', isBn && 'font-bangla')}>
                      {t('cart.shipping')}
                    </span>
                    <span className={cn('text-sm font-medium', sub >= FREE_SHIPPING_THRESHOLD ? 'text-green-400' : 'text-brand-silver')}>
                      {sub >= FREE_SHIPPING_THRESHOLD
                        ? (isBn ? 'বিনামূল্যে' : 'Free')
                        : formatPriceEn(80)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-brand-silver/10">
                    <span className={cn('text-brand-white font-medium', isBn && 'font-bangla')}>
                      {t('cart.total')}
                    </span>
                    <span className="text-brand-white font-display text-xl">
                      {formatPriceEn(sub >= FREE_SHIPPING_THRESHOLD ? sub : sub + 80)}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={cn(
                    'flex items-center justify-center gap-2 w-full py-4 rounded-2xl',
                    'bg-brand-white text-brand-black font-semibold',
                    'hover:bg-brand-silver transition-all duration-300',
                    'group',
                    isBn && 'font-bangla text-base'
                  )}
                >
                  {t('cart.checkout')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={closeCart}
                  className={cn(
                    'w-full py-3 rounded-2xl text-brand-silver/60 hover:text-brand-silver text-sm transition-colors',
                    isBn && 'font-bangla'
                  )}
                >
                  {t('cart.continue_shopping')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
