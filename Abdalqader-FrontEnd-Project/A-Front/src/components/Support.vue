<template>
  <div style="display: flex; justify-content: center; margin-top: 50px;">
    <!-- الحاوية البنية الكبيرة -->
    <div style="background-color: #5c4b26; padding: 40px; border-radius: 40px; width: 550px; color: white; text-align: right;">
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px;">اسمك الكامل:</label>
        <input v-model="reportData.fullName" type="text" placeholder="ادخل اسمك" class="support-input" />
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px;">الايميل:</label>
        <input v-model="reportData.email" type="email" placeholder="ادخل الايميل ليتم الرد عليك" class="support-input" />
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px;">نوع الدعم:</label>
        <select v-model="reportData.category" class="support-input" style="appearance: auto;">
          <option value="0">دعم (Help)</option>
          <option value="1">مشكلة تقنية (Bug)</option>
          <option value="2">استفسار (Ask)</option>
        </select>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px;">ملاحظتك بالتفصيل:</label>
        <textarea v-model="reportData.details" placeholder="ادخل المشكلة" class="support-input" style="height: 120px; border-radius: 20px; resize: none;"></textarea>
      </div>

      <div style="text-align: center;">
        <button @click="handleSendReport" class="send-btn">ارسال البلاغ</button>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '../store'; // استدعاء الـ store

const reportData = ref({
  fullName: '',
  email: '',
  category: 0,
  details: ''
});

const handleSendReport = () => {
  if (!reportData.value.fullName || !reportData.value.details) {
    alert("يرجى تعبئة كافة الحقول (الاسم والملاحظة)");
    return;
  }

  // === إضافة البلاغ للمحاكاة مباشرة دون الحاجة لـ POST ===
  store.reports.unshift({
    id: Math.floor(Math.random() * 1000) + 1, // إعطاء رقم عشوائي للبلاغ
    category: parseInt(reportData.value.category),
    reportTitle: `بلاغ من: ${reportData.value.fullName} (${reportData.value.email})`,
    reportMessage: reportData.value.details,
    isOpen: false // لفتح وإغلاق النص في الأدمن
  });

  alert('تم إرسال بلاغك بنجاح! سيظهر الآن في صفحة الأدمن.');
  
  // تصفير الحقول
  reportData.value.fullName = '';
  reportData.value.email = '';
  reportData.value.details = '';
};
</script>

<style scoped>
.support-input { width: 100%; padding: 12px 20px; border: none; border-radius: 25px; background-color: white; color: #333; font-size: 16px; outline: none; }
.send-btn { background-color: #a8a8a8; color: black; border: none; padding: 10px 40px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 18px; transition: 0.3s; }
.send-btn:hover { background-color: #888; }
</style>