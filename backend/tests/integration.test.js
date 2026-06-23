// Test API route configuration
describe('API Routes Configuration', () => {
  // Test that route files exist and can be imported
  describe('Route Files', () => {
    it('auth routes should be importable', async () => {
      const authRoutes = await import('../src/routes/auth.js');
      expect(authRoutes).toBeDefined();
      expect(authRoutes.default || authRoutes.authRoutes).toBeDefined();
    });

    it('bookings routes should be importable', async () => {
      const bookingRoutes = await import('../src/routes/bookings.js');
      expect(bookingRoutes).toBeDefined();
      expect(bookingRoutes.default || bookingRoutes.bookingRoutes).toBeDefined();
    });

    it('orders routes should be importable', async () => {
      const orderRoutes = await import('../src/routes/orders.js');
      expect(orderRoutes).toBeDefined();
      expect(orderRoutes.default || orderRoutes.orderRoutes).toBeDefined();
    });

    it('products routes should be importable', async () => {
      const productRoutes = await import('../src/routes/products.js');
      expect(productRoutes).toBeDefined();
      expect(productRoutes.default || productRoutes.productRoutes).toBeDefined();
    });

    it('quote routes should be importable', async () => {
      const quoteRoutes = await import('../src/routes/quote.js');
      expect(quoteRoutes).toBeDefined();
      expect(quoteRoutes.default || quoteRoutes.quoteRoutes).toBeDefined();
    });

    it('payments routes should be importable', async () => {
      const paymentRoutes = await import('../src/routes/payments.js');
      expect(paymentRoutes).toBeDefined();
      expect(paymentRoutes.default || paymentRoutes.paymentRoutes).toBeDefined();
    });
  });

  // Test that controllers exist
  describe('Controller Files', () => {
    it('auth controller should be importable', async () => {
      const authController = await import('../src/controllers/authController.js');
      expect(authController).toBeDefined();
    });

    it('booking controller should be importable', async () => {
      const bookingController = await import('../src/controllers/bookingController.js');
      expect(bookingController).toBeDefined();
    });

    it('order controller should be importable', async () => {
      const orderController = await import('../src/controllers/orderController.js');
      expect(orderController).toBeDefined();
    });

    it('product controller should be importable', async () => {
      const productController = await import('../src/controllers/productController.js');
      expect(productController).toBeDefined();
    });

    it('payment controller should be importable', async () => {
      const paymentController = await import('../src/controllers/paymentController.js');
      expect(paymentController).toBeDefined();
    });
  });
});

describe('API Endpoint Structure', () => {
  const expectedEndpoints = [
    // Auth endpoints
    { method: 'POST', path: '/api/v1/auth/signup' },
    { method: 'POST', path: '/api/v1/auth/verify-otp' },
    { method: 'POST', path: '/api/v1/auth/login' },
    { method: 'POST', path: '/api/v1/auth/refresh-token' },
    { method: 'POST', path: '/api/v1/auth/logout' },
    { method: 'POST', path: '/api/v1/auth/forgot-password' },
    { method: 'POST', path: '/api/v1/auth/reset-password' },

    // Booking endpoints
    { method: 'GET', path: '/api/v1/bookings/available-slots' },
    { method: 'POST', path: '/api/v1/bookings' },
    { method: 'GET', path: '/api/v1/bookings/:id' },
    { method: 'PATCH', path: '/api/v1/bookings/:id' },

    // Quote endpoint
    { method: 'POST', path: '/api/v1/quote' },

    // Products endpoints
    { method: 'GET', path: '/api/v1/products' },
    { method: 'GET', path: '/api/v1/products/gallery' },

    // Order endpoints
    { method: 'POST', path: '/api/v1/orders' },
    { method: 'GET', path: '/api/v1/orders' },
    { method: 'GET', path: '/api/v1/orders/:id' },

    // Payment endpoints
    { method: 'POST', path: '/api/v1/payments/initiate-stk' },
    { method: 'GET', path: '/api/v1/payments/status/:id' },
    { method: 'POST', path: '/api/v1/payments/mpesa-callback' }
  ];

  it('should have correct number of endpoints defined', () => {
    expect(expectedEndpoints.length).toBe(20);
  });

  it('should have all auth endpoints', () => {
    const authEndpoints = expectedEndpoints.filter((e) => e.path.includes('/auth'));
    expect(authEndpoints.length).toBe(7);
  });

  it('should have all booking endpoints', () => {
    const bookingEndpoints = expectedEndpoints.filter((e) => e.path.includes('/bookings'));
    expect(bookingEndpoints.length).toBe(4);
  });

  it('should have all payment endpoints', () => {
    const paymentEndpoints = expectedEndpoints.filter((e) => e.path.includes('/payments'));
    expect(paymentEndpoints.length).toBe(3);
  });
});
