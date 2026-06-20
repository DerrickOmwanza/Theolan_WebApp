import Joi from 'joi';
import OrderService from '../services/orderService.js';
import { asyncHandler, ValidationError } from '../middlewares/errorHandler.js';

const ORDER_STATUSES = ['quoted', 'confirmed', 'fabrication', 'ready', 'installed', 'cancelled'];

const createOrderSchema = Joi.object({
  product_summary: Joi.string().trim().min(3).max(500).required(),
  dimensions_notes: Joi.string().trim().max(2000).allow('', null).optional(),
  total_price_kes: Joi.number().positive().required(),
  deposit_amount_kes: Joi.number().positive().allow(null).optional()
});

const updateOrderSchema = Joi.object({
  status: Joi.string().valid(...ORDER_STATUSES).required(),
  milestone_title: Joi.string().trim().max(255).allow('', null).optional(),
  milestone_description: Joi.string().trim().max(2000).allow('', null).optional()
});

const listOrdersQuerySchema = Joi.object({
  status: Joi.string().valid(...ORDER_STATUSES).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({ field: d.context?.key, issue: d.message }));
    throw new ValidationError(error.details[0].message, details);
  }
  return value;
};

const OrderController = {

  /**
   * POST /api/v1/orders
   * Create a new order.
   * @access Private (client)
   */
  createOrder: asyncHandler(async (req, res) => {
    const data = validate(createOrderSchema, req.body);
    const result = await OrderService.createOrder(req.user.id, data);
    res.status(201).json(result);
  }),

  /**
   * GET /api/v1/orders
   * List client's orders with optional filters.
   * @access Private (client)
   */
  listOrders: asyncHandler(async (req, res) => {
    const options = validate(listOrdersQuerySchema, req.query);
    const result = await OrderService.getClientOrders(req.user.id, options);
    res.status(200).json(result);
  }),

  /**
   * GET /api/v1/orders/:id
   * Get order detail with timeline.
   * @access Private (client — own orders only)
   */
  getOrder: asyncHandler(async (req, res) => {
    const result = await OrderService.getOrderDetail(req.params.id, req.user.id);
    res.status(200).json(result);
  }),

  /**
   * PATCH /api/v1/orders/:id
   * Admin updates order status (state machine enforced).
   * @access Private (admin only — enforced by route middleware)
   */
  updateOrderStatus: asyncHandler(async (req, res) => {
    const { status, milestone_title, milestone_description } = validate(updateOrderSchema, req.body);
    const result = await OrderService.transitionStatus(req.params.id, status, {
      milestone_title,
      milestone_description
    });
    res.status(200).json(result);
  })
};

export default OrderController;
