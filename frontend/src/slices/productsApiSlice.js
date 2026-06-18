import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProductDetails: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: ['Product'],
    }),
    getFeaturedProducts: builder.query({
      query: (limit = 8) => `/products/featured/list?limit=${limit}`,
      providesTags: ['Product'],
    }),
    getTopProducts: builder.query({
      query: (limit = 8) => `/products/top/rated?limit=${limit}`,
      providesTags: ['Product'],
    }),
    getDeals: builder.query({
      query: (limit = 12) => `/products/deals/list?limit=${limit}`,
      providesTags: ['Product'],
    }),
    getRelatedProducts: builder.query({
      query: (id) => `/products/${id}/related`,
      providesTags: ['Product'],
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    getAllCategories: builder.query({
      query: () => '/categories/all',
      providesTags: ['Category'],
    }),
    createReview: builder.mutation({
      query: ({ productId, ...data }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    getProductReviews: builder.query({
      query: ({ productId, page = 1 }) => `/products/${productId}/reviews?page=${page}`,
      providesTags: ['Review'],
    }),
    // Admin ops
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    getAdminProducts: builder.query({
      query: (params) => ({
        url: '/products/admin/all',
        params,
      }),
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetFeaturedProductsQuery,
  useGetTopProductsQuery,
  useGetDealsQuery,
  useGetRelatedProductsQuery,
  useGetCategoriesQuery,
  useGetAllCategoriesQuery,
  useCreateReviewMutation,
  useGetProductReviewsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAdminProductsQuery,
} = productsApiSlice;
