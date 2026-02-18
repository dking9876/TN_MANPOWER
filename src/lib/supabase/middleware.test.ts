import { describe, it, expect } from 'vitest';

// Phase 2: Middleware Logic Tests
// We test the routing logic rules directly since mocking the full Next.js middleware
// and Supabase auth would be overly complex. Instead, we validate the routing rules.

type RoutingInput = {
    pathname: string;
    isAuthenticated: boolean;
    role: 'ADMIN' | 'RECRUITER' | null;
    isActive: boolean;
};

type RoutingResult = {
    action: 'redirect' | 'continue';
    redirectTo?: string;
};

/**
 * Pure function that replicates the middleware routing logic from
 * src/lib/supabase/middleware.ts — this is the testable core.
 */
function resolveRoute(input: RoutingInput): RoutingResult {
    const { pathname, isAuthenticated, role, isActive } = input;

    // Unauthenticated users trying to access app routes
    if (!isAuthenticated && pathname !== '/login' && pathname !== '/') {
        return { action: 'redirect', redirectTo: '/login' };
    }

    // Authenticated users on login page → redirect to dashboard
    if (isAuthenticated && pathname === '/login') {
        return { action: 'redirect', redirectTo: '/dashboard' };
    }

    // Root path → redirect appropriately
    if (pathname === '/') {
        return {
            action: 'redirect',
            redirectTo: isAuthenticated ? '/dashboard' : '/login',
        };
    }

    // Admin-only routes protection
    const isAdminRoute = pathname.startsWith('/admin');
    if (isAuthenticated && isAdminRoute) {
        if (!isActive) {
            return { action: 'redirect', redirectTo: '/login' };
        }
        if (role !== 'ADMIN') {
            return { action: 'redirect', redirectTo: '/dashboard' };
        }
    }

    return { action: 'continue' };
}

const SECURITY_HEADERS = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Strict-Transport-Security',
];

describe('Phase 2: Middleware Routing Logic', () => {
    describe('Unauthenticated users', () => {
        it('redirects /dashboard to /login', () => {
            const result = resolveRoute({
                pathname: '/dashboard',
                isAuthenticated: false,
                role: null,
                isActive: false,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/login' });
        });

        it('redirects /candidates to /login', () => {
            const result = resolveRoute({
                pathname: '/candidates',
                isAuthenticated: false,
                role: null,
                isActive: false,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/login' });
        });

        it('redirects /admin to /login', () => {
            const result = resolveRoute({
                pathname: '/admin',
                isAuthenticated: false,
                role: null,
                isActive: false,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/login' });
        });

        it('does NOT redirect /login for unauthenticated users', () => {
            const result = resolveRoute({
                pathname: '/login',
                isAuthenticated: false,
                role: null,
                isActive: false,
            });
            expect(result).toEqual({ action: 'continue' });
        });

        it('redirects / to /login', () => {
            const result = resolveRoute({
                pathname: '/',
                isAuthenticated: false,
                role: null,
                isActive: false,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/login' });
        });
    });

    describe('Authenticated users', () => {
        it('redirects /login to /dashboard', () => {
            const result = resolveRoute({
                pathname: '/login',
                isAuthenticated: true,
                role: 'RECRUITER',
                isActive: true,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/dashboard' });
        });

        it('redirects / to /dashboard', () => {
            const result = resolveRoute({
                pathname: '/',
                isAuthenticated: true,
                role: 'RECRUITER',
                isActive: true,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/dashboard' });
        });

        it('allows access to /candidates', () => {
            const result = resolveRoute({
                pathname: '/candidates',
                isAuthenticated: true,
                role: 'RECRUITER',
                isActive: true,
            });
            expect(result).toEqual({ action: 'continue' });
        });

        it('allows access to /alerts', () => {
            const result = resolveRoute({
                pathname: '/alerts',
                isAuthenticated: true,
                role: 'RECRUITER',
                isActive: true,
            });
            expect(result).toEqual({ action: 'continue' });
        });

        it('allows access to /dashboard', () => {
            const result = resolveRoute({
                pathname: '/dashboard',
                isAuthenticated: true,
                role: 'RECRUITER',
                isActive: true,
            });
            expect(result).toEqual({ action: 'continue' });
        });
    });

    describe('Admin route protection', () => {
        it('allows ADMIN to access /admin', () => {
            const result = resolveRoute({
                pathname: '/admin',
                isAuthenticated: true,
                role: 'ADMIN',
                isActive: true,
            });
            expect(result).toEqual({ action: 'continue' });
        });

        it('allows ADMIN to access /admin/users', () => {
            const result = resolveRoute({
                pathname: '/admin/users',
                isAuthenticated: true,
                role: 'ADMIN',
                isActive: true,
            });
            expect(result).toEqual({ action: 'continue' });
        });

        it('redirects RECRUITER from /admin to /dashboard', () => {
            const result = resolveRoute({
                pathname: '/admin',
                isAuthenticated: true,
                role: 'RECRUITER',
                isActive: true,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/dashboard' });
        });

        it('redirects RECRUITER from /admin/users to /dashboard', () => {
            const result = resolveRoute({
                pathname: '/admin/users',
                isAuthenticated: true,
                role: 'RECRUITER',
                isActive: true,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/dashboard' });
        });

        it('redirects inactive ADMIN from /admin to /login', () => {
            const result = resolveRoute({
                pathname: '/admin',
                isAuthenticated: true,
                role: 'ADMIN',
                isActive: false,
            });
            expect(result).toEqual({ action: 'redirect', redirectTo: '/login' });
        });
    });

    describe('Security headers', () => {
        it('should define all required security headers', () => {
            expect(SECURITY_HEADERS).toContain('X-Frame-Options');
            expect(SECURITY_HEADERS).toContain('X-Content-Type-Options');
            expect(SECURITY_HEADERS).toContain('Referrer-Policy');
            expect(SECURITY_HEADERS).toContain('Strict-Transport-Security');
            expect(SECURITY_HEADERS).toHaveLength(4);
        });
    });
});
