import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration (আপনার প্রজেক্টের সাথে সিঙ্ক করা)
const firebaseConfig = {
    apiKey: "AIzaSyCGEIxwHW-ixg7oGMznJC1epGsH5mhr2A0",
    authDomain: "nit-website-bf3fc.firebaseapp.com",
    projectId: "nit-website-bf3fc",
    storageBucket: "nit-website-bf3fc.firebasestorage.app",
    messagingSenderId: "205570230495",
    appId: "1:205570230495:web:b0d77963fbf56fb6b6016a",
    measurementId: "G-RNHJPR8Y54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const teachersGrid = document.getElementById('teachersGrid');
const loadingText = document.getElementById('loadingText');

// ফায়ারবেজ থেকে শিক্ষকদের ডেটা নিয়ে আসার মেইন ফাংশন
async function fetchTeachers() {
    try {
        // users কালেকশন থেকে শুধুমাত্র যাদের role "Teacher" তাদের কুয়েরি করা হচ্ছে
        const q = query(collection(db, "users"), where("role", "==", "Teacher"));
        const querySnapshot = await getDocs(q);
        
        // লোডিং টেক্সট মুছে ফেলা
        if (loadingText) loadingText.remove();

        // যদি ডাটাবেজে কোনো শিক্ষক না থাকে
        if (querySnapshot.empty) {
            teachersGrid.innerHTML = `
                <div class="col-span-full text-center text-gray-400 py-12">
                    <i class="fas fa-users-slash text-4xl mb-2"></i>
                    <p class="font-semibold">No teachers found in the database.</p>
                </div>`;
            return;
        }

        // লুপ চালিয়ে কার্ড জেনারেট করা
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // যদি শিক্ষকের নিজের কোনো ছবি না থাকে তবে ডেমো ছবি ব্যবহার হবে
            const avatar = data.photoUrl && data.photoUrl !== "" ? data.photoUrl : "https://via.placeholder.com/150";
            const department = data.department && data.department !== "" ? data.department : "Not Assigned";
            const semesterOrRank = data.semester && data.semester !== "" ? data.semester : "Faculty";

            // ডাইনামিক HTML কার্ড স্ট্রাকচার
            const cardHTML = `
                <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 text-center p-6 group">
                    <div class="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-blue-900 mb-4 group-hover:scale-105 transition-all">
                        <img src="${avatar}" alt="${data.name}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-xl font-bold text-gray-800 truncate">${data.name}</h4>
                    <p class="text-xs font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-full inline-block my-2 uppercase">${department}</p>
                    <p class="text-sm text-gray-600 block">${semesterOrRank}</p>
                    <p class="text-xs text-gray-400 flex items-center justify-center mt-3 truncate">
                        <i class="fas fa-envelope mr-1"></i> ${data.email}
                    </p>
                </div>
            `;
            
            // গ্রিডে কার্ড পুশ করা হচ্ছে
            teachersGrid.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error loading teachers: ", error);
        if (teachersGrid) {
            teachersGrid.innerHTML = `<p class="text-center text-red-500 font-bold col-span-full">Failed to load teachers data. Please try again later.</p>`;
        }
    }
}

// পেজ লোড হলে ফাংশনটি রান করবে
fetchTeachers();