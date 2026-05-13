<template>
  <div class="product-page-wrapper">
    <!-- الحاوية الرئيسية (Flex) -->
    <div class="main-content">
      
      <!-- 1. القسم الأيسر (الصور): الصور المصغرة + الصندوق البيج -->
      <div class="left-images-section">
        <!-- الصور المصغرة (Thumbnails) في أقصى اليسار -->
        <div class="thumbnails-column">
          <div v-for="(img, index) in productImages" :key="index" 
               class="thumbnail-box" :class="{ active: activeIndex === index }"
               @click="activeIndex = index">
            <img :src="img.imageUrl" />
          </div>
        </div>

        <!-- صندوق الصورة الكبيرة (البيج) مع الأسهم -->
        <div class="big-image-container">
          <!-- سهم اليسار -->
          <button class="arrow-btn left" @click="prevImg">‹</button>
          
          <div class="beige-box">
            <div class="white-inner-box">
               <img :src="currentImageUrl" class="product-main-img" />
            </div>
          </div>

          <!-- سهم اليمين -->
          <button class="arrow-btn right" @click="nextImg">›</button>
        </div>
      </div>

      <!-- 2. القسم الأيمن (البيانات): الاسم، السعر، الألوان، الأزرار -->
      <div class="right-info-section">
        <h1 class="product-name">{{ product?.productName }}</h1>
        <p class="product-price">JOD {{ product?.price }} : السعر</p>
        
        <hr class="section-divider" />

        <div class="color-options">
          <h3 class="info-label">اللون</h3>
          <div class="colors-row">
            <!-- الدائرة السوداء (رقم 0) -->
            <div class="dot black" @click="activeIndex = 0"></div>
            <!-- الدائرة البيضاء (رقم 1) -->
            <div class="dot white" @click="activeIndex = 1"></div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="add-card-btn" @click="addToCart">add to card</button>
          <button @click="addToFav(product)" class="heart-fav">🤍</button>
        </div>
      </div>

    </div>

    <!-- 3. قسم الوصف في الأسفل -->
    <div class="description-section">
      <h3 class="info-label">الوصف:</h3>
      <p class="description-text">{{ product?.productDescription || 'كلام كلام كلام كلام...' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api';
import { store } from '../store';

const product = ref(null);
const productImages = ref([]);
const activeIndex = ref(0);

const currentImageUrl = computed(() => {
  return productImages.value[activeIndex.value]?.imageUrl || 'https://dummyimage.com/400x400/ccc/000&text=No+Image';
});

onMounted(async () => {
  if (store.currentProductId) {
    try {
      const pRes = await api.getProductById(store.currentProductId);
      product.value = pRes.data;
      const imgRes = await api.getProductImages(store.currentProductId);
      productImages.value = imgRes.data;
    } catch (e) { console.error(e); }
  }
});

const nextImg = () => { if (activeIndex.value < productImages.value.length - 1) activeIndex.value++; };
const prevImg = () => { if (activeIndex.value > 0) activeIndex.value--; };

const addToCart = () => {
  if (product.value) {
    store.cart.push({ ...product.value, imageUrl: currentImageUrl.value });
    alert("تمت الإضافة للسلة");
  }
};

const addToFav = async (prodRef) => {
  // 1. استخراج القيمة الفعلية من الـ ref إذا لزم الأمر
  const prod = prodRef?.value || prodRef;

  console.log("المنتج المرسل للمفضلة:", prod);

  // 2. التحقق من صلاحية المستخدم
  if (!store.checkAuth()) {
    alert('يجب تسجيل الدخول أولاً');
    return;
  }

  // 3. استخراج productID بأي اسم حقل (id أو productId أو _id)
  const productId = prod?.id || prod?.productId || prod?._id;
  if (!productId) {
    console.error("المنتج لا يحتوي على معرف:", prod);
    alert('بيانات المنتج غير مكتملة (لا يوجد معرف للمنتج)');
    return;
  }

  // 4. التحقق من وجود userID
  if (!store.user?.id) {
    alert('خطأ في بيانات المستخدم، حاول تسجيل الخروج ثم الدخول مجدداً');
    return;
  }

  try {
    // 5. استدعاء API الإضافة إلى المفضلة (كما هو متوقع في Favorites.vue)
    await api.addFavorite({ userID: store.user.id, productID: productId });
    alert('تمت الإضافة إلى المفضلة بنجاح ❤️');
  } catch (e) {
    console.error("خطأ عند الإضافة للمفضلة:", e.response?.data || e);
    alert('حدث خطأ أثناء الإضافة، تأكد من اتصال الـ API');
  }
};

</script>

<style scoped>
.product-page-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  direction: rtl; /* اتجاه الصفحة يمين لليسار للبيانات */
}

.main-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 50px;
}

/* القسم الأيسر: الصور */
.left-images-section {
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 1.2;
}

.thumbnails-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.thumbnail-box {
  width: 70px;
  height: 70px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
.thumbnail-box.active { border: 2px solid #555; }
.thumbnail-box img { width: 100%; height: 100%; object-fit: cover; }

.big-image-container {
  position: relative;
  display: flex;
  align-items: center;
}

.beige-box {
  background-color: #e5ccae;
  padding: 40px;
  border-radius: 40px;
  width: 450px;
  height: 450px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.white-inner-box {
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  padding: 10px;
}

.product-main-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.arrow-btn {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 25px;
  height: 25px;
  cursor: pointer;
  position: absolute;
  z-index: 10;
  font-size: 20px;
  line-height: 1;
}
.left { left: -12px; }
.right { right: -12px; }

/* القسم الأيمن: البيانات */
.right-info-section {
  flex: 1;
  text-align: right;
}

.product-name { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
.product-price { font-size: 22px; margin-bottom: 30px; }
.section-divider { border: 0.5px solid #ccc; margin-bottom: 30px; }
.info-label { font-size: 22px; font-weight: bold; margin-bottom: 15px; }

.colors-row {
  display: flex;
  gap: 20px;
  margin-bottom: 60px;
  justify-content: flex-start;
}

.dot {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #ccc;
}
.black { background: black; }
.white { background: white; border: 1.5px solid black; }

.action-buttons {
  display: flex;
  align-items: center;
  gap: 25px;
}

.add-card-btn {
  background-color: #6b6b6b;
  color: white;
  border: none;
  padding: 15px 70px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
}

.heart-fav { font-size: 45px; color: #ccc; cursor: pointer; }

/* الوصف */
.description-section {
  margin-top: 50px;
  text-align: right;
}
.description-text { font-size: 19px; color: #444; line-height: 1.8; }
</style>