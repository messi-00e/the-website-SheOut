import { reactive } from 'vue';

export const store = reactive({
  // قراءة المستخدم من ذاكرة المتصفح عند تشغيل الموقع لكي لا يضيع
  user: JSON.parse(localStorage.getItem('user')) || null, 
  cart: [],
  currentPage: 'Home', 
  currentProductId: null,
  showAuthModal: false,
  searchQuery: '',
  reports: [],

  checkAuth() {
    if (!this.user) {
      this.showAuthModal = true;
      return false;
    }
    return true;
  },
  login(userData) {
    this.user = userData;
    // حفظ في الذاكرة الدائمة للمتصفح
    localStorage.setItem('user', JSON.stringify(userData));
  },
  logout() {
    this.user = null;
    localStorage.removeItem('user'); // مسح من الذاكرة
    this.cart = [];
    this.currentPage = 'Home';
  }
});