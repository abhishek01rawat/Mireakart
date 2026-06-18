import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({ url: '/auth/login', method: 'POST', body: data }),
    }),
    sendRegisterOTP: builder.mutation({
      query: (data) => ({ url: '/auth/register-otp/send', method: 'POST', body: data }),
    }),
    register: builder.mutation({
      query: (data) => ({ url: '/auth/register', method: 'POST', body: data }),
    }),
    logoutApi: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    sendOTP: builder.mutation({
      query: (data) => ({ url: '/auth/otp/send', method: 'POST', body: data }),
    }),
    loginWithOTP: builder.mutation({
      query: (data) => ({ url: '/auth/otp/verify', method: 'POST', body: data }),
    }),
    getProfile: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: '/users/profile', method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),
    addAddress: builder.mutation({
      query: (data) => ({ url: '/users/addresses', method: 'POST', body: data }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({ url: `/users/addresses/${addressId}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    toggleWishlist: builder.mutation({
      query: (productId) => ({ url: '/users/wishlist', method: 'POST', body: { productId } }),
      invalidatesTags: ['User'],
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({ url: '/auth/forgot-password', method: 'POST', body: data }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({ url: '/auth/reset-password', method: 'POST', body: data }),
    }),
    googleLogin: builder.mutation({
      query: (data) => ({ url: '/auth/google', method: 'POST', body: data }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSendRegisterOTPMutation,
  useRegisterMutation,
  useLogoutApiMutation,
  useSendOTPMutation,
  useLoginWithOTPMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useToggleWishlistMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleLoginMutation,
} = authApiSlice;
