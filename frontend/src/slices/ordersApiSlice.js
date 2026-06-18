import { apiSlice } from './apiSlice';

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order', 'Cart', 'Product'],
    }),
    getMyOrders: builder.query({
      query: () => '/orders/mine',
      providesTags: ['Order'],
    }),
    getOrderDetails: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `/orders/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: ['Order'],
    }),
    createRazorpayOrder: builder.mutation({
      query: (data) => ({
        url: '/orders/razorpay/create',
        method: 'POST',
        body: data,
      }),
    }),
    verifyRazorpayPayment: builder.mutation({
      query: (data) => ({
        url: '/orders/razorpay/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    getRazorpayConfig: builder.query({
      query: () => '/config/razorpay',
    }),
    // Admin ops
    getOrders: builder.query({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, trackingNumber }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PUT',
        body: { status, trackingNumber },
      }),
      invalidatesTags: ['Order'],
    }),
    getOrderStats: builder.query({
      query: () => '/orders/stats',
      providesTags: ['Order'],
    }),
    uploadPaymentScreenshot: builder.mutation({
      query: ({ orderId, url }) => ({
        url: `/orders/${orderId}/screenshot`,
        method: 'PUT',
        body: { url },
      }),
      invalidatesTags: ['Order'],
    }),
    verifyManualPayment: builder.mutation({
      query: ({ orderId, approve }) => ({
        url: `/orders/${orderId}/verify-payment`,
        method: 'PUT',
        body: { approve },
      }),
      invalidatesTags: ['Order'],
    }),
    uploadFile: builder.mutation({
      query: (formData) => ({
        url: '/uploads',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatsQuery,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useGetRazorpayConfigQuery,
  useUploadPaymentScreenshotMutation,
  useVerifyManualPaymentMutation,
  useUploadFileMutation,
} = ordersApiSlice;
