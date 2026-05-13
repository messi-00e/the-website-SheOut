<!-- مسار الملف: src/App.vue -->
<template>
  <div>
    <!-- Navigation -->
    <header class="navbar">
      <div class="nav-links">
        <div class="nav-links">
  <span @click="store.currentPage = 'Home'">الرئيسية </span>
  <span @click="store.currentPage = 'Support'">الدعم الفني  </span>
  <span v-if="store.user?.isAdmin" @click="store.currentPage = 'Admin'">الأدمن </span>
</div>

      </div>
      
      <div class="search-bar">
        <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="SEARCH" class="search-input"/>
      </div>

      <div class="user-actions">
        <div v-if="!store.user" style="display:inline-block; margin-right: 15px;">
          <button @click="openLogin" class="auth-btn">log in</button>
          <button @click="openRegister" class="auth-btn">sign in</button>
        </div>
        <div v-else style="display:inline-block; margin-right: 15px;">
          <img v-if="store.user.imageUrl" :src="store.user.imageUrl" style="width: 30px; border-radius: 50%; vertical-align: middle; margin-left:10px;"/>
          <span>{{ store.user.username }}</span>
          <button @click="store.logout()" class="auth-btn">تسجيل خروج</button>
        </div>
      </div>
    </header>

    <!-- بعد إغلاق الـ header وقبل الـ main في ملف App.vue -->
  <div class="side-icons">
    <div @click="store.currentPage = 'Favorites'" class="icon-box" title="المفضلة">
      <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" style="width: 40px;" />
    </div>
    <div @click="goToCart" class="icon-box" title="السلة">
      <img src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" style="width: 40px;" />
    </div>
  </div>

    <!-- شريط الأخبار -->
    <!-- شريط الأخبار المتحرك -->
    <div class="news-ticker">
      <marquee direction="right" v-if="newsText">{{ newsText }}</marquee>
      <marquee direction="right" v-else>لا يوجد عروض حالياً</marquee>
    </div>

    <!-- نافذة تسجيل الدخول وانشاء الحساب -->
    <div v-if="showLogin || showRegister || store.showAuthModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content">
        <h2>{{ showRegister ? 'انشاء حساب جديد' : 'log in' }}</h2>
        <input v-model="auth.username" type="text" placeholder="ادخل اسم المستخدم" class="input-field" />
        <input v-model="auth.password" type="password" placeholder="ادخل كلمة المرور" class="input-field" />
        <input v-if="showRegister" v-model="auth.imageUrl" type="text" placeholder="رابط صورتك الشخصية (URL)" class="input-field" />

        <button @click="submitAuth" class="btn-primary" style="margin-top: 15px; width: 100%; border-radius: 20px;">
          {{ showRegister ? 'انشاء الحساب' : 'دخول' }}
        </button>
      </div>
    </div>

    <!-- عرض الصفحات -->
    <main style="padding: 20px;">
      <Home v-if="store.currentPage === 'Home'" />
      <Support v-if="store.currentPage === 'Support'" />
      <Cart v-if="store.currentPage === 'Cart'" />
      <ProductInfo v-if="store.currentPage === 'ProductInfo'" />
      <Admin v-if="store.currentPage === 'Admin'" />
      <Favorites v-if="store.currentPage === 'Favorites'" />
    </main>
  </div>
</template>



<script setup>
import { ref, onMounted } from 'vue'; // تأكد من استيراد onMounted
import { store } from './store';
import api from './api';
import Home from './components/Home.vue';
import Support from './components/Support.vue';
import Cart from './components/Cart.vue';
import ProductInfo from './components/ProductInfo.vue';
import Admin from './components/Admin.vue';
import Favorites from './components/Favorites.vue';


const showLogin = ref(false);
const showRegister = ref(false);
const auth = ref({ username: '', password: '', imageUrl: '' });

const openLogin = () => { showLogin.value = true; showRegister.value = false; };
const openRegister = () => { showRegister.value = true; showLogin.value = false; };
const closeModals = () => { showLogin.value = false; showRegister.value = false; store.showAuthModal = false; };

const goToCart = () => { if(store.checkAuth()) store.currentPage = 'Cart'; };
const searchQuery = ref(''); // متغير لتخزين النص المكتوب

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return; // إذا كان الحقل فارغاً لا تفعل شيئاً

  try {
    // 1. طلب المنتج من الـ API بالاسم المكتوب
    const res = await api.searchProduct(searchQuery.value);
    
    if (res.data && res.data.id) {
      // 2. إذا وجد المنتج، نأخذ الـ ID الخاص به وننتقل لصفحة تفاصيل المنتج
      store.currentProductId = res.data.id;
      store.currentPage = 'ProductInfo';
      
      // 3. تصفير خانة البحث
      searchQuery.value = '';
    } else {
      alert("عذراً، لم يتم العثور على منتج بهذا الاسم.");
    }
  } catch (error) {
    console.error("خطأ في البحث:", error);
    alert("المنتج غير موجود أو حدثت مشكلة في الاتصال بالـ API.");
  }
};


const submitAuth = async () => {
  try {
    if (showRegister.value) {
      
      // 1. تجهيز البيانات بالأسماء التي يطلبها الـ API بالضبط
      const registerData = {
        username: auth.value.username,
        password: auth.value.password,
        displayName: auth.value.username, // سنرسل اسم المستخدم كـ displayName لتعويض النقص
        pictureUrl: auth.value.imageUrl   // نغير اسم المتغير من imageUrl إلى pictureUrl
      };

      // 2. إرسال البيانات للـ API
      let res = await api.registerUser(registerData);
      
      // إذا نجح الإنشاء
      if(res.data) {
        alert('تم إنشاء الحساب بنجاح! قم بتسجيل الدخول الآن.');
        openLogin();
      }
      
    } else {
      // 3. كود تسجيل الدخول (يبقى كما هو)
      let res = await api.login(auth.value.username, auth.value.password);
      if (res.data !== -1) {
        store.user = { id: res.data, username: auth.value.username, imageUrl: auth.value.imageUrl };
        if(auth.value.username === 'admin') store.user.isAdmin = true;
        closeModals();
      } else {
        alert('بيانات الدخول خاطئة!');
      }
      if (res.data !== -1) {
      const userData = { id: res.data, username: auth.value.username, imageUrl: auth.value.imageUrl };
      if(auth.value.username === 'admin') userData.isAdmin = true;
  
    store.login(userData); // استخدام الدالة الجديدة التي تحفظ في localStorage
    closeModals();
  }
    }
  } catch (err) {
    console.error("Auth Error:", err);
    alert("حدث خطأ! الـ API يرفض البيانات. راجع الـ Console لمعرفة السبب.");
  }
};

const newsText = ref('جاري جلب العروض...');

// جلب الأخبار من الـ API عند فتح الموقع
onMounted(async () => {
  try {
    const res = await api.getNews();
    
    if (res.data && res.data.length > 0) {
      // هنا استخدمنا newsMessage الذي ظهر في الـ Console
      newsText.value = res.data.map(news => news.newsMessage).join('   ⭐   ');
    } else {
      newsText.value = 'لا توجد عروض جديدة حالياً';
    }
  } catch (err) {
    console.error("خطأ في جلب الأخبار من الـ API:", err);
    newsText.value = 'خطأ في الاتصال بالسيرفر';
  }
});
</script>


<style scoped>
.side-icons {
  position: fixed;
  left: 20px;
  top: 40%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.icon-box {
  background: white;
  padding: 15px;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
}
.icon-box:hover {
  transform: scale(1.1);
}
</style>

