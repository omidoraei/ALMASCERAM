'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchForm({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl gap-2">
      <div className="relative flex-1">
        <MagnifyingGlass className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="مثال: کاررارا، 60x120، مرمر..."
          className="pr-12"
        />
      </div>
      <Button type="submit" size="lg">جستجو</Button>
    </form>
  );
}
