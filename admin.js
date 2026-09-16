import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// مراقبة حالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginPanel.style.display = 'none';
        dashboardPanel.style.display = 'block';
    } else {
        loginPanel.style.display = 'block';
        dashboardPanel.style.display = 'none';
    }
});

// وظيفة تسجيل الدخول
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then(() => { loginError.style.display = 'none'; })
        .catch(() => { loginError.style.display = 'block'; });
});

// وظيفة تسجيل الخروج
logoutBtn.addEventListener('click', () => { signOut(auth); });
