import Link from 'next/link';
import Image from 'next/image';
import {
  Ruler,
  ShieldCheck,
  Stack,
  MagnifyingGlass,
  ArrowLeft,
  CheckCircle,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/components/public/collection-card';
import { ProductCard } from '@/components/public/product-card';
import { getFeaturedCollections } from '@/lib/services/collections.service';
import { getFeaturedProducts } from '@/lib/services/products.service';
import { toPersianDigits } from '@/lib/utils/format';

export const revalidate = 3600; // ISR: هر ۱ ساعت بازتولید می‌شود (لایه SEO/Performance)

const stats = [
  { label: 'سری محصول فعال', value: 120 },
  { label: 'سایز فنی ثبت‌شده', value: 480 },
  { label: 'پروژه معماری', value: 350 },
  { label: 'سال تجربه تخصصی', value: 18 },
];

const features = [
  {
    icon: Ruler,
    title: 'جزئیات فنی دقیق',
    desc: 'ابعاد، ضخامت، جذب آب، مقاومت سایشی PEI و استاندارد ISO 13006 برای هر سایز به‌صورت شفاف.',
  },
  {
    icon: Stack,
    title: 'کاتالوگ ساختاریافته',
    desc: 'دسته‌بندی دقیق کالکشن، سری و محصول برای یافتن سریع طرح موردنظر شما.',
  },
  {
    icon: ShieldCheck,
    title: 'استعلام امن و حرفه‌ای',
    desc: 'سبد استعلام پایدار همراه با احراز هویت Email OTP، بدون نیاز به ثبت‌نام پیچیده.',
  },
];

export default async function HomePage() {
  const [collections, products] = await Promise.all([getFeaturedCollections(), getFeaturedProducts()]);

  return (
    <>
      {/* ----------------------------- Hero ----------------------------- */}
      <section className="relative overflow-hidden border-b border-ink-200">
        <div className="industrial-grid-bg absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28 lg:px-8">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-bronze-300 bg-bronze-50 px-4 py-1.5 text-xs font-bold text-bronze-700">
              کاتالوگ تخصصی B2B / B2C
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-ink-900 sm:text-5xl lg:text-6xl text-balance">
              کاشی و سرامیک را با <span className="text-bronze-500">دقت مهندسی</span> انتخاب کنید
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-500 sm:text-lg">
              نمایش دقیق مشخصات فنی هر سایز، بدون قیمت‌گذاری عمومی و بدون پیچیدگی خرید آنلاین. سبد
              استعلام خود را بسازید و قیمت رسمی را از کارشناسان ما دریافت کنید.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/collections">
                  مشاهده کالکشن‌ها <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/search">
                  <MagnifyingGlass className="h-5 w-5" /> جستجوی سریع محصول
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-ink-200 pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black text-bronze-600">+{toPersianDigits(stat.value)}</div>
                  <div className="mt-1 text-xs text-ink-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-ink-200 shadow-industrial-lg lg:h-[560px]">
            <Image src="/images/hero.jpg" alt="نمایشگاه کاشی و سرامیک" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* ------------------------- Featured Collections ------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-bronze-500">Collections</span>
            <h2 className="mt-2 text-3xl font-black text-ink-900">کالکشن‌های ویژه</h2>
          </div>
          <Link href="/collections" className="text-sm font-semibold text-bronze-600 hover:underline">
            مشاهده همه کالکشن‌ها ←
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {/* ------------------------------- Features ------------------------------- */}
      <section className="border-y border-ink-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-bronze-500">چرا این پلتفرم؟</span>
            <h2 className="mt-2 text-3xl font-black text-ink-900">ساخته‌شده برای تصمیم‌گیری حرفه‌ای</h2>
            <p className="mt-4 text-ink-500">
              این پلتفرم یک فروشگاه آنلاین نیست؛ یک مرجع فنی دقیق برای معماران، پیمانکاران و
              مصرف‌کنندگانی است که به جزئیات اهمیت می‌دهند.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-ink-200 p-8 transition-shadow hover:shadow-industrial">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bronze-500 text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------- Featured Products -------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-bronze-500">Products</span>
            <h2 className="mt-2 text-3xl font-black text-ink-900">محصولات پرطرفدار</h2>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ---------------------------------- CTA ---------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center sm:px-16">
          <div className="industrial-grid-bg absolute inset-0 opacity-10" />
          <div className="relative">
            <h2 className="text-3xl font-black text-white sm:text-4xl">آماده دریافت قیمت رسمی هستید؟</h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-300">
              محصولات موردنظر را به سبد استعلام اضافه کنید و در کمتر از چند دقیقه با احراز هویت
              ایمیلی، درخواست خود را برای کارشناسان ما ارسال کنید.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/inquiry">
                  <CheckCircle className="h-5 w-5" /> رفتن به سبد استعلام
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/collections">مرور کاتالوگ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
