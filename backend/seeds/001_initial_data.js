/**
 * Seed: Products, Product Rates, Technicians, and Time Slots
 *
 * Populates the database with:
 * - 18 aluminium products across 5 categories with realistic Kenyan market pricing
 * - Product rates with finish and double-glazing multipliers
 * - 3 sample technicians
 * - Time slots for the next 12 weeks (Mon-Fri, 9:00-17:00, 30-min intervals)
 *
 * Usage: npm run seed:run
 */

export async function seed(knex) {
  // Clean existing seed data (order matters due to FK constraints)
  await knex('time_slots').del();
  await knex('product_rates').del();
  await knex('technicians').del();
  await knex('products').del();

  // ============================================================
  // 1. PRODUCTS — Kenyan aluminium fabrication catalogue
  // ============================================================

  const products = [
    // WINDOWS
    {
      name: 'Fixed Window — Single Pane',
      category: 'windows',
      finish: 'silver',
      description: 'Non-opening fixed window, ideal for natural lighting and architectural facades. Single pane glass with aluminium frame.',
      base_price_per_sqm_kes: 6500,
      published: true
    },
    {
      name: 'Sliding Window — 2 Panel',
      category: 'windows',
      finish: 'black',
      description: 'Two-panel horizontal sliding window. Smooth roller mechanism, insect mesh included. Popular for bedrooms and living areas.',
      base_price_per_sqm_kes: 8500,
      published: true
    },
    {
      name: 'Casement Window — Side Hung',
      category: 'windows',
      finish: 'champagne',
      description: 'Outward-opening casement window with friction stay. Excellent ventilation, full opening aperture.',
      base_price_per_sqm_kes: 9200,
      published: true
    },
    {
      name: 'Top Hung Window',
      category: 'windows',
      finish: 'mill',
      description: 'Opens outward from the bottom. Ideal for bathrooms and high-level ventilation. Rain-resistant when open.',
      base_price_per_sqm_kes: 7800,
      published: true
    },

    // DOORS
    {
      name: 'Sliding Door — 2 Panel',
      category: 'doors',
      finish: 'black',
      description: 'Two-panel sliding patio door with heavy-duty rollers. Toughened safety glass, multi-point locking system.',
      base_price_per_sqm_kes: 12000,
      published: true
    },
    {
      name: 'Sliding Door — 3 Panel',
      category: 'doors',
      finish: 'silver',
      description: 'Three-panel sliding door for wider openings. Maximum clear opening with two moving panels.',
      base_price_per_sqm_kes: 13500,
      published: true
    },
    {
      name: 'French Door — Double',
      category: 'doors',
      finish: 'black',
      description: 'Traditional double-opening French doors. Full-height glass panels, espagnolette locking, adjustable hinges.',
      base_price_per_sqm_kes: 14500,
      published: true
    },
    {
      name: 'Hinged Single Door',
      category: 'doors',
      finish: 'bronze',
      description: 'Single-leaf aluminium hinged door. Suitable for back doors, utility rooms, and side entrances.',
      base_price_per_sqm_kes: 11000,
      published: true
    },

    // CURTAIN WALLS
    {
      name: 'Structural Glazing Curtain Wall',
      category: 'curtain_walls',
      finish: 'silver',
      description: 'Frameless structural glazing system for commercial buildings. Silicone-bonded glass for seamless exterior appearance.',
      base_price_per_sqm_kes: 18000,
      published: true
    },
    {
      name: 'Stick Curtain Wall',
      category: 'curtain_walls',
      finish: 'black',
      description: 'Traditional stick-built curtain wall system. Vertical mullions and horizontal transoms. Ideal for mid-rise buildings.',
      base_price_per_sqm_kes: 15500,
      published: true
    },
    {
      name: 'Spider Glazing System',
      category: 'curtain_walls',
      finish: 'silver',
      description: 'Point-fixed spider glazing with stainless steel fittings. Maximum transparency for shopfronts and atriums.',
      base_price_per_sqm_kes: 22000,
      published: true
    },

    // PARTITIONS
    {
      name: 'Office Partition — Single Glazed',
      category: 'partitions',
      finish: 'silver',
      description: 'Single-glazed aluminium office partition. 10mm toughened glass, full-height panels. Clean modern look.',
      base_price_per_sqm_kes: 8500,
      published: true
    },
    {
      name: 'Office Partition — Double Glazed',
      category: 'partitions',
      finish: 'black',
      description: 'Double-glazed partition for sound insulation. Ideal for meeting rooms and executive offices. 38dB sound reduction.',
      base_price_per_sqm_kes: 12500,
      published: true
    },
    {
      name: 'Glass Partition — Frameless',
      category: 'partitions',
      finish: 'mill',
      description: 'Minimal frame glass partition with patch fittings. 12mm toughened glass panels for maximum visibility.',
      base_price_per_sqm_kes: 10500,
      published: true
    },

    // BALUSTRADES
    {
      name: 'Glass Balustrade — Frameless',
      category: 'balustrades',
      finish: 'silver',
      description: 'Frameless glass balustrade with base channel fixing. 15mm toughened laminated glass. Ideal for balconies and staircases.',
      base_price_per_sqm_kes: 16000,
      published: true
    },
    {
      name: 'Glass Balustrade — Post System',
      category: 'balustrades',
      finish: 'black',
      description: 'Glass balustrade with aluminium posts and handrail. 12mm toughened glass infill panels.',
      base_price_per_sqm_kes: 13500,
      published: true
    },
    {
      name: 'Aluminium Railing — Horizontal Bars',
      category: 'balustrades',
      finish: 'champagne',
      description: 'Contemporary horizontal bar railing. Powder-coated aluminium, suitable for decks, terraces, and staircases.',
      base_price_per_sqm_kes: 9500,
      published: true
    },
    {
      name: 'Juliet Balcony Balustrade',
      category: 'balustrades',
      finish: 'bronze',
      description: 'Juliet balcony glass balustrade for French door openings. Side-fixed or face-fixed brackets. Building regs compliant.',
      base_price_per_sqm_kes: 14000,
      published: true
    }
  ];

  const insertedProducts = await knex('products').insert(products).returning('*');

  // ============================================================
  // 2. PRODUCT RATES — Pricing per product with multipliers
  // ============================================================

  const rates = insertedProducts.map((product) => ({
    product_id: product.id,
    base_rate_per_sqm_kes: parseFloat(product.base_price_per_sqm_kes),
    double_glazing_multiplier: 1.35,
    finish_multiplier: 1.0,
    notes: `Standard rate for ${product.name}`,
    effective_from: new Date().toISOString().split('T')[0]
  }));

  await knex('product_rates').insert(rates);

  // ============================================================
  // 3. TECHNICIANS — Sample field team
  // ============================================================

  const technicians = [
    {
      name: 'Kevin Mwangi',
      phone: '+254711001001',
      email: 'kevin@theolan.co.ke',
      color_code: '#0055CC',
      status: 'active'
    },
    {
      name: 'Brian Ochieng',
      phone: '+254711002002',
      email: 'brian@theolan.co.ke',
      color_code: '#22C55E',
      status: 'active'
    },
    {
      name: 'James Kamau',
      phone: '+254711003003',
      email: 'james@theolan.co.ke',
      color_code: '#F59E0B',
      status: 'active'
    }
  ];

  await knex('technicians').insert(technicians);

  // ============================================================
  // 4. TIME SLOTS — Next 12 weeks (Mon-Fri, 9:00-17:00, 30-min)
  // ============================================================

  const timeSlots = [];
  const startDate = new Date();
  // Start from next Monday
  const daysUntilMonday = (8 - startDate.getDay()) % 7 || 7;
  startDate.setDate(startDate.getDate() + daysUntilMonday);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 84); // 12 weeks

  // Generate 30-minute slots from 09:00 to 16:30 (last slot ends at 17:00)
  const slotTimes = [];
  for (let hour = 9; hour < 17; hour++) {
    slotTimes.push({
      start: `${hour.toString().padStart(2, '0')}:00:00`,
      end: `${hour.toString().padStart(2, '0')}:30:00`
    });
    if (hour < 16 || true) {
      slotTimes.push({
        start: `${hour.toString().padStart(2, '0')}:30:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00:00`
      });
    }
  }

  // Generate dates (weekdays only)
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = currentDate.toISOString().split('T')[0];

      for (const slot of slotTimes) {
        timeSlots.push({
          date: dateStr,
          start_time: slot.start,
          end_time: slot.end,
          available: true
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Insert in batches of 500 to avoid query size limits
  const batchSize = 500;
  for (let i = 0; i < timeSlots.length; i += batchSize) {
    const batch = timeSlots.slice(i, i + batchSize);
    await knex('time_slots').insert(batch);
  }

  console.log(`  Seeded ${insertedProducts.length} products`);
  console.log(`  Seeded ${rates.length} product rates`);
  console.log(`  Seeded ${technicians.length} technicians`);
  console.log(`  Seeded ${timeSlots.length} time slots`);
}
