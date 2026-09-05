import { useRef, useState } from 'react'
import { FilePdf, Image, UploadSimple } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './Dialog'
import { uploadSizeMedia, uploadSizePdf } from '../../lib/actions/size-media-actions'
import { isSupabaseConfigured } from '../../lib/supabase/client'

export function UploadWidget({ sizeId, onUploaded }: { sizeId: string; onUploaded?: (path: string) => void }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'media' | 'pdf'>('media')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'room_scene' | 'texture'>('image')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async () => {
    if (!file) { setError('ابتدا فایل را انتخاب کنید'); return }
    setUploading(true); setError('')
    try {
      if (!isSupabaseConfigured) {
        await new Promise((resolve) => window.setTimeout(resolve, 650))
        onUploaded?.(`demo/sizes/${sizeId}/${file.name}`)
      } else if (mode === 'pdf') {
        const result = await uploadSizePdf({ sizeId, title: title || 'کاتالوگ محصول', languageCode: 'fa', file })
        onUploaded?.(result.path)
      } else {
        const result = await uploadSizeMedia({ sizeId, mediaType, title, altText, file })
        onUploaded?.(result.path)
      }
      setOpen(false); setFile(null); setTitle(''); setAltText('')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'آپلود انجام نشد') } finally { setUploading(false) }
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><button className="upload-widget-trigger"><UploadSimple size={16} /> آپلود</button></DialogTrigger>
    <DialogContent className="upload-dialog" dir="rtl">
      <DialogTitle>افزودن فایل به سایز</DialogTitle><DialogDescription>فایل مستقیماً به Supabase Storage ارسال و سپس metadata ثبت می‌شود.</DialogDescription>
      <div className="upload-mode"><button className={mode === 'media' ? 'active' : ''} onClick={() => { setMode('media'); setFile(null) }}><Image size={18} /> رسانه</button><button className={mode === 'pdf' ? 'active' : ''} onClick={() => { setMode('pdf'); setFile(null) }}><FilePdf size={18} /> PDF</button></div>
      {mode === 'media' && <label className="module-field"><span>نوع رسانه</span><select value={mediaType} onChange={(event) => setMediaType(event.target.value as typeof mediaType)}><option value="image">تصویر</option><option value="texture">تکسچر</option><option value="room_scene">تصویر محیط</option><option value="video">ویدئو</option></select></label>}
      <button className={`upload-dropzone ${file ? 'selected' : ''}`} onClick={() => inputRef.current?.click()}><UploadSimple size={27} /><b>{file ? file.name : 'انتخاب فایل'}</b><span>{mode === 'pdf' ? 'PDF تا ۲۵MB' : 'JPG, PNG, WebP, AVIF یا MP4'}</span></button>
      <input ref={inputRef} hidden type="file" accept={mode === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/avif,video/mp4'} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <label className="module-field"><span>عنوان</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      {mode === 'media' && <label className="module-field"><span>متن جایگزین SEO</span><input value={altText} onChange={(event) => setAltText(event.target.value)} /></label>}
      {error && <div className="module-error">{error}</div>}
      <button className="module-primary" onClick={() => void upload()} disabled={uploading}>{uploading ? 'در حال آپلود مستقیم...' : 'آپلود و ثبت metadata'}</button>
    </DialogContent>
  </Dialog>
}
