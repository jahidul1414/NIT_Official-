import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Initialize Firebase (ডুপ্লিকেট ইনিশিয়ালাইজেশন সেফটি ফিক্স সহ)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
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
        navLoginContainer.innerHTML = ""; // কন্টেইনার একদম খালি করে দেওয়া হলো
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


// --- ৪. ফায়ারবেজ থেকে প্রোফাইল ডেটা লোড ---
async function loadUserProfile() {
    if (!loggedInUserEmail) return;

    try {
        const docRef = doc(db, "users", loggedInUserEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (profileName) profileName.value = data.name || "";
            if (profileDept) profileDept.value = data.department || "";
            if (profileSemester) profileSemester.value = data.semester || "";
            if (profileImgUrl) profileImgUrl.value = data.photoUrl || "";
            if (userRole) userRole.innerText = data.role || "Student";

            if (data.photoUrl) {
                if (dropdownAvatar) dropdownAvatar.src = data.photoUrl;
                if (navProfileDisplay) {
                    navProfileDisplay.src = data.photoUrl;
                    navProfileDisplay.classList.remove('hidden');
                }
                if (navProfileIcon) navProfileIcon.classList.add('hidden');
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
            
            [profileName, profileDept, profileSemester, profileImgUrl].forEach(el => {
                if(el) el.classList.add('bg-white', 'border-gray-300', 'px-2');
            });

            editSaveBtn.innerHTML = `<i class="fas fa-save mr-1"></i> Save Changes`;
            editSaveBtn.className = "w-full text-center font-semibold text-sm py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all";
        } else {
            isEditing = false;
            profileName.disabled = true;
            profileDept.disabled = true;
            profileSemester.disabled = true;
            profileImgUrl.disabled = true;
            
            [profileName, profileDept, profileSemester, profileImgUrl].forEach(el => {
                if(el) el.classList.remove('bg-white', 'border-gray-300', 'px-2');
            });
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

// --- ✨ ৭. ডাইনামিক নোটিশ বোর্ড লজিক (ইন্ডেক্স পেজের জন্য - আপডেটেড) ---
const liveNoticeContainer = document.getElementById('liveNoticeContainer');
const modalNoticeList = document.getElementById('modalNoticeList');
const noticeBoardWrapper = document.getElementById('noticeBoardWrapper');

const noticeDetailsModal = document.getElementById('noticeDetailsModal');
const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
const detailNoticeDate = document.getElementById('detailNoticeDate');
const detailNoticeTitle = document.getElementById('detailNoticeTitle');
const detailNoticeInfo = document.getElementById('detailNoticeInfo');

let scrollId = null;
let isHovered = false;
let currentScrollTop = 0;

// গ্লোবাল ডিটেইলস মোডাল উইন্ডো ফাংশন
window.showNoticeDetails = function(title, info, date) {
    if (detailNoticeTitle) detailNoticeTitle.innerText = decodeURIComponent(title);
    if (detailNoticeInfo) detailNoticeInfo.innerText = decodeURIComponent(info) || "No description provided.";
    if (detailNoticeDate) detailNoticeDate.innerHTML = `<i class="far fa-clock text-amber-500"></i> ${decodeURIComponent(date)}`;
    if (noticeDetailsModal) {
        noticeDetailsModal.classList.remove('hidden');
        noticeDetailsModal.classList.add('flex');
    }
};

if (liveNoticeContainer) {
    const noticesRef = collection(db, "notices");
    // timestamp অনুযায়ী সাজিয়ে লেটেস্ট নোটিশগুলো রিয়েল-টাইম স্ন্যাপশট নেওয়া
    const q = query(noticesRef, orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        try {
            if (snapshot.empty) {
                liveNoticeContainer.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No active notices found.</p>`;
                if (modalNoticeList) modalNoticeList.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No active notices found.</p>`;
                return;
            }

            let boardHtml = '';
            let modalHtml = '';

            snapshot.forEach((doc) => {
                const notice = doc.data();
                let readableDate = "Notice Bulletin";
                
                if (notice.timestamp) {
                    try { 
                        readableDate = new Date(Number(notice.timestamp)).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}); 
                    } catch(e){}
                }

                const safeTitle = encodeURIComponent(notice.title || '');
                const safeInfo = encodeURIComponent(notice.info || '');
                const safeDate = encodeURIComponent(readableDate);

                // মূল নোটিশ বোর্ডের স্লাইডার কার্ড লেআউট
                boardHtml += `
                    <div onclick="showNoticeDetails('${safeTitle}', '${safeInfo}', '${safeDate}')" class="p-3 bg-white border border-gray-200/80 rounded-xl shadow-sm hover:border-blue-400 transition-all cursor-pointer">
                        <span class="text-[9px] font-bold text-amber-500 tracking-wider uppercase block mb-0.5"><i class="far fa-calendar-alt mr-1"></i>${readableDate}</span>
                        <h4 class="text-blue-900 font-bold text-xs sm:text-sm leading-snug">${notice.title || 'Untitled Notice'}</h4>
                        <p class="text-gray-500 text-[11px] mt-1 line-clamp-2">${notice.info || ''}</p>
                    </div>`;

                // See All মোডালের ভেতরের ফুল লিস্ট লেআউট
                modalHtml += `
                    <div onclick="showNoticeDetails('${safeTitle}', '${safeInfo}', '${safeDate}')" class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div class="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                            <span class="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1.5"><i class="far fa-clock text-amber-500"></i> ${readableDate}</span>
                            <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">NIT Document</span>
                        </div>
                        <h5 class="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">${notice.title || 'Untitled Notice'}</h5>
                        <p class="text-slate-600 text-xs sm:text-sm mt-2 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">${notice.info || ''}</p>
                    </div>`;
            });

            // ইনফিনিটি ক্রলিং লুপের জন্য ডাবল রেন্ডারিং হ্যান্ডলার
            liveNoticeContainer.innerHTML = boardHtml + boardHtml;
            if (modalNoticeList) modalNoticeList.innerHTML = modalHtml;

            startAutoScroll();
        } catch (error) {
            console.error("Error processing notices: ", error);
        }
    }, (error) => {
        console.error("Firebase Snapshot Error: ", error);
        liveNoticeContainer.innerHTML = `<p class="text-xs text-red-500 py-4 text-center">Connection Error or Rules Blocked.</p>`;
    });
}

function startAutoScroll() {
    if (!noticeBoardWrapper) return;
    stopAutoScroll();
    currentScrollTop = noticeBoardWrapper.scrollTop;

    function scrollStep() {
        if (!isHovered && noticeBoardWrapper) {
            currentScrollTop += 0.75; 
            noticeBoardWrapper.scrollTop = currentScrollTop;

            const halfHeight = liveNoticeContainer.scrollHeight / 2;
            if (currentScrollTop >= halfHeight) {
                currentScrollTop = 0;
                noticeBoardWrapper.scrollTop = 0;
            }
        } else if (noticeBoardWrapper) {
            currentScrollTop = noticeBoardWrapper.scrollTop;
        }
        scrollId = requestAnimationFrame(scrollStep);
    }
    scrollId = requestAnimationFrame(scrollStep);
}

function stopAutoScroll() {
    if(scrollId) cancelAnimationFrame(scrollId);
}

if (noticeBoardWrapper) {
    noticeBoardWrapper.addEventListener('mouseenter', () => { isHovered = true; });
    noticeBoardWrapper.addEventListener('mouseleave', () => { 
        isHovered = false; 
        currentScrollTop = noticeBoardWrapper.scrollTop; 
    });
}

// "See All" এবং ডিটেইলস মোডালের পপআপ ওপেন/ক্লোজ ট্রিগার লজিক
const allNoticesModal = document.getElementById('allNoticesModal');
const seeAllNoticesBtn = document.getElementById('seeAllNoticesBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

if(seeAllNoticesBtn) {
    seeAllNoticesBtn.addEventListener('click', () => {
        if (allNoticesModal) {
            allNoticesModal.classList.remove('hidden');
            allNoticesModal.classList.add('flex');
        }
        document.body.style.overflow = 'hidden'; 
    });
}

const triggerCloseAction = () => {
    if (allNoticesModal) {
        allNoticesModal.classList.add('hidden');
        allNoticesModal.classList.remove('flex');
    }
    document.body.style.overflow = 'auto'; 
};

if(closeModalBtn) closeModalBtn.addEventListener('click', triggerCloseAction);
if(allNoticesModal) {
    allNoticesModal.addEventListener('click', (e) => {
        if (e.target === allNoticesModal) triggerCloseAction();
    });
}

const closeDetailsModal = () => { 
    if (noticeDetailsModal) {
        noticeDetailsModal.classList.add('hidden'); 
        noticeDetailsModal.classList.remove('flex'); 
    }
};
if(closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
if(noticeDetailsModal) {
    noticeDetailsModal.addEventListener('click', (e) => { if (e.target === noticeDetailsModal) closeDetailsModal(); });
}


// --- ✨ ৮. অ্যাডমিন প্যানেল: নোটিশ আপলোড লজিক (`admin.html` এর জন্য) ---
const noticeForm = document.getElementById('noticeForm');
if (noticeForm) {
    noticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const noticeInput = document.getElementById('noticeInput');
        const noticeText = noticeInput ? noticeInput.value.trim() : "";

        if (!noticeText) {
            alert("Error: Notice content cannot be empty!");
            return;
        }

        try {
            // Firestore-এর "notices" কালেকশনে নতুন ডকুমেন্ট যোগ করা
            await addDoc(collection(db, "notices"), {
                content: noticeText,
                createdAt: new Date().toISOString()
            });
            alert("Success: Cloud broadcast pipeline connected. Notice distribution completed!");
            noticeForm.reset();
        } catch (error) {
            console.error("Error publishing notice: ", error);
            alert("Database Error: Could not publish notice.");
        }
    });
}

// --- ✨ ৯. অ্যাডমিন প্যানেল: স্টুডেন্ট রোল ও টিচার আইডি সার্চ লজিক ---
const adminSearchBtn = document.getElementById('searchBtn');
if (adminSearchBtn) {
    adminSearchBtn.addEventListener('click', async () => {
        const searchType = document.getElementById('searchType').value;
        const searchQuery = document.getElementById('searchQuery').value.trim();
        const resultDiv = document.getElementById('searchResult');
        const emptyState = document.getElementById('emptyState');

        if (!searchQuery) {
            alert("Validation Error: Query payload cannot be empty!");
            return;
        }

        // UI কম্পোনেন্ট টগল
        if (emptyState) emptyState.classList.add('hidden');
        if (resultDiv) resultDiv.classList.remove('hidden');

        try {
            if (searchType === 'student') {
                // 'students' কালেকশন থেকে রোল নম্বরের ডকুমেন্ট রেফারেন্স নেওয়া
                const docRef = doc(db, "students", searchQuery);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const studentData = docSnap.data();

                    // স্টুডেন্ট লেআউট এক্টিভ করা
                    document.getElementById('studentPaymentSection').classList.remove('hidden');
                    document.getElementById('teacherSection').classList.add('hidden');
                    document.getElementById('resBadge').innerText = "Student Core";
                    document.getElementById('resBadge').className = "bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border border-blue-500/20 w-fit";
                    document.getElementById('resMetaLabel').innerText = "Roll Number:";

                    // ডাইনামিক ডেটা ইনজেক্ট করা
                    document.getElementById('resName').innerText = studentData.name || "N/A";
                    document.getElementById('resIdText').innerText = searchQuery;
                    document.getElementById('resDept').innerText = studentData.department || "N/A";
                    document.getElementById('resSemester').innerText = studentData.semester || "N/A";
                    document.getElementById('resTotalAmount').innerText = (studentData.payment_info ? studentData.payment_info.total_paid : "0") + " TK";

                    // ফি-ব্রেকডাউন রেন্ডার করা
                    const feesList = document.getElementById('resFeesList');
                    feesList.innerHTML = "";
                    if (studentData.payment_info && studentData.payment_info.fees_details) {
                        Object.entries(studentData.payment_info.fees_details).forEach(([feeName, amount]) => {
                            const li = document.createElement('li');
                            li.className = "flex justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs";
                            li.innerHTML = `<span class="text-slate-400">${feeName}</span> <span class="font-bold text-slate-200">${amount} TK</span>`;
                            feesList.appendChild(li);
                        });
                    } else {
                        feesList.innerHTML = `<li class="text-xs text-slate-500">No layout fee logs found.</li>`;
                    }
                } else {
                    alert("No record found for student roll: " + searchQuery);
                    if (resultDiv) resultDiv.classList.add('hidden');
                    if (emptyState) emptyState.classList.remove('hidden');
                }

            } else {
                // 'teachers' কালেকশন থেকে আইডি নম্বরের ডকুমেন্ট রেফারেন্স নেওয়া
                const docRef = doc(db, "teachers", searchQuery);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const teacherData = docSnap.data();

                    // টিচার লেআউট এক্টিভ করা
                    document.getElementById('studentPaymentSection').classList.add('hidden');
                    document.getElementById('teacherSection').classList.remove('hidden');
                    document.getElementById('resBadge').innerText = "Faculty Staff";
                    document.getElementById('resBadge').className = "bg-amber-500/10 text-amber-400 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border border-amber-500/20 w-fit";
                    document.getElementById('resMetaLabel').innerText = "Employee ID:";

                    // ডাইনামিক ডেটা ইনজেক্ট করা
                    document.getElementById('resName').innerText = teacherData.name || "N/A";
                    document.getElementById('resIdText').innerText = searchQuery;
                    document.getElementById('teacherDesignation').innerText = teacherData.designation || "N/A";
                    document.getElementById('teacherExpertise').innerText = teacherData.expertise || "N/A";
                    document.getElementById('teacherEmail').innerText = teacherData.email || "N/A";
                } else {
                    alert("No record found for teacher ID: " + searchQuery);
                    if (resultDiv) resultDiv.classList.add('hidden');
                    if (emptyState) emptyState.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error("Search Engine Fetching error: ", error);
            alert("Database Error while fetching credentials.");
        }
    });
}

// রান প্রোফাইল লোডার
loadUserProfile();