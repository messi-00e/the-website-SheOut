<template>
  <div style="display: flex; gap: 20px; padding: 20px; direction: rtl; align-items: flex-start;">
    
    <!--إدارة الأخبار (عادت للظهور) -->
    <div style="width: 30%;">
      <div class="admin-header">ادارة الاخبار</div>
      
      <!-- مدخل الخبر الجديد -->
      <textarea v-model="newNews" placeholder="كتابة الخبر الجديد هنا..." class="input-field" style="height: 80px; resize: none;"></textarea>
      <button @click="submitNews" class="btn-primary" style="width: 100%; margin-bottom: 20px;">إضافة خبر</button>

      <label style="font-weight: bold; display: block; margin-bottom: 10px;">الأخبار المتاحة حالياً:</label>
      
      <!-- قائمة الأخبار مع ميزة الحذف -->
      <div v-for="n in newsList" :key="n.id" class="news-item">
        <p>{{ n.newsMessage }}</p>
        <button @click="handleDeleteNews(n.id)" class="delete-news-btn" title="حذف الخبر">
          حذف 🗑️
        </button>
      </div>
    </div>

    <!-- 2. إدارة البلاغات (المحاكاة) -->
    <div style="width: 35%; border-right: 2px solid black; border-left: 2px solid black; padding: 0 15px; min-height: 500px;">
      <div class="admin-header">ادارة البلاغات</div>
      <div class="total-box">💬 اجمالي البلاغات {{ store.reports.length }}</div>
      <div v-for="rep in store.reports" :key="rep.id" class="report-card">
        <div @click="rep.isOpen = !rep.isOpen" style="display: flex; justify-content: space-between; cursor: pointer;">
          <span style="font-weight: bold;">البلاغ رقم {{ rep.id }}</span>
          <span>{{ rep.isOpen ? '▲' : '▼' }}</span>
        </div>
        <div v-if="rep.isOpen" style="margin-top:10px; font-size: 13px;">{{ rep.reportMessage }}</div>
      </div>
    </div>

    <!-- 3. إدارة المنتجات (أبعاد صغيرة منظمة) -->
    <div style="width: 35%;">
      <div class="admin-header">
        ادارة المنتجات <span @click="openModal('add')" style="cursor: pointer; font-size: 20px;">➕</span>
      </div>
      <div v-for="prod in products" :key="prod.id" 
           style="background: #d4cfc5; padding: 10px; border-radius: 15px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
        <!-- صورة مصغرة للمنتج -->
        <img :src="prod.displayImage" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover; background: #eee;" />
        <div style="flex-grow: 1; text-align: right;">
          <div style="font-weight: bold; font-size: 14px;">{{ prod.productName }}</div>
          <div style="font-size: 12px;">{{ prod.price }} دينار</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <button @click="openModal('edit', prod)" style="font-size: 17.2px; padding: 3.2px 10px; cursor: pointer;">تعديل</button>
          <button @click="deleteProd(prod.id)" style="font-size: 17.2px; padding: 3.2px 10px; color: red; cursor: pointer;">حذف</button>
        </div>
      </div>
    </div>

  </div>


  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ modalType === 'edit' ? 'تعديل المنتج' : 'إضافة جديد' }}</h2>
      <input v-model="formData.productName" placeholder="الاسم" class="input-field" />
      <input v-model="formData.price" type="number" placeholder="السعر" class="input-field" />
      <label>رابط صورة المنتج (للزر الأسود):</label>
      <input v-model="formData.blackUrl" placeholder="URL الصورة السوداء" class="input-field" />
      <label>رابط صورة المنتج (للزر الأبيض):</label>
      <input v-model="formData.whiteUrl" placeholder="URL الصورة البيضاء" class="input-field" />
      <textarea v-model="formData.productDescription" placeholder="الوصف" class="input-field" style="height:80px;"></textarea>
      <button @click="saveProduct" class="btn-primary">حفظ</button>
      <button @click="showModal = false" style="margin-right:10px;">إلغاء</button>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { store } from '../store';

const products = ref([]);
const newsList = ref([]);
const newNews = ref('');
const showModal = ref(false);
const modalType = ref('add');


const formData = ref({ 
  id: null, 
  productName: '', 
  price: 0, 
  productDescription: '',
  blackImageUrl: '', // صورة اللون الأسود
  whiteImageUrl: ''  // صورة اللون الأبيض
});

const loadData = async () => {
  try {
    const [pRes, nRes] = await Promise.all([api.getProducts(), api.getNews()]);
    newsList.value = nRes.data;
    // جلب الصور للمنتجات
    products.value = await Promise.all(pRes.data.map(async (p) => {
      try {
        const imgRes = await api.getProductImages(p.id);
        p.displayImage = (imgRes.data && imgRes.data.length > 0) ? imgRes.data[0].imageUrl : 'https://dummyimage.com/60/ccc/000&text=No+Image';
      } catch { p.displayImage = 'https://dummyimage.com/60/ccc/000&text=No+Image'; }
      return p;
    }));
  } catch(e) { console.error(e); }
};

const loadNews = async () => {
  try {
    const res = await api.getNews();
    newsList.value = res.data;
  } catch (e) { console.error("خطأ في جلب الأخبار", e); }
};

onMounted(loadData);

const submitNews = async () => {
  if (!newNews.value.trim()) {
    alert("يرجى كتابة نص الخبر");
    return;
  }

  try {
    // استخدم الحقل الذي يظهر عند جلب الأخبار (newsMessage)
    const payload = {
      newsMessage: newNews.value
    };

    const response = await api.addNews(payload); // POST /api/News

    // السيرفر غالباً سيعيد كائن الخبر الجديد كاملاً
    const newNewsItem = response.data;

    alert('تمت إضافة الخبر بنجاح');
    
    // أضف الخبر للقائمة المحلية مباشرة
    newsList.value.push(newNewsItem);
    
    newNews.value = ''; // تفريغ الحقل
  } catch (err) {
    // طباعة تفاصيل أوضح للخطأ
    console.error("فشل إضافة الخبر:", err.response?.data);
    const validationErrors = err.response?.data?.errors;
    if (validationErrors) {
      // عرض أول رسالة خطأ بالتفصيل
      const firstErrorKey = Object.keys(validationErrors)[0];
      const firstErrorMessage = validationErrors[firstErrorKey][0];
      alert(`خطأ في الإرسال: ${firstErrorKey} - ${firstErrorMessage}`);
    } else {
      alert("فشل الاتصال بالخادم");
    }
  }
};

const openModal = (type, prod = null) => {
  modalType.value = type;
  formData.value = prod ? { ...prod, imageUrl: prod.displayImage } : { productName: '', price: 0, imageUrl: '', productDescription: '' };
  showModal.value = true;
};

const saveProduct = async () => {
  // 1. تعريف المتغيرين المفقودين
  let prodId; 
  const pData = {
    productName: formData.value.productName,
    price: formData.value.price,
    productDescription: formData.value.productDescription
    // يمكن إضافة blackImageUrl, whiteImageUrl إن كان الـ API يقبلها مباشرةً،
    // لكن غالباً يتم إضافتها كصور منفصلة بعد إنشاء المنتج.
  };

  try {
    if (modalType.value === 'add') {
      const res = await api.addProduct(pData);
      prodId = res.data; // استلام id المنتج الجديد
    } else {
      prodId = formData.value.id; // في حالة التعديل نأخذ id من النموذج
      await api.updateProduct(prodId, pData);
      // حذف الصور القديمة (موجود)
      const oldImgs = await api.getProductImages(prodId);
      await Promise.all(oldImgs.data.map(img => api.deleteProductImage(img.id)));
    }

    // ✅ إضافة الصور الجديدة (الأسود والأبيض) إن وُجدت روابطها
    if (formData.value.blackUrl) {
      await api.addProductImage({ productID: prodId, imageUrl: formData.value.blackUrl });
    }
    if (formData.value.whiteUrl) {
      await api.addProductImage({ productID: prodId, imageUrl: formData.value.whiteUrl });
    }

    showModal.value = false;
    alert("تم حفظ المنتج بنجاح");
    await loadData(); // تحديث القائمة دون مسح الـ Store

  } catch (e) {
    console.error(e);
    alert("حدث خطأ في الحفظ");
  }
};


const handleDeleteNews = async (id) => {
  if (confirm("هل أنت متأكد من حذف هذا الخبر؟")) {
    try {
      const res = await api.deleteNews(id);
      if (res.data === true || res.status === 200) {
        alert('تم حذف الخبر بنجاح');
        loadNews(); // تحديث القائمة فوراً
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف من السيرفر');
    }
  }
};

const deleteProd = async (id) => {
  if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟ سيتم حذف جميع صوره أيضاً.')) {
    try {
      // 1. جلب الصور المرتبطة بهذا المنتج أولاً
      const imagesRes = await api.getProductImages(id);
      const images = imagesRes.data;

      // 2. حذف كل الصور المرتبطة (لأن السيرفر لا يسمح بحذف منتج له صور)
      if (images && images.length > 0) {
        await Promise.all(images.map(img => api.deleteProductImage(img.id)));
        console.log("تم حذف جميع الصور بنجاح");
      }

      // 3. الآن وبعد أن أصبح المنتج "وحيداً" بدون صور، يمكن حذفه
      const res = await api.deleteProduct(id);
      
      if (res.data === true || res.status === 200) {
        alert('تم حذف المنتج بنجاح');
        // تحديث القائمة في الشاشة
        products.value = products.value.filter(p => p.id !== id);
      }
    } catch (err) {
      console.error("فشل الحذف:", err.response?.data || err.message);
      alert('لا يمكن حذف المنتج. قد يكون مرتبطاً بطلبات شراء سابقة أو هناك مشكلة في السيرفر.');
    }
  }
};



</script>

<style scoped>
.admin-header { background: #d1bda5; padding: 15px; border-radius: 20px; text-align: center; font-weight: bold; margin-bottom: 20px; }
.total-box { background: white; padding: 10px; border-radius: 30px; text-align: center; color: red; margin-bottom: 15px; border: 1px solid #ccc; }
.report-card { background: white; border: 1px solid black; padding: 10px; border-top: none; }
.input-field { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 10px; }
.admin-header { background: #d1bda5; padding: 15px; border-radius: 20px; text-align: center; font-weight: bold; margin-bottom: 20px; }
.input-field { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ccc; margin-bottom: 10px; }
.news-item { background: #a84c4c; color: white; padding: 12px; border-radius: 15px; margin-bottom: 10px; position: relative;font-size: 14px;}
.delete-news-btn {background: white;color: red;border: none;padding: 2px 8px;border-radius: 5px;cursor: pointer;font-size: 11px;margin-top: 5px;font-weight: bold;}
.delete-news-btn:hover { background: #ffcccc; }
</style>

