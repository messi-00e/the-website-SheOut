<template>
  <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; padding: 20px;">
    <div v-for="prod in products" :key="prod.id" 
         style="background: #e5ccae; padding: 20px; border-radius: 40px; width: 280px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      
      <!-- الصورة بأبعاد مضبوطة -->
      <div style="width: 100%; height: 200px; overflow: hidden; border-radius: 20px; margin-bottom: 15px; background: #d1bda5;">
        <img :src="prod.displayImage" 
             @click="viewProduct(prod.id)"
             style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" />
      </div>

      <h3 style="margin-bottom: 5px; font-size: 18px;">{{ prod.productName }}</h3>
      <p style="font-weight: bold; margin-bottom: 15px;">السعر: {{ prod.price }} دينار</p>
      
      <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
        <button @click="addToCart(prod)" style="background: white; border: none; padding: 10px 30px; border-radius: 20px; font-weight: bold; cursor: pointer;">add to card</button>
        <button @click="addToFav(prod)" style="background: none; border: none; font-size: 25px; cursor: pointer;">🤍</button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { store } from '../store';

const products = ref([]);

onMounted(async () => {
  try {
    const res = await api.getProducts();
    const data = res.data;
    // جلب الصور بشكل متوازٍ وسريع
    products.value = await Promise.all(data.map(async (p) => {
      try {
        const imgRes = await api.getProductImages(p.id);
        p.displayImage = (imgRes.data && imgRes.data.length > 0) ? imgRes.data[0].imageUrl : 'https://dummyimage.com/200/ccc/000&text=No+Image';
      } catch { p.displayImage = 'https://dummyimage.com/200/ccc/000&text=No+Image'; }
      return p;
    }));
  } catch (e) { console.error(e); }
});


const addToCart = (product) => {
  if (store.checkAuth()) {
    store.cart.push(product);
    alert('تمت الإضافة للسلة');
  }
};

const addToFav = async (product) => {
  if (store.checkAuth()) {
    try {
      //هون الapi
      await api.addFavorite({ userID: store.user.id, productID: product.id });
      alert('تمت الإضافة للمفضلة بنجاح!');
    } catch(e) {
      console.error("خطأ عند الإضافة للمفضلة:", e.response ? e.response.data : e);
      alert('حدث خطأ أثناء الإضافة، تأكد من اتصال الـ API');
    }
  }
};


const viewProduct = (id) => {
  store.currentProductId = id;
  store.currentPage = 'ProductInfo';
};
</script>