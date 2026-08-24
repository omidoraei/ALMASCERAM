import { formatDimensions, formatNumber, toPersianDigits } from '@/lib/utils/format';
import type { MockSize } from '@/lib/data/mock-catalog';

export function TechnicalDataTable({ size }: { size: MockSize }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'ابعاد (طول × عرض)', value: formatDimensions(size.width_mm, size.height_mm) },
    { label: 'ضخامت', value: `${toPersianDigits(size.thickness_mm)} میلیمتر` },
    { label: 'لبه (Rectified)', value: size.is_rectified ? 'بله' : 'خیر' },
    { label: 'رده سایش PEI', value: `کلاس ${toPersianDigits(size.technical_data.pei_rating)}` },
    { label: 'جذب آب', value: `${toPersianDigits(size.technical_data.water_absorption_percent)}٪` },
    { label: 'مقاومت شکست', value: `${formatNumber(size.technical_data.breaking_strength_n)} نیوتن` },
    { label: 'سختی موهس', value: `${toPersianDigits(size.technical_data.mohs_hardness)} از ۱۰` },
    { label: 'ضدلؼزندگی', value: size.technical_data.slip_resistance_r_rating },
    { label: 'مقاوم یخ', value: size.technical_data.frost_resistant ? 'بله' : 'خیر' },
    { label: 'استاندارد مرجع', value: size.technical_data.standard_reference },
  ];

  const packagingRows: Array<{ label: string; value: string }> = [
    { label: 'تعداد در هر کارتون', value: `${toPersianDigits(size.packaging_pieces_per_box)} عدد` },
    { label: 'کارتون در هر پالت', value: `${toPersianDigits(size.packaging_boxes_per_pallet)} کارتن` },
    { label: 'متراژ در هر کارتون', value: `${toPersianDigits(size.packaging_m2_per_box)} مترمربع` },
    { label: 'وزن هر کارتون', value: `${toPersianDigits(size.packaging_weight_per_box_kg)} کیلوگرم` },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-ink-200">
        <div className="bg-ink-800 px-4 py-3 text-sm font-bold text-white">مشخصات فنی و استاندارد</div>
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}>
                <td className="px-4 py-2.5 text-ink-500">{row.label}</td>
                <td className="px-4 py-2.5 text-left font-semibold text-ink-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-hidden rounded-xl border border-ink-200">
        <div className="bg-bronze-600 px-4 py-3 text-sm font-bold text-white">بسته‌بندی و حمل‌ونقل</div>
        <table className="w-full text-sm">
          <tbody>
            {packagingRows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}>
                <td className="px-4 py-2.5 text-ink-500">{row.label}</td>
                <td className="px-4 py-2.5 text-left font-semibold text-ink-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
