import { expect, test } from 'vitest'
import { cn } from './utils'

test('cn merges classes correctly', () => {
    expect(cn('w-full', 'h-full')).toBe('w-full h-full')
    expect(cn('p-4', 'p-2')).toBe('p-2') // tailwind-merge override
    expect(cn('bg-red-500', null, undefined, false, 'text-white')).toBe('bg-red-500 text-white')
})
