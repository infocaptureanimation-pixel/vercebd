// src/app/page.tsx
import { Suspense } from 'react'
import HeroSection from '@/components/layout/HeroSection'
import ProductGrid from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCard'

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ProductGrid
            title="Featured Collection"
            titleBn="ফিচার্ড কালেকশন"
            limit={8}
            showFilters={false}
          />
        </Suspense>
      </section>

      {/* Marquee Banner */}
      <div className="overflow-hidden py-6 border-y border-brand-silver/8 my-12">
        <div className="animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 px-8 text-brand-silver/30 text-sm font-sans tracking-[0.3em] uppercase">
              <span>Defined by Style</span>
              <span className="text-brand-silver/15">✦</span>
              <span>Driven by Ambition</span>
              <span className="text-brand-silver/15">✦</span>
              <span>VERCE BD</span>
              <span className="text-brand-silver/15">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ProductGrid
            title="All Products"
            titleBn="সমস্ত পণ্য"
            showFilters
          />
        </Suspense>
      </section>
    </>
  )
}
