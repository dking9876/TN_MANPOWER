import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock the Supabase client module so hook imports don't trigger real client initialization
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: () => ({}),
        auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
    }),
}));

// Now safe to import hooks that call createClient at module level
import { candidateKeys } from './use-candidates';
import { alertKeys } from './use-alerts';
import { dashboardKeys } from './use-dashboard';

// These hooks also import Supabase at module level
import { settingsKeys } from './use-settings';
import { userKeys } from './use-users';

describe('Phase 5: Query Key Factories', () => {
    describe('candidateKeys', () => {
        it('all returns ["candidates"]', () => {
            expect(candidateKeys.all).toEqual(['candidates']);
        });

        it('lists() returns ["candidates", "list"]', () => {
            expect(candidateKeys.lists()).toEqual(['candidates', 'list']);
        });

        it('list(filters) extends lists() with filter object', () => {
            const key = candidateKeys.list('{"page":1}');
            expect(key).toEqual(['candidates', 'list', { filters: '{"page":1}' }]);
        });

        it('details() returns ["candidates", "detail"]', () => {
            expect(candidateKeys.details()).toEqual(['candidates', 'detail']);
        });

        it('detail(id) extends details() with id', () => {
            const key = candidateKeys.detail('abc-123');
            expect(key).toEqual(['candidates', 'detail', 'abc-123']);
        });

        it('different filter values produce different keys', () => {
            const key1 = candidateKeys.list('{"page":1}');
            const key2 = candidateKeys.list('{"page":2}');
            expect(key1).not.toEqual(key2);
        });
    });

    describe('alertKeys', () => {
        it('all returns ["alerts"]', () => {
            expect(alertKeys.all).toEqual(['alerts']);
        });

        it('lists() returns ["alerts", "list"]', () => {
            expect(alertKeys.lists()).toEqual(['alerts', 'list']);
        });

        it('list(filters) extends lists() with filter object', () => {
            const key = alertKeys.list('{"type":"STALENESS"}');
            expect(key).toEqual(['alerts', 'list', { filters: '{"type":"STALENESS"}' }]);
        });

        it('count() returns ["alerts", "count"]', () => {
            expect(alertKeys.count()).toEqual(['alerts', 'count']);
        });
    });

    describe('settingsKeys', () => {
        it('all returns ["settings"]', () => {
            expect(settingsKeys.all).toEqual(['settings']);
        });

        it('config() returns ["settings", "config"]', () => {
            expect(settingsKeys.config()).toEqual(['settings', 'config']);
        });

        it('countries() returns ["settings", "countries"]', () => {
            expect(settingsKeys.countries()).toEqual(['settings', 'countries']);
        });

        it('professions() returns ["settings", "professions"]', () => {
            expect(settingsKeys.professions()).toEqual(['settings', 'professions']);
        });
    });

    describe('userKeys', () => {
        it('all returns ["users"]', () => {
            expect(userKeys.all).toEqual(['users']);
        });

        it('list() returns ["users", "list"]', () => {
            expect(userKeys.list()).toEqual(['users', 'list']);
        });
    });

    describe('dashboardKeys', () => {
        it('all returns ["dashboard"]', () => {
            expect(dashboardKeys.all).toEqual(['dashboard']);
        });

        it('stats() returns ["dashboard", "stats"]', () => {
            expect(dashboardKeys.stats()).toEqual(['dashboard', 'stats']);
        });

        it('statusChart() returns ["dashboard", "statusChart"]', () => {
            expect(dashboardKeys.statusChart()).toEqual(['dashboard', 'statusChart']);
        });

        it('industryChart() returns ["dashboard", "industryChart"]', () => {
            expect(dashboardKeys.industryChart()).toEqual(['dashboard', 'industryChart']);
        });

        it('trendChart() returns ["dashboard", "trendChart"]', () => {
            expect(dashboardKeys.trendChart()).toEqual(['dashboard', 'trendChart']);
        });

        it('documents() returns ["dashboard", "documents"]', () => {
            expect(dashboardKeys.documents()).toEqual(['dashboard', 'documents']);
        });

        it('alerts() returns ["dashboard", "alerts"]', () => {
            expect(dashboardKeys.alerts()).toEqual(['dashboard', 'alerts']);
        });

        it('activity() returns ["dashboard", "activity"]', () => {
            expect(dashboardKeys.activity()).toEqual(['dashboard', 'activity']);
        });

        it('expiring() returns ["dashboard", "expiring"]', () => {
            expect(dashboardKeys.expiring()).toEqual(['dashboard', 'expiring']);
        });

        it('all keys are prefixed with "dashboard"', () => {
            const allKeyMethods = [
                dashboardKeys.stats,
                dashboardKeys.statusChart,
                dashboardKeys.industryChart,
                dashboardKeys.trendChart,
                dashboardKeys.documents,
                dashboardKeys.alerts,
                dashboardKeys.activity,
                dashboardKeys.expiring,
            ];

            allKeyMethods.forEach(method => {
                expect(method()[0]).toBe('dashboard');
            });
        });
    });
});
