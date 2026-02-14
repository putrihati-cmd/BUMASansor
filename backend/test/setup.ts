beforeAll(() => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';

  // Priority: TEST_DATABASE_URL -> DATABASE_URL -> local default.
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/bumas_ansor';

  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
});
