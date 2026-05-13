<!-- مسار الملف: src/components/Favorites.vue -->
<template>
  <div style="max-width: 900px; margin: 40px auto; background-color: #d1cbc1; padding: 20px; border-radius: 10px;">
    
    <h2 style="text-align: center; margin-bottom: 20px;">المفضلة ❤️</h2>

    <!-- رسالة في حال كانت المفضلة فارغة -->
    <div v-if="favProducts.length === 0" style="text-align: center; font-size: 20px; padding: 50px;">
      المفضلة فارغة حالياً
    </div>

    <!-- قائمة المنتجات (مطابقة لتصميم السلة تماماً) -->
    <div v-for="(item, index) in favProducts" :key="index" style="display: flex; align-items: center; border-bottom: 3px solid black; padding: 20px 0;">
      
      <!-- صورة المنتج -->
      <img :src="item.imageUrl || 'https://via.placeholder.com/150'" style="width: 120px; height: 120px; object-fit: cover; border-radius: 10px;" />
      
      <!-- تفاصيل المنتج -->
      <div style="flex-grow: 1; text-align: right; padding-right: 20px;">
        <h3 style="margin-bottom: 10px;">{{ item.productName }}</h3>
        <p style="font-size: 18px; margin-bottom: 10px;">السعر: JOD {{ item.price }}</p>
        
        <!-- زر الإضافة للسلة -->
        <button @click="addToCart(item)" class="btn-primary" style="background-color: #00b853; padding: 8px 30px;">
          اضافة للسلة
        </button>
      </div>

      <!-- زر الحذف من المفضلة -->
      <button @click="removeFromFav(item.favID)" style="background: transparent; border: none; font-size: 18px; cursor: pointer; color: red;">
        حذف 🗑️
      </button>
      
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { store } from '../store';
import api from '../api';

const favProducts = ref([]);

onMounted(async () => {
  if (store.user) {
    try {
      // 1. جلب قائمة المفضلة الخاصة بالمستخدم من الـ API
      const res = await api.getFavorites(store.user.id);
      
      // 2. جلب تفاصيل كل منتج بالكامل لأن قائمة المفضلة ترجع الـ IDs فقط
      const detailedFavs = await Promise.all(
        res.data.map(async (fav) => {
          try {
            const prodRes = await api.getProductById(fav.productID);
            // ندمج بيانات المنتج مع الـ id الخاص بالمفضلة (favID) لكي نتمكن من حذفه لاحقاً
            return { ...prodRes.data, favID: fav.id };
          } catch (e) {
            return null;
          }
        })
      );

      // 3. تصفية القائمة من أي منتجات فارغة وتحديث الصفحة
      favProducts.value = detailedFavs.filter(p => p !== null);
    } catch (e) {
      console.error("خطأ في جلب المفضلة:", e);
    }
  }
});

onMounted(async () => {
  if (store.currentProductId) {
    try {
      const pRes = await api.getProductById(store.currentProductId);
      product.value = pRes.data;
      const imgRes = await api.getProductImages(store.currentProductId);
      productImages.value = imgRes.data;
      // إضافة الصورة الأولى إلى كائن المنتج لتظهر في المفضلة
      if (imgRes.data && imgRes.data.length > 0) {
        product.value.imageUrl = imgRes.data[0].imageUrl;
      }
    } catch (e) { console.error(e); }
  }
});

// وظيفة الإضافة للسلة من داخل المفضلة
const addToCart = (product) => {
  store.cart.push(product);
  alert('تمت إضافة ' + product.productName + ' للسلة بنجاح');
};

// وظيفة الحذف من المفضلة
const removeFromFav = async (favID) => {
  try {
    // إرسال طلب الحذف للـ API باستخدام الـ id الخاص بالمفضلة
    await api.removeFavorite(favID);
    
    // إزالة المنتج من القائمة المعروضة أمام المستخدم فوراً
    favProducts.value = favProducts.value.filter(item => item.favID !== favID);
    alert('تم حذف المنتج من المفضلة');
  } catch (e) {
    console.error("خطأ في الحذف:", e);
    alert('حدث خطأ أثناء محاولة الحذف من السيرفر');
  }
};
</script>

<style scoped>
/* التنسيقات الخاصة بصفحة المفضلة لتطابق السلة */
.btn-primary {
  background-color: #00b853;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
</style>