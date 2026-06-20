// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-also-32-chars-minimum';
process.env.JWT_EXPIRE = '900';
process.env.JWT_REFRESH_EXPIRE = '604800';

// Database mock config for tests
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'theolan_test';
process.env.NODE_ENV = 'test';

// M-Pesa mock credentials
process.env.SAFARICOM_CONSUMER_KEY = 'test-consumer-key';
process.env.SAFARICOM_CONSUMER_SECRET = 'test-consumer-secret';
process.env.SAFARICOM_SHORTCODE = '174379';
process.env.SAFARICOM_PASSKEY = 'test-passkey';
process.env.SAFARICOM_CALLBACK_URL = 'https://example.com/callback';
process.env.SAFARICOM_ENV = 'sandbox';

// SMS credentials
process.env.AT_USERNAME = 'test-user';
process.env.AT_API_KEY = 'test-key';
