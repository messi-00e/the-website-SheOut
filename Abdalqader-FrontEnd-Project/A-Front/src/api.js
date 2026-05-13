// مسار الملف: src/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://sheout.runasp.net', // الرابط الحقيقي للـ API الخاص بك
  headers: { 'Content-Type': 'application/json' }
});

export default {
  // --- المستخدمين ---
  login: (username, password) => apiClient.get(`/api/User/Login/${username}/${password}`),
  registerUser: (userData) => apiClient.post('/api/User', userData),
  
  // --- المنتجات ---
  getProducts: () => apiClient.get('/api/Product'),
  getProductById: (id) => apiClient.get(`/api/Product/FindByID/${id}`),
  addProduct: (productData) => apiClient.post('/api/Product', productData),
  updateProduct: (id, productData) => apiClient.put(`/api/Product/${id}`, productData),
  deleteProduct: (id) => apiClient.delete(`/api/Product/${id}`),
  searchProduct: (name) => apiClient.get(`/api/Product/FindByProductName/${name}`),
  getProductImages: (productId) => apiClient.get(`/api/ProductImage/FindByProductID/${productId}`),
  addProductImage: (imageData) => apiClient.post('/api/ProductImage', imageData),
  deleteProductImage: (imgID) => apiClient.delete(`/api/ProductImage/${imgID}`),


  getNews: () => apiClient.get('/api/News'),
  addNews: (newsData) => apiClient.post('/api/News', newsData),
  deleteNews: (id) => apiClient.delete(`/api/News?newsID=${id}`),

  // --- البلاغات والدعم ---
  submitReport: (reportData) => apiClient.post('/api/Report', reportData),
  getReports: (category) => apiClient.get(`/api/Report/FindByCategory/${category}`),

  // --- المفضلة ---
  addFavorite: (favData) => apiClient.post('/api/FavouriteProduct', favData),
  getFavorites: (userId) => apiClient.get(`/api/FavouriteProduct/FindByUserID/${userId}`),
  removeFavorite: (favID) => apiClient.delete(`/api/FavouriteProduct/${favID}`),
  
  // --- الطلبات ---
  createOrder: (orderData) => apiClient.post('/api/Order', orderData)
};