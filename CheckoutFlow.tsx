'use client'

// src/components/checkout/CheckoutFlow.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Check, ChevronRight, MapPin, CreditCard, Package, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useCartStore, useLanguageStore } from '@/store/cart-store'
import { BD_DIVISIONS, getDistrictsByDivision } from '@/lib/bd-geography'
import { cn, formatPriceEn } from '@/lib/utils'
import type { PaymentMethod } from '@/types'
import toast from 'react-hot-toast'

// ─── VALIDATION SCHEMAS ──────────────────────────────────────────────────────
const addressSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(?:\+88)?01[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number'),
  line1: z.string().min(5, 'Please enter your full address'),
  line2: z.string().optional(),
  upazila: z.string().min(1, 'Upazila is required'),
  district: z.string().min(1, 'District is required'),
  division: z.string().min(1, 'Division is required'),
  postalCode: z.string().optional(),
})

type AddressForm = z.infer<typeof addressSchema>

const PAYMENT_METHODS: {
  id: PaymentMethod
  labelEn: string
  labelBn: string
  icon: string
  descEn: string
  descBn: string
  color: string
}[] = [
  {
    id: 'BKASH',
    labelEn: 'bKash',
    labelBn: 'বিকাশ',
    icon: '🟣',
    descEn: 'Pay via bKash mobile banking',
    descBn: 'বিকাশ মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন',
    color: 'from-pink-600/20 to-purple-600/10 border-pink-500/30',
  },
  {
    id: 'NAGAD',
    labelEn: 'Nagad',
    labelBn: 'নগদ',
    icon: '🟠',
    descEn: 'Pay via Nagad mobile banking',
    descBn: 'নগদ মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন',
    color: 'from-orange-600/20 to-yellow-600/10 border-orange-500/30',
  },
  {
    id: 'CASH_ON_DELIVERY',
    labelEn: 'Cash on Delivery',
    labelBn: 'ক্যাশ অন ডেলিভারি',
    icon: '💵',
    descEn: 'Pay when your order arrives',
    descBn: 'পণ্য পাওয়ার পর পেমেন্ট করুন',
    color: 'from-green-600/20 to-emerald-600/10 border-green-500/30',
  },
  {
    id: 'CARD',
    labelEn: 'Credit / Debit Card',
    labelBn: 'ক্রেডিট / ডেবিট কার্ড',
    icon: '💳',
    descEn: 'Secure card payment via SSL',
    descBn: 'SSL নিরাপদ কার্ড পেমেন্ট',
    color: 'from-blue-600/20 to-cyan-600/10 border-blue-500/30',
  },
]

const STEPS = [
  { id: 1, icon: MapPin, labelEn: 'Address', labelBn: 'ঠিকানা' },
  { id: 2, icon: CreditCard, labelEn: 'Payment', labelBn: 'পেমেন্ট' },
  { id: 3, icon: Package, labelEn: 'Confirm', labelBn: 'নিশ্চিত' },
]

export default function CheckoutFlow() {
  const { t } = useTranslation('common')
  const { language } = useLanguageStore()
  const isBn = language === 'bn'
  const { items, subtotal, clearCart } = useCartStore()

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY')
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const sub = subtotal()
  const FREE_THRESHOLD = 2000
  const shipping = sub >= FREE_THRESHOLD ? 0 : 80
  const total = sub + shipping

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) })

  const selectedDivision = watch('division')
  const districts = selectedDivision ? getDistrictsByDivision(selectedDivision) : []
  const addressData = watch()

  const onAddressSubmit = (data: AddressForm) => {
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    try {
      // In production: call server action or API
      // const res = await placeOrder({ address: addressData, paymentMethod, notes: orderNotes, items })
      await new Promise((r) => setTimeout(r, 1800)) // Simulate API call
      const fakeOrderNum = `VBD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
      setOrderNumber(fakeOrderNum)
      clearCart()
      setStep(3)
    } catch {
      toast.error(isBn ? 'অর্ডার দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* ── STEP INDICATOR ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <motion.div
              animate={{
                backgroundColor: step > s.id ? '#22c55e' : step === s.id ? '#3B82F6' : 'rgba(148,163,184,0.1)',
                borderColor: step > s.id ? '#22c55e' : step === s.id ? '#3B82F6' : 'rgba(148,163,184,0.2)',
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 relative"
            >
              {step > s.id ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <s.icon className={cn('w-4 h-4', step === s.id ? 'text-white' : 'text-brand-silver/40')} />
              )}
              <span className={cn(
                'absolute -bottom-6 text-xs whitespace-nowrap',
                step === s.id ? 'text-brand-white' : 'text-brand-silver/40',
                isBn && 'font-bangla'
              )}>
                {isBn ? s.labelBn : s.labelEn}
              </span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className="w-16 sm:w-24 h-0.5 mx-1">
                <motion.div
                  animate={{ width: step > s.id ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-green-500 rounded-full"
                  style={{ backgroundColor: step > s.id ? '#22c55e' : 'rgba(148,163,184,0.15)' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: ADDRESS ─────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className={cn('text-brand-white text-2xl mb-6', isBn ? 'font-bangla font-bold' : 'font-display')}>
                  {t('checkout.step1')}
                </h2>
                <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label={t('checkout.full_name')} error={errors.fullName?.message} isBn={isBn}>
                      <input
                        {...register('fullName')}
                        placeholder={isBn ? 'আপনার পুরো নাম' : 'Your full name'}
                        className={inputClass(isBn)}
                      />
                    </FormField>
                    <FormField label={t('checkout.phone')} error={errors.phone?.message} isBn={isBn}>
                      <input
                        {...register('phone')}
                        placeholder="01XXXXXXXXX"
                        className={inputClass(isBn)}
                      />
                    </FormField>
                  </div>

                  <FormField label={t('checkout.address_line1')} error={errors.line1?.message} isBn={isBn}>
                    <input
                      {...register('line1')}
                      placeholder={isBn ? 'বাড়ি নম্বর, রাস্তা, এলাকা' : 'House no, road, area'}
                      className={inputClass(isBn)}
                    />
                  </FormField>
                  <FormField label={t('checkout.address_line2')} isBn={isBn}>
                    <input
                      {...register('line2')}
                      placeholder={isBn ? 'অতিরিক্ত ঠিকানা (ঐচ্ছিক)' : 'Apartment, suite, etc. (optional)'}
                      className={inputClass(isBn)}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label={t('checkout.division')} error={errors.division?.message} isBn={isBn}>
                      <select {...register('division')} className={inputClass(isBn)}>
                        <option value="">{t('checkout.select_division')}</option>
                        {BD_DIVISIONS.map((div) => (
                          <option key={div.name} value={div.name}>
                            {isBn ? div.nameBn : div.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label={t('checkout.district')} error={errors.district?.message} isBn={isBn}>
                      <select {...register('district')} className={inputClass(isBn)} disabled={!selectedDivision}>
                        <option value="">{t('checkout.select_district')}</option>
                        {districts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {isBn ? d.nameBn : d.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label={t('checkout.upazila')} error={errors.upazila?.message} isBn={isBn}>
                      <input
                        {...register('upazila')}
                        placeholder={isBn ? 'উপজেলা / থানার নাম' : 'Upazila / Thana name'}
                        className={inputClass(isBn)}
                      />
                    </FormField>
                    <FormField label={t('checkout.postal_code')} isBn={isBn}>
                      <input
                        {...register('postalCode')}
                        placeholder={isBn ? 'পোস্টাল কোড' : 'Postal code (optional)'}
                        className={inputClass(isBn)}
                      />
                    </FormField>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={cn(
                      'w-full py-4 mt-2 rounded-2xl font-semibold',
                      'bg-brand-white text-brand-black hover:bg-brand-silver',
                      'flex items-center justify-center gap-2 transition-all duration-300',
                      'group',
                      isBn && 'font-bangla text-base'
                    )}
                  >
                    {t('checkout.next')}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: PAYMENT ─────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className={cn('text-brand-white text-2xl mb-6', isBn ? 'font-bangla font-bold' : 'font-display')}>
                  {t('checkout.payment_method')}
                </h2>

                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((pm) => (
                    <motion.button
                      key={pm.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-2xl text-left',
                        'bg-gradient-to-r border transition-all duration-200',
                        paymentMethod === pm.id
                          ? pm.color + ' ring-2 ring-brand-accent/50'
                          : 'from-brand-navy/30 to-brand-navy/20 border-brand-silver/10 hover:border-brand-silver/20'
                      )}
                    >
                      <div className="text-2xl flex-shrink-0">{pm.icon}</div>
                      <div className="flex-1">
                        <p className={cn('text-brand-white font-medium', isBn && 'font-bangla')}>
                          {isBn ? pm.labelBn : pm.labelEn}
                        </p>
                        <p className={cn('text-brand-silver/50 text-xs mt-0.5', isBn && 'font-bangla')}>
                          {isBn ? pm.descBn : pm.descEn}
                        </p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        paymentMethod === pm.id ? 'border-brand-accent bg-brand-accent' : 'border-brand-silver/30'
                      )}>
                        {paymentMethod === pm.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* bKash/Nagad Instructions */}
                {(paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-2xl bg-brand-navy/60 border border-brand-silver/10 mb-6 space-y-2"
                  >
                    <p className={cn('text-brand-white text-sm font-medium', isBn && 'font-bangla')}>
                      {isBn ? 'পেমেন্ট নির্দেশনা:' : 'Payment Instructions:'}
                    </p>
                    <ol className={cn('text-brand-silver/70 text-sm space-y-1 list-decimal list-inside', isBn && 'font-bangla')}>
                      <li>{isBn ? `${paymentMethod === 'BKASH' ? 'বিকাশ' : 'নগদ'} অ্যাপ খুলুন` : `Open ${paymentMethod === 'BKASH' ? 'bKash' : 'Nagad'} app`}</li>
                      <li>{isBn ? '"পেমেন্ট" সিলেক্ট করুন' : 'Select "Send Money"'}</li>
                      <li>
                        {isBn ? 'মার্চেন্ট নম্বরে পাঠান: ' : 'Send to merchant number: '}
                        <span className="text-brand-white font-medium font-mono">01XXXXXXXXX</span>
                      </li>
                      <li>{isBn ? 'ট্রানজেকশন আইডি অর্ডারে উল্লেখ করুন' : 'Note the Transaction ID for your order'}</li>
                    </ol>
                  </motion.div>
                )}

                {/* Order Notes */}
                <div className="mb-6">
                  <label className={cn('block text-brand-silver/70 text-sm mb-2', isBn && 'font-bangla')}>
                    {t('checkout.order_notes')}
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder={isBn ? 'কোনো বিশেষ নির্দেশনা থাকলে লিখুন...' : 'Any special instructions for your order...'}
                    rows={3}
                    className={cn(inputClass(isBn), 'resize-none')}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className={cn(
                      'flex-1 py-4 rounded-2xl border border-brand-silver/15',
                      'text-brand-silver hover:text-brand-white hover:border-brand-silver/30',
                      'transition-all font-medium',
                      isBn && 'font-bangla'
                    )}
                  >
                    {t('checkout.back')}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className={cn(
                      'flex-[2] py-4 rounded-2xl font-semibold',
                      'bg-brand-white text-brand-black hover:bg-brand-silver',
                      'flex items-center justify-center gap-2 transition-all',
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                      isBn && 'font-bangla text-base'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isBn ? 'প্রসেস হচ্ছে...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        {t('checkout.place_order')}
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: CONFIRMATION ────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-12 h-12 text-green-400" />
                </motion.div>

                <h2 className={cn('text-brand-white text-3xl mb-3', isBn ? 'font-bangla font-bold' : 'font-display')}>
                  {isBn ? 'অর্ডার সফল হয়েছে!' : 'Order Placed!'}
                </h2>
                <p className={cn('text-brand-silver/60 mb-2', isBn && 'font-bangla')}>
                  {isBn ? 'আপনার অর্ডার নম্বর:' : 'Your order number:'}
                </p>
                <p className="text-brand-white font-mono text-xl font-bold mb-6">{orderNumber}</p>
                <p className={cn('text-brand-silver/50 text-sm mb-8 max-w-sm mx-auto', isBn && 'font-bangla')}>
                  {isBn
                    ? 'আপনার অর্ডার নিশ্চিত হয়েছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।'
                    : 'Your order has been confirmed. We will contact you shortly with shipping details.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/account/orders"
                    className={cn(
                      'px-6 py-3 rounded-2xl bg-brand-silver/8 border border-brand-silver/15',
                      'text-brand-silver hover:text-brand-white transition-all',
                      isBn && 'font-bangla'
                    )}
                  >
                    {isBn ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
                  </a>
                  <a
                    href="/"
                    className={cn(
                      'px-6 py-3 rounded-2xl bg-brand-white text-brand-black font-semibold',
                      'hover:bg-brand-silver transition-all',
                      isBn && 'font-bangla'
                    )}
                  >
                    {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── ORDER SUMMARY ─────────────────────────────────────────── */}
        {step < 3 && (
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl bg-brand-navy/50 border border-brand-silver/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-silver/10">
                <h3 className={cn('text-brand-white font-medium', isBn && 'font-bangla')}>
                  {t('checkout.order_summary')}
                </h3>
              </div>

              <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-brand-slate/20">
                      <Image
                        src={item.product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=120&fit=crop'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-black text-brand-white text-[9px] flex items-center justify-center font-bold border border-brand-silver/20">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-brand-white text-xs font-medium line-clamp-2', isBn && 'font-bangla')}>
                        {isBn ? item.product.nameBn : item.product.name}
                      </p>
                      <p className="text-brand-silver/50 text-xs mt-1">
                        {formatPriceEn((item.variant?.price ?? item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-brand-silver/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={cn('text-brand-silver/60', isBn && 'font-bangla')}>{t('cart.subtotal')}</span>
                  <span className="text-brand-white">{formatPriceEn(sub)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={cn('text-brand-silver/60', isBn && 'font-bangla')}>{t('cart.shipping')}</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-brand-white'}>
                    {shipping === 0 ? (isBn ? 'বিনামূল্যে' : 'Free') : formatPriceEn(shipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-brand-silver/10">
                  <span className={cn('text-brand-white font-medium', isBn && 'font-bangla')}>{t('cart.total')}</span>
                  <span className="text-brand-white font-display text-lg">{formatPriceEn(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function FormField({
  label, error, isBn, children,
}: { label: string; error?: string; isBn: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={cn('block text-brand-silver/70 text-sm mb-1.5', isBn && 'font-bangla')}>
        {label}
      </label>
      {children}
      {error && (
        <p className={cn('text-red-400 text-xs mt-1', isBn && 'font-bangla')}>{error}</p>
      )}
    </div>
  )
}

function inputClass(isBn: boolean) {
  return cn(
    'w-full px-4 py-3 rounded-xl outline-none',
    'bg-brand-navy/60 border border-brand-silver/15',
    'text-brand-white placeholder-brand-silver/30',
    'focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    isBn && 'font-bangla'
  )
}
