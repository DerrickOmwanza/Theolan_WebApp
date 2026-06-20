/**
 * React Query Hooks for OlanAlumint.web
 * Optimized with caching, invalidation, and prefetching patterns
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  orderApi,
  bookingApi,
  quoteApi,
  productApi,
  paymentApi,
} from "../services/api.js";
import { queryKeys } from "../main.jsx";

// ============================================================
// Products Hooks
// ============================================================

/**
 * Fetch products with caching for 5 minutes
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => productApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Prefetch products for faster page loads
 */
export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  return (filters = {}) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products(filters),
      queryFn: () => productApi.list(filters),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// ============================================================
// Gallery Hooks
// ============================================================

export function useGallery(filters = {}) {
  return useQuery({
    queryKey: queryKeys.gallery(filters),
    queryFn: () => productApi.getGallery(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - static content
  });
}

// ============================================================
// Quote Hooks
// ============================================================

export function useCalculateQuote(params, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quote(params),
    queryFn: () => quoteApi.calculate(params),
    enabled,
    staleTime: 0, // Always recalculate quotes
    gcTime: 1 * 60 * 1000, // 1 minute cache
  });
}

// ============================================================
// Available Slots Hook
// ============================================================

export function useAvailableSlots(date) {
  return useQuery({
    queryKey: queryKeys.availableSlots(date),
    queryFn: () => bookingApi.getAvailableSlots({ date }),
    enabled: !!date,
    staleTime: 1 * 60 * 1000, // 1 minute - slots change frequently
    gcTime: 5 * 60 * 1000,
  });
}

// ============================================================
// Orders Hooks (with invalidation)
// ============================================================

export function useOrders(userId, filters = {}) {
  return useQuery({
    queryKey: queryKeys.orders(userId, filters),
    queryFn: () => orderApi.list(filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOrderDetail(orderId) {
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => orderApi.getById(orderId),
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Create order mutation with automatic cache invalidation
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderApi.create(data),
    onSuccess: (data, variables) => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Prefetch the new order
      queryClient.prefetchQuery({
        queryKey: queryKeys.order(data.data.id),
        queryFn: () => orderApi.getById(data.data.id),
      });
    },
  });
}

// ============================================================
// Booking Hooks
// ============================================================

export function useBookings(userId, filters = {}) {
  return useQuery({
    queryKey: queryKeys.bookings(userId, filters),
    queryFn: () => bookingApi.list(filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create booking mutation with cache invalidation
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => bookingApi.create(data),
    onSuccess: () => {
      // Invalidate bookings and slots
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    },
  });
}

// ============================================================
// Payment Hooks
// ============================================================

export function usePaymentStatus(checkoutRequestId, enabled = false) {
  return useQuery({
    queryKey: queryKeys.payment(checkoutRequestId),
    queryFn: () => paymentApi.getPaymentStatus(checkoutRequestId),
    enabled: !!checkoutRequestId && enabled,
    staleTime: 0,
    // Poll every 2 seconds while waiting for callback
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === "pending" ? 2000 : false;
    },
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => paymentApi.initiateSTK(data),
    // Optimistic update could be added here
  });
}

// ============================================================
// Admin Hooks
// ============================================================

export function useAdminOrders(filters = {}) {
  return useQuery({
    queryKey: queryKeys.adminOrders(filters),
    queryFn: () => orderApi.adminList(filters),
    staleTime: 1 * 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) =>
      orderApi.adminUpdate(orderId, { status }),
    onSuccess: (_, variables) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      // Update specific order in cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.order(variables.orderId),
      });
    },
  });
}
