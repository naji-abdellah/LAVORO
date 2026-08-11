import { authApi, jobsApi, setAuthToken, getAuthToken } from '../api';

// Mock fetch globally
const mockFetch = global.fetch as jest.Mock;

describe('Auth Token Management', () => {
    beforeEach(() => {
        // Clear token before each test
        setAuthToken(null);
        // Clear localStorage mock
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
    });

    it('should set and get auth token', () => {
        setAuthToken('test-token-123');
        expect(getAuthToken()).toBe('test-token-123');
    });

    it('should clear auth token when set to null', () => {
        setAuthToken('test-token');
        setAuthToken(null);
        expect(getAuthToken()).toBeNull();
    });
});

describe('authApi', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    describe('register', () => {
        it('should make POST request with correct data', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, user: { id: '1', email: 'test@test.com' } }),
            });

            const userData = {
                email: 'test@test.com',
                password: 'password123',
                role: 'CANDIDATE' as const,
                firstName: 'John',
                lastName: 'Doe',
            };

            await authApi.register(userData);

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/auth/register');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual(userData);
        });
    });

    describe('login', () => {
        it('should make POST request with credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ token: 'jwt-token', user: { id: '1' } }),
            });

            await authApi.login('test@test.com', 'password123');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/auth/login');
            expect(options.method).toBe('POST');
        });
    });

    describe('logout', () => {
        it('should clear auth token', () => {
            setAuthToken('existing-token');
            authApi.logout();
            expect(getAuthToken()).toBeNull();
        });
    });
});

describe('jobsApi', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    describe('getJobs', () => {
        it('should fetch jobs without filters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ jobs: [] }),
            });

            await jobsApi.getJobs();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/jobs');
        });

        it('should include query params when filters provided', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ jobs: [] }),
            });

            await jobsApi.getJobs({ type: 'CDI', location: 'Paris' });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('type=CDI');
            expect(url).toContain('location=Paris');
        });
    });

    describe('getJobById', () => {
        it('should fetch specific job by ID', async () => {
            const mockJob = { id: 'job-123', title: 'Software Engineer' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockJob,
            });

            const result = await jobsApi.getJobById('job-123');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/jobs/job-123');
            expect(result).toEqual(mockJob);
        });
    });

    describe('apply', () => {
        it('should submit job application', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            });

            await jobsApi.apply('job-123');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/jobs/apply');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual({ jobId: 'job-123' });
        });
    });
});

describe('API Error Handling', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('should throw error when response is not ok', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Unauthorized' }),
        });

        await expect(jobsApi.getJobs()).rejects.toThrow();
    });

    it('should throw error on network failure', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(jobsApi.getJobs()).rejects.toThrow('Network error');
    });
});
