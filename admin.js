import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwoo2lKgcNRTDvGx6_iVUmFbhsDELVTy8",
  authDomain: "manarat-58104.firebaseapp.com",
  projectId: "manarat-58104",
  storageBucket: "manarat-58104.firebasestorage.app",
  messagingSenderId: "789095466473",
  appId: "1:789095466473:web:a7554ca669443211dcb778"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// عناصر واجهة المستخدم
const loginPanel = document.getElementById('loginPanel');
const dashboardPanel = document.getElementById('dashboardPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

// جلب الفصول وعرضها في القائمة المنسدلة
async function loadClasses() {
    const classSelect = document.getElementById('adminClassSelect');
    classSelect.innerHTML = '<option value="">-- اختر الفصل --</option>';
    const querySnapshot = await getDocs(collection(db, "classes"));
    querySnapshot.forEach((doc) => {
        classSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
}

// 1. مراقبة حالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginPanel.style.display = 'none';
        dashboardPanel.style.display = 'block';
        loadClasses(); // تحميل الفصول بمجرد الدخول
    } else {
        loginPanel.style.display = 'block';
        dashboardPanel.style.display = 'none';
    }
});

// 2. تسجيل الدخول
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => { loginError.style.display = 'none'; })
        .catch(() => { loginError.style.display = 'block'; });
});

// 3. تسجيل الخروج
logoutBtn.addEventListener('click', () => { signOut(auth); });

// 4. إضافة مهمة أدائية
document.getElementById('addTaskBtn').addEventListener('click', async () => {
    const taskName = document.getElementById('taskName').value.trim();
    if (taskName) {
        await addDoc(collection(db, "tasks"), { name: taskName });
        alert('تمت إضافة المهمة بنجاح!');
        document.getElementById('taskName').value = '';
    }
});

// 5. إضافة فصل
document.getElementById('addClassBtn').addEventListener('click', async () => {
    const className = document.getElementById('className').value.trim();
    if (className) {
        await addDoc(collection(db, "classes"), { name: className });
        alert('تم إضافة الفصل بنجاح!');
        document.getElementById('className').value = '';
        loadClasses(); // تحديث القائمة المنسدلة فوراً
    }
});

// 6. إضافة الطلاب دفعة واحدة
document.getElementById('addStudentBtn').addEventListener('click', async () => {
    const studentNamesRaw = document.getElementById('studentNames').value;
    const classSelect = document.getElementById('adminClassSelect');
    const classId = classSelect.value;
    const className = classSelect.options[classSelect.selectedIndex]?.text;

    if (!classId || !studentNamesRaw.trim()) {
        alert('يرجى اختيار الفصل أولاً وإدخال أسماء الطلاب!');
        return;
    }

    // تحويل النص إلى قائمة أسماء وتجاهل الأسطر الفارغة
    const students = studentNamesRaw.split('\n').map(name => name.trim()).filter(name => name !== '');
    
    // تغيير نص الزر أثناء التحميل
    const btn = document.getElementById('addStudentBtn');
    btn.innerText = 'جاري الإضافة...';
    btn.disabled = true;

    for (const student of students) {
        await addDoc(collection(db, "students"), {
            name: student,
            classId: classId,
            className: className
        });
    }
    
    // إظهار رسالة النجاح وإعادة الزر لحالته
    document.getElementById('studentSuccessMsg').style.display = 'block';
    document.getElementById('studentNames').value = '';
    btn.innerText = 'إضافة جميع الطلاب';
    btn.disabled = false;
    
    // إخفاء رسالة النجاح بعد 3 ثوانٍ
    setTimeout(() => { document.getElementById('studentSuccessMsg').style.display = 'none'; }, 3000);
});
