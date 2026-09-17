import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const loginPanel = document.getElementById('loginPanel');
const dashboardPanel = document.getElementById('dashboardPanel');

// تحديث جميع القوائم والبيانات في لوحة التحكم
async function loadAllData() {
    // 1. تحديث القوائم المنسدلة
    const classSelect1 = document.getElementById('adminClassSelect');
    const classSelect2 = document.getElementById('viewClassSelect');
    const manageClassSelect = document.getElementById('manageStudentClassSelect');
    
    classSelect1.innerHTML = '<option value="">-- اختر الفصل --</option>';
    classSelect2.innerHTML = '<option value="">-- اختر الفصل --</option>';
    manageClassSelect.innerHTML = '<option value="">-- اختر الفصل لعرض طلابه --</option>';
    
    const classesListHTML = document.getElementById('manageClassesList');
    classesListHTML.innerHTML = '';
    
    const cSnap = await getDocs(collection(db, "classes"));
    cSnap.forEach((d) => {
        const optionHTML = `<option value="${d.id}">${d.data().name}</option>`;
        classSelect1.innerHTML += optionHTML;
        classSelect2.innerHTML += optionHTML;
        manageClassSelect.innerHTML += optionHTML;
        
        // عرض الفصول في قسم الإدارة
        classesListHTML.innerHTML += `<div class="list-item">
            <span>${d.data().name}</span>
            <div>
                <button class="btn-edit" onclick="editItem('classes', '${d.id}', '${d.data().name}')">تعديل</button>
                <button class="btn-delete" onclick="deleteItem('classes', '${d.id}')">حذف</button>
            </div>
        </div>`;
    });

    // 2. تحديث المهام
    const taskSelect = document.getElementById('viewTaskSelect');
    taskSelect.innerHTML = '<option value="">-- اختر المهمة --</option>';
    
    const tasksListHTML = document.getElementById('manageTasksList');
    tasksListHTML.innerHTML = '';

    const tSnap = await getDocs(collection(db, "tasks"));
    tSnap.forEach((d) => {
        taskSelect.innerHTML += `<option value="${d.data().name}">${d.data().name}</option>`;
        
        // عرض المهام في قسم الإدارة
        tasksListHTML.innerHTML += `<div class="list-item">
            <span>${d.data().name}</span>
            <div>
                <button class="btn-edit" onclick="editItem('tasks', '${d.id}', '${d.data().name}')">تعديل</button>
                <button class="btn-delete" onclick="deleteItem('tasks', '${d.id}')">حذف</button>
            </div>
        </div>`;
    });
    
    // إفراغ قائمة الطلاب عند التحديث
    document.getElementById('manageStudentsList').innerHTML = '';
}

// دوال الحذف والتعديل (مرتبطة بالنافذة لتعمل مع الأزرار)
window.deleteItem = async (colName, id) => {
    if(confirm("هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.")) {
        await deleteDoc(doc(db, colName, id));
        loadAllData();
    }
};

window.editItem = async (colName, id, oldName) => {
    const newName = prompt("أدخل الاسم الجديد:", oldName);
    if(newName && newName.trim() !== "" && newName !== oldName) {
        await updateDoc(doc(db, colName, id), { name: newName.trim() });
        loadAllData();
    }
};

// مراقبة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginPanel.style.display = 'none';
        dashboardPanel.style.display = 'block';
        loadAllData();
    } else {
        loginPanel.style.display = 'block';
        dashboardPanel.style.display = 'none';
    }
});

// أزرار تسجيل الدخول والخروج
document.getElementById('loginBtn').addEventListener('click', () => {
    signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value)
        .then(() => { document.getElementById('loginError').style.display = 'none'; })
        .catch(() => { document.getElementById('loginError').style.display = 'block'; });
});
document.getElementById('logoutBtn').addEventListener('click', () => { signOut(auth); });

// الإضافات الجديدة
document.getElementById('addTaskBtn').addEventListener('click', async () => {
    const v = document.getElementById('taskName').value.trim();
    if (v) { await addDoc(collection(db, "tasks"), { name: v }); document.getElementById('taskName').value=''; loadAllData(); }
});

document.getElementById('addClassBtn').addEventListener('click', async () => {
    const v = document.getElementById('className').value.trim();
    if (v) { await addDoc(collection(db, "classes"), { name: v }); document.getElementById('className').value=''; loadAllData(); }
});

document.getElementById('addStudentBtn').addEventListener('click', async () => {
    const names = document.getElementById('studentNames').value.split('\n').map(n => n.trim()).filter(n => n !== '');
    const sel = document.getElementById('adminClassSelect');
    if (!sel.value || names.length === 0) return alert('اختر الفصل وأدخل الأسماء!');
    
    const btn = document.getElementById('addStudentBtn');
    btn.innerText = 'جاري الإضافة...'; btn.disabled = true;
    for (const name of names) await addDoc(collection(db, "students"), { name: name, classId: sel.value, className: sel.options[sel.selectedIndex].text });
    document.getElementById('studentSuccessMsg').style.display = 'block';
    setTimeout(() => document.getElementById('studentSuccessMsg').style.display = 'none', 3000);
    document.getElementById('studentNames').value = ''; btn.innerText = 'إضافة جميع الطلاب'; btn.disabled = false;
});

// جلب الطلاب لقسم إدارة البيانات
document.getElementById('manageStudentClassSelect').addEventListener('change', async (e) => {
    const classId = e.target.value;
    const list = document.getElementById('manageStudentsList');
    list.innerHTML = '<p style="text-align:center;">جاري التحميل...</p>';
    if(!classId) { list.innerHTML = ''; return; }

    const q = query(collection(db, "students"), where("classId", "==", classId));
    const sSnap = await getDocs(q);
    list.innerHTML = '';
    
    if(sSnap.empty) { list.innerHTML = '<p style="text-align:center; color:#7f8c8d;">لا يوجد طلاب في هذا الفصل.</p>'; }
    
    sSnap.forEach(d => {
        list.innerHTML += `<div class="list-item">
            <span>${d.data().name}</span>
            <div>
                <button class="btn-edit" onclick="editItem('students', '${d.id}', '${d.data().name}')">تعديل</button>
                <button class="btn-delete" onclick="deleteItem('students', '${d.id}')">حذف</button>
            </div>
        </div>`;
    });
});

// استعراض الأعمال المرفوعة
document.getElementById('viewWorksBtn').addEventListener('click', async () => {
    const taskName = document.getElementById('viewTaskSelect').value;
    const classSel = document.getElementById('viewClassSelect');
    const className = classSel.options[classSel.selectedIndex]?.text;
    const container = document.getElementById('worksResultContainer');

    if (!taskName || classSel.value === "") { alert("يرجى اختيار المهمة والفصل لعرض الأعمال!"); return; }

    container.innerHTML = '<p style="text-align:center;">جاري البحث عن الأعمال...</p>';
    const q = query(collection(db, "submissions"), where("className", "==", className));
    const querySnapshot = await getDocs(q);
    
    let tableHTML = `<table><tr><th>اسم الطالب</th><th>العمل المرفوع</th></tr>`;
    let found = false;

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.task === taskName) {
            found = true;
            tableHTML += `<tr><td>${data.student}</td><td><a href="${data.fileUrl}" target="_blank" class="view-link">مشاهدة العمل</a></td></tr>`;
        }
    });

    tableHTML += `</table>`;
    container.innerHTML = found ? tableHTML : `<p style="text-align:center; color:#e74c3c; font-weight:bold;">لم يقم أي طالب برفع هذه المهمة في هذا الفصل حتى الآن.</p>`;
});
