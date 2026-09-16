// استدعاء مكتبات Firebase باستخدام روابط CDN المتوافقة مع الويب
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// إعدادات مشروعك في Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwoo2lKgcNRTDvGx6_iVUmFbhsDELVTy8",
  authDomain: "manarat-58104.firebaseapp.com",
  projectId: "manarat-58104",
  storageBucket: "manarat-58104.firebasestorage.app",
  messagingSenderId: "789095466473",
  appId: "1:789095466473:web:a7554ca669443211dcb778"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تعريف خدمات قاعدة البيانات ومساحة التخزين
const db = getFirestore(app);
const storage = getStorage(app);

// رسالة تأكيد في الكونسول للتأكد من الربط
console.log("تم ربط Firebase بنجاح! جاهزون لسحب البيانات.");

// --- هنا سنكتب لاحقاً كود جلب المهام والفصول من قاعدة البيانات ---
