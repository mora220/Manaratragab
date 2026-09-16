import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);

// عناصر واجهة المستخدم
const taskSelect = document.getElementById('taskSelect');
const classSelect = document.getElementById('classSelect');
const studentSelect = document.getElementById('studentSelect');
const uploadForm = document.getElementById('uploadForm');
const fileUpload = document.getElementById('fileUpload');
const worksList = document.getElementById('worksList');

// 1. تحميل المهام والفصول عند فتح الصفحة
async function loadInitialData() {
    // تحميل المهام
    taskSelect.innerHTML = '<option value="">-- اختر المهمة الأدائية --</option>';
    const tasksSnapshot = await getDocs(collection(db, "tasks"));
    tasksSnapshot.forEach((doc) => {
        taskSelect.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`;
    });

    // تحميل الفصول
    classSelect.innerHTML = '<option value="">-- اختر الفصل --</option>';
    const classesSnapshot = await getDocs(collection(db, "classes"));
    classesSnapshot.forEach((doc) => {
        classSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
    });
}
loadInitialData();

// 2. تحميل الطلاب عند تغيير الفصل
classSelect.addEventListener('change', async () => {
    const classId = classSelect.value;
    studentSelect.innerHTML = '<option value="">-- جاري تحميل الأسماء... --</option>';
    
    if (!classId) {
        studentSelect.innerHTML = '<option value="">-- يرجى اختيار الفصل أولاً --</option>';
        return;
    }

    const q = query(collection(db, "students"), where("classId", "==", classId));
    const querySnapshot = await getDocs(q);
    
    studentSelect.innerHTML = '<option value="">-- اختر اسمك --</option>';
    querySnapshot.forEach((doc) => {
        studentSelect.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`;
    });
});

// 3. عرض الأعمال السابقة من الذاكرة المحلية (localStorage)
function displayMyWorks() {
    const myWorks = JSON.parse(localStorage.getItem('studentWorks')) || [];
    if (myWorks.length === 0) return;

    worksList.innerHTML = ''; // مسح الرسالة الافتراضية
    myWorks.reverse().forEach(work => {
        const fileLink = work.type.startsWith('image') 
            ? `<img src="${work.url}" style="max-width: 100%; border-radius: 5px; margin-top: 10px;">`
            : `<video src="${work.url}" controls style="max-width: 100%; border-radius: 5px; margin-top: 10px;"></video>`;

        worksList.innerHTML += `
            <div class="work-item">
                <strong>المهمة:</strong> ${work.task}<br>
                <strong>الاسم:</strong> ${work.student}<br>
                ${fileLink}
            </div>
        `;
    });
}
displayMyWorks();

// 4. رفع العمل عند الضغط على الزر
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    
    const taskName = taskSelect.value;
    const className = classSelect.options[classSelect.selectedIndex].text;
    const studentName = studentSelect.value;
    const file = fileUpload.files[0];
    const submitBtn = uploadForm.querySelector('button');

    if (!taskName || !studentName) {
        alert("يرجى التأكد من اختيار المهمة والاسم!");
        return;
    }

    submitBtn.innerText = "جاري الرفع... يرجى الانتظار";
    submitBtn.disabled = true;

    try {
        // إنشاء اسم مميز للملف لتجنب التكرار
        const uniqueFileName = Date.now() + "_" + file.name;
        const storageRef = ref(storage, `uploads/${className}/${taskName}/${uniqueFileName}`);
        
        // رفع الملف
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // تسجيل البيانات في قاعدة بيانات الأدمن (لتراها أنت)
        await addDoc(collection(db, "submissions"), {
            task: taskName,
            className: className,
            student: studentName,
            fileUrl: downloadURL,
            fileType: file.type,
            timestamp: new Date()
        });

        // حفظ العمل في الذاكرة المحلية للطالب (ليراه هو)
        const myWorks = JSON.parse(localStorage.getItem('studentWorks')) || [];
        myWorks.push({
            task: taskName,
            student: studentName,
            url: downloadURL,
            type: file.type
        });
        localStorage.setItem('studentWorks', JSON.stringify(myWorks));

        alert("تم رفع العمل بنجاح! أحسنت.");
        
        // إعادة تهيئة النموذج وعرض الأعمال الجديدة
        uploadForm.reset();
        displayMyWorks();

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الرفع، يرجى المحاولة مرة أخرى.");
    } finally {
        submitBtn.innerText = "رفع العمل الآن";
        submitBtn.disabled = false;
    }
});
