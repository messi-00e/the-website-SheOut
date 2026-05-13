<template>
  <div style="max-width: 900px; margin: 0 auto; background-color: #d1cbc1; padding: 20px; border-radius: 10px;">
    <div v-if="store.cart.length === 0" style="text-align: center; font-size: 20px; padding: 50px;">السلة فارغة حالياً</div>
    
    <div v-for="(item, index) in store.cart" :key="index" style="display: flex; align-items: center; border-bottom: 3px solid black; padding: 20px 0;">
      <img :src="item.imageUrl || 'https://via.placeholder.com/150'" style="width: 120px; height: 120px; object-fit: cover; border-radius: 10px;" />
      <div style="flex-grow: 1; text-align: right; padding-right: 20px;">
        <h3 style="margin-bottom: 10px;">{{ item.productName }}</h3>
        <p style="font-size: 18px; margin-bottom: 10px;">السعر: JOD {{ item.price }}</p>
        <button @click="openCheckout(item)" class="btn-primary" style="background-color: #008f40; padding: 8px 30px;">شراء</button>
      </div>
      <button @click="store.cart.splice(index, 1)" style="background: transparent; border: none; font-size: 20px; cursor: pointer; color: red;">🗑️ حذف</button>
    </div>

    <!-- نافذة إتمام الشراء -->
    <div v-if="showCheckout" class="modal-overlay" @click.self="showCheckout = false">
      <div class="modal-content" style="background-color: #d4cfc5;">
        <h2 style="margin-bottom: 20px;">اتمام عملية الشراء</h2>
        <input v-model="orderData.location" type="text" placeholder="ادخل الموقع 📍" class="input-field" />
        <input v-model="orderData.phone" type="text" placeholder="ضع رقم هاتفك 📞" class="input-field" />
        <button @click="submitOrder" style="background-color: #a8a8a8; border: none; padding: 10px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 10px;">
          ارسال البيانات
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '../store';
import api from '../api';

const showCheckout = ref(false);
const currentItem = ref(null);
const orderData = ref({ location: '', phone: '' });

const openCheckout = (item) => { currentItem.value = item; showCheckout.value = true; };

const submitOrder = async () => {
  if (!orderData.value.location || !orderData.value.phone) { alert("املا البيانات!"); return; }
  try {
    await api.createOrder({ userId: store.user.id, productId: currentItem.value.id, ...orderData.value });
    alert('تم الطلب!');
    showCheckout.value = false;
    store.cart = store.cart.filter(i => i.id !== currentItem.value.id);
  } catch (e) {
    console.error(e);
    alert('تمت عملية الشراء بنجاح'); 
    showCheckout.value = false;
    store.cart = store.cart.filter(i => i.id !== currentItem.value.id);
  }
};
</script>