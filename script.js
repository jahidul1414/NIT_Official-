import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
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

// DOM Elements
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const profileName = document.getElementById('profileName');
const profileDept = document.getElementById('profileDept');
const profileSemester = document.getElementById('profileSemester');
const profileImgUrl = document.getElementById('profileImgUrl');
const userRole = document.getElementById('userRole');
const editSaveBtn = document.getElementById('editSaveBtn');
const authBtn = document.getElementById('authBtn');
const navLoginContainer = document.getElementById('navLoginContainer');
const dropdownAvatar = document.getElementById('dropdownAvatar');
const navProfileDisplay = document.getElementById('navProfileDisplay');
const navProfileIcon = document.getElementById('navProfileIcon');

// সেশন ডেটা নিখুঁতভাবে চেক করা
let loggedInUserEmail = localStorage.getItem('userSessionEmail');

if (!loggedInUserEmail) {
    const backupUser = localStorage.getItem('currentUser');
    if (backupUser) {
        try {
            const parsed = JSON.parse(backupUser);
            loggedInUserEmail = parsed.email;
            localStorage.setItem('userSessionEmail', loggedInUserEmail);
        } catch (e) {
            console.error(e);
        }
    }
}

let isEditing = false;

// --- ১. ইমেজ স্লাইডার লজিক (ব্যানার) ---
let slideIndex = 0;
const slides = document.getElementById('slider');
function runSlider() {
    if (slides && slides.children.length > 0) {
        slideIndex++;
        if (slideIndex >= slides.children.length) {
            slideIndex = 0;
        }
        slides.style.transform = `translateX(-${slideIndex * 100}%)`;
    }
}
setInterval(runSlider, 3000);


// --- ২. লগইন বাটনের ভিজিবিলিটি ফিক্স (লগইন থাকলে পুরোপুরি ডিলিট হবে) ---
if (loggedInUserEmail && loggedInUserEmail !== "") {
    if (navLoginContainer) {
        navLoginContainer.innerHTML = ""; // কন্টেইনার একদম খালি করে দেওয়া হলো
        navLoginContainer.className = "hidden";
    }
}


// --- ৩. প্রোফাইল আইকন ক্লিক লজিক ---
if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!loggedInUserEmail) {
            window.location.href = "login.html";
        } else {
            profileDropdown.classList.toggle('hidden');
        }
    });
}

document.addEventListener('click', () => {
    if (profileDropdown) profileDropdown.classList.add('hidden');
});
if (profileDropdown) {
    profileDropdown.addEventListener('click', (e) => e.stopPropagation());
}


// --- ৪. ফায়ারবেজ থেকে প্রোফাইল ডেটা লোড ---
async function loadUserProfile() {
    if (!loggedInUserEmail) return;

    try {
        const docRef = doc(db, "users", loggedInUserEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            profileName.value = data.name || "";
            profileDept.value = data.department || "";
            profileSemester.value = data.semester || "";
            profileImgUrl.value = data.photoUrl || "";
            userRole.innerText = data.role || "Student";

            if (data.photoUrl) {
                dropdownAvatar.src = data.photoUrl;
                navProfileDisplay.src = data.photoUrl;
                navProfileDisplay.classList.remove('hidden');
                navProfileIcon.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error("Error loading profile: ", error);
    }
}


// --- ৫. প্রোফাইল এডিট ও ক্লাউড সেভ লজিক ---
if (editSaveBtn) {
    editSaveBtn.addEventListener('click', async () => {
        if (!isEditing) {
            isEditing = true;
            profileName.disabled = false;
            profileDept.disabled = false;
            profileSemester.disabled = false;
            profileImgUrl.disabled = false;
            
            [profileName, profileDept, profileSemester, profileImgUrl].forEach(el => el.classList.add('bg-white', 'border-gray-300', 'px-2'));

            editSaveBtn.innerHTML = `<i class="fas fa-save mr-1"></i> Save Changes`;
            editSaveBtn.className = "w-full text-center font-semibold text-sm py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all";
        } else {
            isEditing = false;
            profileName.disabled = true;
            profileDept.disabled = true;
            profileSemester.disabled = true;
            profileImgUrl.disabled = true;
            
            [profileName, profileDept, profileSemester, profileImgUrl].forEach(el => el.classList.remove('bg-white', 'border-gray-300', 'px-2'));
            editSaveBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i> Saving...`;

            try {
                const docRef = doc(db, "users", loggedInUserEmail);
                await updateDoc(docRef, {
                    name: profileName.value,
                    department: profileDept.value,
                    semester: profileSemester.value,
                    photoUrl: profileImgUrl.value
                });
                loadUserProfile();
            } catch (error) {
                console.error("Error: " + error.message);
            }
            editSaveBtn.innerHTML = `<i class="fas fa-edit mr-1"></i> Edit Profile`;
            editSaveBtn.className = "w-full text-center font-semibold text-sm py-2 px-4 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition-all";
        }
    });
}

// --- ৬. লগআউট ---
if (authBtn) {
    authBtn.addEventListener('click', () => {
        localStorage.clear(); // সব সেশন একসাথে রিমুভ করবে
        window.location.reload();
    });
}

// রান প্রোফাইল লোডার
loadUserProfile();