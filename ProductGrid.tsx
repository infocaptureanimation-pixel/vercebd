'use client'

// src/components/product/ProductGrid.tsx
// VERCE BD — Dynamic Product Grid with Filters & Skeleton States

import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, LayoutGrid, List, ChevronDown, X, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ProductCard, { ProductCardSkeleton } from './ProductCard'
import { useLanguageStore } from '@/store/cart-store'
import { cn } from '@/lib/utils'
import type { ProductFilters } from '@/types'

// API fetcher — calls the Next.js API route
async function fetchProducts(filters: ProductFilters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      if (Array.isArray(v)) params.set(k, v.join(','))
      else params.set(k, String(v))
    }
  })
  const res = await fetch(`/api/products?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

const SORT_OPTIONS = [
  { value: 'newest', labelEn: 'Newest First', labelBn: 'সর্বশেষ' },
  { value: 'price_asc', labelEn: 'Price: Low to High', labelBn: 'মূল্য: কম থেকে বেশি' },
  { value: 'price_desc', labelEn: 'Price: High to Low', labelBn: 'মূল্য: বেশি থেকে কম' },
  { value: 'popular', labelEn: 'Most Popular', labelBn: 'সবচেয়ে জনপ্রিয়' },
]

const PRICE_RANGES = [
  { labelEn: 'Under ৳1,000', labelBn: '৳১,০০০-এর নিচে', min: 0, max: 1000 },
  { labelEn: '৳1,000 – ৳2,500', labelBn: '৳১,০০০ – ৳২,৫০০', min: 1000, max: 2500 },
  { labelEn: '৳2,500 – ৳5,000', labelBn: '৳২,৫০০ – ৳৫,০০০', min: 2500, max: 5000 },
  { labelEn: 'Above ৳5,000', labelBn: '৳৫,০০০-এর উপরে', min: 5000, max: undefined },
]

const TAGS = [
  { value: 'new-arrival', labelEn: 'New Arrivals', labelBn: 'নতুন আগমন' },
  { value: 'bestseller', labelEn: 'Bestsellers', labelBn: 'বেস্টসেলার' },
  { value: 'sale', labelEn: 'On Sale', labelBn: 'সেলে আছে' },
  { value: 'limited', labelEn: 'Limited Edition', labelBn: 'সীমিত সংস্করণ' },
]

interface ProductGridProps {
  initialCategory?: string
  initialSearch?: string
  title?: string
  titleBn?: string
  showFilters?: boolean
  limit?: number
  featuredOnly?: boolean
}

export default function ProductGrid({
  initialCategory,
  initialSearch,
  title = 'Our Collection',
  titleBn = 'আমাদের কালেকশন',
  showFilters = true,
  limit = 12,
  featuredOnly = false,
}: ProductGridProps) {
  const { t } = useTranslation('common')
  const { language } = useLanguageStore()
  const isBn = language === 'bn'
  const [isPending] = useTransition()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<ProductFilters>({
    category: initialCategory,
    search: initialSearch,
    sort: 'newest',
    page: 1,
    limit,
    ...(featuredOnly && { tags: ['featured'] }),
  })

  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 60_000, // 1 minute
    placeholderData: (prev) => prev,
  })

  const products = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(next)
    updateFilter('tags', next.length ? next : undefined)
  }

  const selectPriceRange = (idx: number) => {
    if (selectedPriceRange === idx) {
      setSelectedPriceRange(null)
      updateFilter('minPrice', undefined)
      updateFilter('maxPrice', undefined)
    } else {
      setSelectedPriceRange(idx)
      const range = PRICE_RANGES[idx]
      setFilters((prev) => ({ ...prev, minPrice: range.min, maxPrice: range.max, page: 1 }))
    }
  }

  const clearFilters = () => {
    setSelectedPriceRange(null)
    setSelectedTags([])
    setFilters({ category: initialCategory, search: initialSearch, sort: 'newest', page: 1, limit })
  }

  const hasActiveFilters = selectedPriceRange !== null || selectedTags.length > 0

  return (
    <section className="py-8 sm:py-12">
      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-brand-white text-3xl sm:text-4xl',
              isBn ? 'font-bangla font-bold' : 'font-display'
            )}
          >
            {isBn ? titleBn : title}
          </motion.h2>
          {total > 0 && (
            <p className={cn('text-brand-silver/50 text-sm mt-1', isBn && 'font-bangla')}>
              {isBn ? `${total}টি পণ্য পাওয়া গেছে` : `${total} products`}
            </p>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <SortDropdown
              value={filters.sort ?? 'newest'}
              onChange={(v) => updateFilter('sort', v)}
              isBn={isBn}
            />

            {/* Filter Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all',
                filtersOpen || hasActiveFilters
                  ? 'bg-brand-accent text-white'
                  : 'bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white',
                isBn && 'font-bangla'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isBn ? 'ফিল্টার' : 'Filter'}
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">
                  {(selectedPriceRange !== null ? 1 : 0) + selectedTags.length}
                </span>
              )}
            </motion.button>

            {/* View Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-brand-silver/15">
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'p-2.5 transition-all',
                    view === v
                      ? 'bg-brand-silver/15 text-brand-white'
                      : 'text-brand-silver/50 hover:text-brand-silver'
                  )}
                >
                  {v === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FILTER PANEL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mb-8"
          >
            <div className="p-5 rounded-2xl bg-brand-navy/50 border border-brand-silver/10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Price Filter */}
                <div>
                  <h4 className={cn('text-brand-white font-medium text-sm mb-3', isBn && 'font-bangla')}>
                    {isBn ? 'মূল্য পরিসর' : 'Price Range'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => selectPriceRange(i)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                          selectedPriceRange === i
                            ? 'bg-brand-accent text-white'
                            : 'bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white',
                          isBn && 'font-bangla'
                        )}
                      >
                        {isBn ? range.labelBn : range.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Filter */}
                <div>
                  <h4 className={cn('text-brand-white font-medium text-sm mb-3', isBn && 'font-bangla')}>
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => toggleTag(tag.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                          selectedTags.includes(tag.value)
                            ? 'bg-brand-accent text-white'
                            : 'bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white',
                          isBn && 'font-bangla'
                        )}
                      >
                        {isBn ? tag.labelBn : tag.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-4 border-t border-brand-silver/10">
                  <p className={cn('text-brand-silver/60 text-sm', isBn && 'font-bangla')}>
                    {isBn ? 'ফিল্টার সক্রিয়' : 'Filters active'}
                  </p>
                  <button
                    onClick={clearFilters}
                    className={cn(
                      'flex items-center gap-1.5 text-sm text-brand-silver hover:text-red-400 transition-colors',
                      isBn && 'font-bangla'
                    )}
                  >
                    <X className="w-4 h-4" />
                    {isBn ? 'সব সরান' : 'Clear all'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRODUCT GRID ─────────────────────────────────────────────── */}
      {isError ? (
        <div className="text-center py-24 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className={cn('text-brand-silver', isBn && 'font-bangla')}>{t('common.error')}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 rounded-xl bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              view === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
                : 'flex flex-col gap-3'
            )}
          >
            {isLoading
              ? Array.from({ length: limit }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : products.length > 0
              ? products.map((product: any, i: number) => (
                  <ProductCard key={product.id} product={product} index={i} view={view} />
                ))
              : null}
          </div>

          {/* Empty State */}
          {!isLoading && products.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 space-y-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-brand-silver/8 flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-brand-silver/30" />
              </div>
              <p className={cn('text-brand-white text-xl', isBn ? 'font-bangla' : 'font-display')}>
                {t('common.no_results')}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className={cn('text-brand-accent hover:underline text-sm', isBn && 'font-bangla')}
                >
                  {isBn ? 'ফিল্টার সরান' : 'Clear filters'}
                </button>
              )}
            </motion.div>
          )}

          {/* ── PAGINATION ──────────────────────────────────────── */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => updateFilter('page', Math.max(1, (filters.page ?? 1) - 1))}
                disabled={(filters.page ?? 1) <= 1}
                className="px-4 py-2.5 rounded-xl bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white disabled:opacity-30 transition-all text-sm"
              >
                {isBn ? 'আগের পাতা' : 'Previous'}
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = i + 1
                const current = filters.page ?? 1
                return (
                  <button
                    key={page}
                    onClick={() => updateFilter('page', page)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-medium transition-all',
                      page === current
                        ? 'bg-brand-accent text-white'
                        : 'bg-brand-silver/8 text-brand-silver hover:text-brand-white'
                    )}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => updateFilter('page', Math.min(totalPages, (filters.page ?? 1) + 1))}
                disabled={(filters.page ?? 1) >= totalPages}
                className="px-4 py-2.5 rounded-xl bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white disabled:opacity-30 transition-all text-sm"
              >
                {isBn ? 'পরের পাতা' : 'Next'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

// ─── SORT DROPDOWN ───────────────────────────────────────────────────────────
function SortDropdown({
  value, onChange, isBn,
}: { value: string; onChange: (v: string) => void; isBn: boolean }) {
  const [open, setOpen] = useState(false)
  const selected = SORT_OPTIONS.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm',
          'bg-brand-silver/8 border border-brand-silver/15 text-brand-silver hover:text-brand-white',
          'transition-all whitespace-nowrap',
          isBn && 'font-bangla'
        )}
      >
        {isBn ? selected?.labelBn : selected?.labelEn}
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden backdrop-blur-xl bg-brand-black/90 border border-brand-silver/10 shadow-glass z-20"
          >
            <div className="p-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all',
                    value === opt.value
                      ? 'bg-brand-accent/20 text-brand-accent'
                      : 'text-brand-silver hover:text-brand-white hover:bg-brand-silver/8',
                    isBn && 'font-bangla'
                  )}
                >
                  {isBn ? opt.labelBn : opt.labelEn}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
