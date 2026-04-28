'use client'

// src/components/product/ProductCard.tsx
// VERCE BD — Premium Product Card with Skeleton Loader

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Eye, Star, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCartStore, useLanguageStore } from '@/store/cart-store'
import { cn, formatPriceEn, getDiscountPercent } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-brand-navy/50 border border-brand-silver/8 animate-pulse">
      {/* Image area */}
      <div className="relative aspect-[3/4] bg-brand-slate/30 overflow-hidden">
        <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer" />
      </div>
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-3 bg-brand-slate/40 rounded-full w-1/3" />
        <div className="h-4 bg-brand-slate/40 rounded-full w-3/4" />
        <div className="h-4 bg-brand-slate/30 rounded-full w-1/2" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-5 bg-brand-slate/40 rounded-full w-1/3" />
          <div className="h-9 bg-brand-slate/30 rounded-xl w-28" />
        </div>
      </div>
    </div>
  )
}

// ─── PRODUCT CARD ────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product
  index?: number
  view?: 'grid' | 'list'
}

export default function ProductCard({ product, index = 0, view = 'grid' }: ProductCardProps) {
  const { t } = useTranslation('common')
  const { language } = useLanguageStore()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageIdx, setImageIdx] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [hovering, setHovering] = useState(false)

  const isBn = language === 'bn'
  const displayName = isBn ? product.nameBn : product.name
  const primaryImage = product.images?.[imageIdx]?.url ?? '/placeholder-product.jpg'
  const hoverImage = product.images?.[1]?.url
  const isOnSale = product.comparePrice && product.comparePrice > product.price
  const isNew = product.tags?.includes('new-arrival')
  const isFeatured = product.tags?.includes('bestseller')
  const isOutOfStock = product.stockQuantity === 0
  const discount = isOnSale ? getDiscountPercent(product.comparePrice!, product.price) : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock || isAdding) return

    setIsAdding(true)
    addItem(product)

    toast.custom(
      (toastInstance) => (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl max-w-xs w-full',
            'backdrop-blur-xl bg-brand-navy/95 border border-brand-silver/15 shadow-glass'
          )}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-brand-silver/20">
            <Image src={primaryImage} alt={displayName} width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className={cn('text-brand-white text-sm font-medium', isBn && 'font-bangla')}>
              {isBn ? 'কার্টে যোগ হয়েছে' : 'Added to cart'}
            </p>
            <p className="text-brand-silver/60 text-xs truncate max-w-[180px]">{displayName}</p>
          </div>
        </motion.div>
      ),
      { duration: 2500 }
    )

    setTimeout(() => setIsAdding(false), 800)
  }

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="group rounded-2xl overflow-hidden bg-brand-navy/40 border border-brand-silver/8 hover:border-brand-silver/20 transition-all duration-300 hover:shadow-card"
      >
        <Link href={`/products/${product.slug}`} className="flex gap-4 p-4">
          <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={primaryImage} alt={displayName} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-brand-silver/60 text-xs mb-1">{product.category?.name}</p>
            <h3 className={cn('text-brand-white font-medium truncate', isBn && 'font-bangla')}>{displayName}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-brand-white font-display text-lg">{formatPriceEn(product.price)}</span>
              {isOnSale && <span className="text-brand-silver/50 text-sm line-through">{formatPriceEn(product.comparePrice!)}</span>}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="self-center p-2.5 rounded-xl bg-brand-silver/8 hover:bg-brand-accent text-brand-silver hover:text-white transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      className={cn(
        'group relative rounded-3xl overflow-hidden',
        'bg-brand-navy/40 border border-brand-silver/8',
        'hover:border-brand-silver/25 hover:shadow-card-hover',
        'transition-all duration-500 ease-luxury'
      )}
    >
      <Link href={`/products/${product.slug}`}>
        {/* ── IMAGE AREA ─────────────────────────────── */}
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-slate/20">
          {/* Primary Image */}
          <motion.div
            animate={{ scale: hovering ? 1.06 : 1, opacity: hovering && hoverImage ? 0 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={primaryImage}
              alt={displayName}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop' }}
            />
          </motion.div>

          {/* Hover Image */}
          {hoverImage && (
            <motion.div
              animate={{ scale: hovering ? 1.04 : 1.08, opacity: hovering ? 1 : 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image src={hoverImage} alt={`${displayName} alternate`} fill className="object-cover" />
            </motion.div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          {/* ── BADGES ────────────────────────────── */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-accent text-white backdrop-blur-sm">
                {t('product.new')}
              </span>
            )}
            {isOnSale && discount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-red-500/90 text-white backdrop-blur-sm">
                -{discount}%
              </span>
            )}
            {isFeatured && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-brand-gold/20 text-brand-gold backdrop-blur-sm border border-brand-gold/30">
                <Star className="w-2.5 h-2.5 fill-brand-gold" />
                {isBn ? 'সেরা' : 'Best'}
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-brand-black/70 text-brand-silver backdrop-blur-sm border border-brand-silver/20">
                {t('product.out_of_stock')}
              </span>
            )}
          </div>

          {/* ── WISHLIST BUTTON ───────────────────── */}
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: hovering ? 1 : 0, x: hovering ? 0 : 8 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsWishlisted(!isWishlisted)
              toast.success(isWishlisted ? (isBn ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist') : (isBn ? 'উইশলিস্টে যোগ হয়েছে' : 'Added to wishlist'))
            }}
            className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-sm bg-brand-black/50 border border-brand-silver/20 text-brand-silver hover:text-red-400 transition-colors"
          >
            <Heart className={cn('w-4 h-4 transition-all', isWishlisted && 'fill-red-400 text-red-400')} />
          </motion.button>

          {/* ── QUICK VIEW ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: hovering ? 1 : 0, y: hovering ? 0 : 12 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="absolute bottom-3 left-3 right-3"
          >
            <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl backdrop-blur-md bg-brand-black/70 border border-brand-silver/20">
              <Eye className="w-4 h-4 text-brand-silver" />
              <span className={cn('text-brand-silver text-xs font-medium', isBn && 'font-bangla')}>
                {isBn ? 'দ্রুত দেখুন' : 'Quick View'}
              </span>
            </div>
          </motion.div>

          {/* Image dots (if multiple images) */}
          {product.images?.length > 1 && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {product.images.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImageIdx(i) }}
                  className={cn('w-1.5 h-1.5 rounded-full transition-all', i === imageIdx ? 'bg-brand-white w-3' : 'bg-brand-silver/40')}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── PRODUCT INFO ───────────────────────────── */}
        <div className="p-4">
          {product.category && (
            <p className={cn('text-brand-silver/50 text-xs mb-1 uppercase tracking-widest', isBn && 'font-bangla normal-case')}>
              {isBn ? product.category.nameBn : product.category.name}
            </p>
          )}

          <h3 className={cn(
            'text-brand-white font-medium text-sm line-clamp-2 leading-snug mb-3',
            isBn ? 'font-bangla text-base' : 'font-sans'
          )}>
            {displayName}
          </h3>

          {/* Variant color swatches */}
          {product.variants?.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {product.variants.slice(0, 5).map((v) =>
                v.options?.color ? (
                  <div
                    key={v.id}
                    title={v.options.color}
                    className="w-4 h-4 rounded-full border border-brand-silver/20 flex-shrink-0"
                    style={{ backgroundColor: v.options.color.toLowerCase() }}
                  />
                ) : null
              )}
              {product.variants.length > 5 && (
                <span className="text-brand-silver/40 text-xs">+{product.variants.length - 5}</span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-brand-white font-display text-lg font-semibold">
                {formatPriceEn(product.price)}
              </span>
              {isOnSale && (
                <span className="text-brand-silver/40 text-sm line-through ml-2">
                  {formatPriceEn(product.comparePrice!)}
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-medium',
                'transition-all duration-300',
                isOutOfStock
                  ? 'bg-brand-silver/10 text-brand-silver/40 cursor-not-allowed'
                  : isAdding
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-brand-silver/10 hover:bg-brand-accent text-brand-silver hover:text-white border border-brand-silver/15 hover:border-brand-accent',
                isBn && 'font-bangla'
              )}
            >
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.span key="added" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {isBn ? 'যোগ হয়েছে' : 'Added!'}
                  </motion.span>
                ) : (
                  <motion.span key="add" className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {isBn ? 'কার্টে যোগ' : 'Add to Cart'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
