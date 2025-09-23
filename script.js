// DOM elementlariga murojaat qilish
const residentSelect = document.getElementById('resident-of');
const treatmentSelect = document.getElementById('treatment');
const phoneNumberInput = document.getElementById('phone-number');
const mainSearchInput = document.getElementById('main-search-input');
const chatButton = document.getElementById('chat-button');
const requestAppointmentButtons = document.querySelectorAll('.request-appointment-button');

// Boshlang'ich qiymatlarni o'rnatish
// phoneNumberInput.value = '+998';

document.addEventListener('DOMContentLoaded', () => {
        // Preloader logikasi (tezroq ishlashi uchun o'zgartirildi)
        const preloader = document.getElementById('preloader');
        if (preloader) {
            // Bu hodisa sahifadagi barcha rasmlar va videolar yuklanishini kutmaydi.
            // Faqat HTML tayyor bo'lganda preloader'ni yashiradi.
            preloader.classList.add('preloader-hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800); // CSSdagi transition vaqti bilan mos kelishi uchun
        }
        
        // Carousel navigatsiya funksionalligi
const hospitalCarousel = document.getElementById('hospitalCarousel');
const prevHospitalButton = document.getElementById('prevHospital');
const nextHospitalButton = document.getElementById('nextHospital');

if (hospitalCarousel && prevHospitalButton && nextHospitalButton) {
    const scrollAmount = () => {
        const card = hospitalCarousel.querySelector('.hospital-card-wrapper');
        return card ? card.offsetWidth + parseInt(window.getComputedStyle(hospitalCarousel).gap) : 300;
    };

    prevHospitalButton.addEventListener('click', () => {
        hospitalCarousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    nextHospitalButton.addEventListener('click', () => {
        hospitalCarousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
}
});

// Qidiruv funksiyasi
function handleSearch(query) {
    console.log('Qidirilmoqda:', query);
    // Haqiqiy ilovada bu qidiruv natijalarini olish uchun API chaqiruvini ishga tushiradi
    // Siz bu yerga Django backend-ingizga so'rov yuborish kodini qo'shishingiz mumkin.
}

// Forma

document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('consultation-form');
        const submitButton = document.getElementById('chat-button');
        const buttonText = document.getElementById('button-text');
        const loaderContainer = document.getElementById('loader-container');
        
        // Modal elementlari
        const statusModal = document.getElementById('status-modal');
        const modalIconContainer = document.getElementById('modal-icon-container');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        // --- BU YERGA O'Z MA'LUMOTLARINGIZNI KIRITING ---
        const TELEGRAM_BOT_TOKEN = '8325839163:AAHfoOzo-jJwd39s2uE5jPqxNoAsAODyGdM'; // BotFather'dan olingan token
        const TELEGRAM_CHAT_ID = '-1002713865997'; // Xabar yuboriladigan chat ID
        const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxGJgbCYeycHbUTSNDIXyB0cAWO5XPxAYmlisoeUPbSPJg0owZ8VO6bzH20vS3NGQ-g/exec'; // Google Apps Script'dan olingan URL

        // ----------------------------------------------------
        
        // Modalni yopish funksiyasi
        const closeModal = () => {
            statusModal.classList.remove('show');
        };

        modalCloseBtn.addEventListener('click', closeModal);
        statusModal.addEventListener('click', (e) => {
            if (e.target === statusModal) {
                closeModal();
            }
        });

        form.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            showModal('error', 'Xatolik!', 'Iltimos, barcha maydonlarni to\'ldiring.');
            form.reportValidity();
            return;
        }

        submitButton.disabled = true;
        submitButton.classList.add('loading');

        const formData = new FormData(form);
        const formattedPhone = formData.get('phone_number'); // Formatlangan raqamni olish: masalan, "+998 (90) 123-45-67"
        
        // --- 1-O'ZGARISH: Raqamni tekshirish va toza formatga o'tkazish ---
        const cleanedPhoneForValidation = formattedPhone.replace(/\D/g, ''); // Tekshirish uchun faqat raqamlar qoldirildi: "998901234567"
        
        if (cleanedPhoneForValidation.length !== 12) {
            showModal('error', 'Xato Raqam!', 'Iltimos, telefon raqamingizni to\'liq kiriting. Namuna: +998 (90) 123-45-67');
            resetButton();
            return;
        }
        
        // Telegram va Google Sheets uchun toza format (+ belgisi bilan)
        const phoneForBackend = '+' + cleanedPhoneForValidation; // Natija: "+998901234567"

        // --- 2-O'ZGARISH: Telegram xabarida toza formatdagi raqamni ishlatish ---
        const messageToTelegram = `
<b>Yangi murojaat!</b>
-------------------------
<b>📍 Viloyat:</b> ${formData.get('resident_of')}
<b>💊 Davolash usuli:</b> ${formData.get('treatment')}
<b>📞 Telefon</b> <code>${phoneForBackend}</code>
<b>📅 Vaqt:</b> ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
    `;

        // --- 3-O'ZGARISH: Google Sheetsga yuborishdan oldin formData'ni yangilash ---
        formData.set('phone_number', phoneForBackend);


        try {
            const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: messageToTelegram,
                    parse_mode: 'HTML',
                }),
            });

            if (telegramResponse.ok) {
                showModal('success', 'Muvaffaqiyatli!', 'Murojaatingiz qabul qilindi! Tez orada operatorlarimiz siz bilan bog\'lanishadi.');
                form.reset();
                
                // Google Sheets'ga YUBORILAYOTGAN formData endi toza raqamni o'z ichiga oladi
                fetch(GOOGLE_SHEET_URL, { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(data => {
                        if (data.result !== 'success') console.error('Google Sheets Error:', data.message);
                        else console.log('Google Sheets ga muvaffaqiyatli yozildi.');
                    })
                    .catch(error => console.error('Google Sheets Fetch Error:', error));
            } else {
                showModal('error', 'Xatolik!', 'Telegramga xabar yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showModal('error', 'Tarmoq Xatoligi!', 'Server bilan bog\'lanishda xatolik. Internet aloqasini tekshiring.');
        } finally {
            resetButton();
        }
    });

        function showModal(type, title, message) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;

            if (type === 'success') {
                modalIconContainer.innerHTML = `
                    <div class="success-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                `;
            } else {
                modalIconContainer.innerHTML = `
                    <div class="error-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                `;
            }
            
            statusModal.classList.add('show');
        }
        
        function resetButton() {
            submitButton.disabled = false;
            loaderContainer.innerHTML = '';
            buttonText.style.display = 'inline';
        }

        
        
    // Mavjud skriptlaringizdan keyin qo'shing
    const phoneInput = document.getElementById('phone-number');
    if(phoneNumberInput) {
        const prefix = '+998';

        // Input maydoniga bosilganda (fokus olinganda)
        phoneNumberInput.addEventListener('focus', () => {
            if (phoneNumberInput.value === '') {
                // Agar bo'sh bo'lsa, boshlang'ich qiymatni qo'yamiz
                phoneNumberInput.value = prefix + ' ';
            }
        });
        
        // Foydalanuvchi boshqa joyga bosganda (fokus yo'qolganda)
        phoneNumberInput.addEventListener('blur', () => {
            // Agar faqat "+998" qolgan bo'lsa, maydonni tozalaymiz
            if (phoneNumberInput.value.trim() === prefix) {
                phoneNumberInput.value = '';
            }
        });

        // Har bir belgi kiritilganda maskani qo'llaymiz
        phoneNumberInput.addEventListener('input', (e) => {
            const input = e.target;
            
            // Prefiksni saqlab, qolgan raqamlarni olamiz
            const userDigits = input.value.substring(prefix.length).replace(/\D/g, '');
            
            // Formatlash
            let formattedNumber = '';
            if (userDigits.length > 0) formattedNumber += ' (' + userDigits.substring(0, 2);
            if (userDigits.length > 2) formattedNumber += ') ' + userDigits.substring(2, 5);
            if (userDigits.length > 5) formattedNumber += '-' + userDigits.substring(5, 7);
            if (userDigits.length > 7) formattedNumber += '-' + userDigits.substring(7, 9);
            
            input.value = prefix + formattedNumber;
        });

        // Orqaga o'chirish (backspace) va prefiksni o'chirishni oldini olish
        phoneNumberInput.addEventListener('keydown', (e) => {
            const input = e.target;
            const isBackspace = e.key === 'Backspace';
            const selectionStart = input.selectionStart;

            // Agar backspace bosilsa va kursor prefiks oxirida bo'lsa, o'chirishni to'xtatamiz
            if (isBackspace && selectionStart <= prefix.length + 1) { // "+998 " -> length 5
                e.preventDefault();
            }
        });
    }

// Uchrashuv so'rash funksiyasi
function handleRequestAppointment(doctorName) {
    console.log(`${doctorName} bilan uchrashuv so'ralmoqda.`);
    // Haqiqiy ilovada bu uchrashuv so'rovini backend-ga yuboradi.
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        text-align: center;
        max-width: 300px;
        font-family: 'Inter', sans-serif;
        color: #334155;
    `;
    modal.innerHTML = `
        <h3>Uchrashuv so'rovi</h3>
        <p>${doctorName} bilan uchrashuv so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.</p>
        <button style="
            background-color: var(--color-primary-blue);
            color: white;
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 15px;
            font-weight: 600;
        " onclick="this.parentNode.remove()">Yopish</button>
    `;
    document.body.appendChild(modal);
}


// Hodisa tinglovchilari
mainSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch(e.target.value);
    }
});

residentSelect.addEventListener('change', (e) => {
    console.log('Istiqomat joyi o\'zgardi:', e.target.value);
});

treatmentSelect.addEventListener('change', (e) => {
    console.log('Davolash usuli o\'zgardi:', e.target.value);
});

phoneNumberInput.addEventListener('input', (e) => {
    // Telefon raqami kiritilganda qiymatni kuzatish
    // Bu yerda siz raqamni formatlash yoki validatsiya qilishni qo'shishingiz mumkin
});

chatButton.addEventListener('click', handleChatNow);

requestAppointmentButtons.forEach(button => {
    button.addEventListener('click', () => {
        const doctorName = button.dataset.doctorName;
        handleRequestAppointment(doctorName);
    });
});

// Header-ni mobil va desktop holatlarda to'g'ri ko'rsatish
function adjustHeaderVisibility() {
    const headerMobileActions = document.querySelector('.header-mobile-actions');
    const headerDesktopActions = document.querySelector('.header-desktop-actions');
    const headerNav = document.querySelector('.header-nav');
    const headerTopRow = document.querySelector('.header-top-row');

    if (window.innerWidth < 768) { // Mobil
        headerMobileActions.style.display = 'flex';
        headerDesktopActions.style.display = 'none';
        headerNav.style.order = '3'; // Navigatsiyani pastga tushirish
        headerNav.style.width = '100%';
        headerNav.style.marginTop = '10px';
        headerTopRow.style.marginBottom = '16px';
    } else { // Desktop
        headerMobileActions.style.display = 'none';
        headerDesktopActions.style.display = 'flex';
        headerNav.style.order = 'unset';
        headerNav.style.width = 'auto';
        headerNav.style.marginTop = '0';
        headerTopRow.style.marginBottom = '0';
    }
}

// Sahifa yuklanganda va o'lcham o'zgarganda funksiyani chaqirish
window.addEventListener('load', adjustHeaderVisibility);
window.addEventListener('resize', adjustHeaderVisibility);


// Eng Mashhur Davolash Yo'nalishlari navigatsiya funksionalligi
const destinationCardsGrid = document.querySelector('.destination-cards-grid');
const prevDestinationButton = document.getElementById('prevDestination');
const nextDestinationButton = document.getElementById('nextDestination');

if (destinationCardsGrid && prevDestinationButton && nextDestinationButton) {
    // Bu bo'lim grid bo'lgani uchun, agar kartalar ko'p bo'lsa, gorizontal skrollni ta'minlashimiz kerak.
    // Hozirgi dizaynda 3 ta karta bor va ular gridda joylashgan.
    // Agar kelajakda kartalar soni ko'paysa va skroll kerak bo'lsa, ushbu kod ishlaydi.
    // Hozircha, agar 3 ta kartadan ortiq bo'lmasa, bu tugmalar sezilarli ta'sir ko'rsatmaydi.

    // Gridni gorizontal aylantirish uchun flex konteynerga aylantirish (faqat mobil uchun)
    // yoki shunchaki skroll funksiyasini qo'shish
    function setupDestinationScroll() {
        if (window.innerWidth < 1024) { // Faqat mobil va tablet ekranlarida skrollni yoqish
            destinationCardsGrid.style.display = 'flex';
            destinationCardsGrid.style.overflowX = 'auto';
            destinationCardsGrid.style.scrollSnapType = 'x mandatory';
            destinationCardsGrid.style.padding = '0 1rem 1rem 1rem';
            destinationCardsGrid.style.gap = '1.5rem';

            // Har bir kartani scroll-snap-align bilan belgilash
            const destinationCards = destinationCardsGrid.querySelectorAll('.destination-card-full');
            destinationCards.forEach(card => {
                card.style.scrollSnapAlign = 'start';
                card.style.flexShrink = '0';
                card.style.width = 'calc(100% - 2rem)'; // Paddingni hisobga olgan holda
            });

            prevDestinationButton.addEventListener('click', () => {
                destinationCardsGrid.scrollBy({
                    left: -destinationCardsGrid.offsetWidth,
                    behavior: 'smooth'
                });
            });

            nextDestinationButton.addEventListener('click', () => {
                destinationCardsGrid.scrollBy({
                    left: destinationCardsGrid.offsetWidth,
                    behavior: 'smooth'
                });
            });
        } else {
            // Desktop uchun grid holatiga qaytarish
            destinationCardsGrid.style.display = 'grid';
            destinationCardsGrid.style.overflowX = 'hidden';
            destinationCardsGrid.style.scrollSnapType = 'none';
            destinationCardsGrid.style.padding = '0';
            destinationCardsGrid.style.gap = '2rem';

            const destinationCards = destinationCardsGrid.querySelectorAll('.destination-card-full');
            destinationCards.forEach(card => {
                card.style.scrollSnapAlign = 'none';
                card.style.flexShrink = 'unset';
                card.style.width = 'auto';
            });
        }
    }

    // Sahifa yuklanganda va o'lcham o'zgarganda funksiyani chaqirish
    window.addEventListener('load', setupDestinationScroll);
    window.addEventListener('resize', setupDestinationScroll);
}


});

/* ======================================================== */
/* === "BIZ QANDAY ISHLAYMIZ?" BO'LIMI UCHUN LOGIKA === */
/* ======================================================== */
document.addEventListener('DOMContentLoaded', function() {

    // 1. Timeline'ni scroll'ga qarab aktivlashtirish
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timelineItems.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, { threshold: 0.5 }); // Elementning 50%i ko'ringanda ishlaydi

        timelineItems.forEach(item => {
            observer.observe(item);
        });
    }

    // 2. Video Lightbox'ni ochish va yopish
    const videoContainer = document.querySelector('.work-video-container');
    const lightbox = document.getElementById('video-lightbox');
    const lightboxCloseBtn = document.querySelector('.lightbox-close');
    const lightboxIframe = lightbox.querySelector('iframe');

    if (videoContainer && lightbox) {
        videoContainer.addEventListener('click', () => {
            const videoId = videoContainer.dataset.youtubeId;
            if (videoId) {
                lightboxIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                lightbox.classList.add('active');
            }
        });

        const closeLightbox = () => {
            lightboxIframe.src = ''; // Videoni to'xtatish uchun
            lightbox.classList.remove('active');
        }

        lightboxCloseBtn.addEventListener('click', closeLightbox);
        
        // Oyna tashqarisiga bosganda ham yopish
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
});

/* ======================================================== */
/* === STATISTIKA BO'LIMI UCHUN RAQAMLAR ANIMATSIYASI === */
/* ======================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Animatsiya qilinadigan bo'limni topamiz
    const statsSection = document.querySelector('.stats-section');
    
    // Agar shunday bo'lim mavjud bo'lsa...
    if (statsSection) {
        
        // IntersectionObserver - element ekranda ko'ringanini kuzatadi
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                
                // Agar element ekranda ko'rinsa...
                if (entry.isIntersecting) {
                    const numberElements = statsSection.querySelectorAll('.stat-number');
                    
                    numberElements.forEach(el => {
                        const target = +el.getAttribute('data-target'); // Maqsadli raqamni olamiz
                        el.innerText = '0'; // Boshlang'ich qiymatni 0 ga tenglaymiz

                        // Raqamni bosqichma-bosqich oshirib boruvchi funksiya
                        const updateCount = () => {
                            const current = +el.innerText.replace(/\D/g, ''); // Hozirgi raqam
                            const increment = target / 100; // Animatsiya tezligi (100 qadamda yetib boradi)

                            if (current < target) {
                                // Raqamni oshirib, formatlab (mingliklarga ajratib) yozamiz
                                el.innerText = Math.ceil(current + increment).toLocaleString('uz-UZ');
                                // Keyingi o'zgarish uchun funksiyani yana chaqiramiz
                                setTimeout(updateCount, 20); // Har 20 millisekundda yangilanadi
                            } else {
                                // Animatsiya tugagach, aniq qiymatni va kerak bo'lsa '+' belgisini qo'yamiz
                                el.innerText = target.toLocaleString('uz-UZ') + (target > 500 ? '+' : '');
                            }
                        };
                        
                        // Animatsiyani boshlaymiz
                        updateCount();
                    });
                    
                    // Animatsiya faqat bir marta ishlashi uchun kuzatuvchini o'chiramiz
                    observer.unobserve(statsSection);
                }
            });
        }, { 
            threshold: 0.4 // Bo'limning 40%i ko'ringanda ishga tushadi
        });

        // Statistika bo'limini kuzatishni boshlaymiz
        counterObserver.observe(statsSection);
    }


    // =========================================================
    // === YANGI: TIL TANLASH MENYUSI UCHUN LOGIKA ===
    // =========================================================
    
    // Har bir til tanlash komponenti uchun alohida sozlash funksiyasi
    const setupLanguageSelector = (buttonId, dropdownId, textId) => {
        const langButton = document.getElementById(buttonId);
        const langDropdown = document.getElementById(dropdownId);
        const selectedLangText = document.getElementById(textId);

        if (!langButton || !langDropdown || !selectedLangText) return;

        // Ochish/yopish logikasi
        langButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Ota elementga bosish tarqalishini to'xtatish
            const isShown = langDropdown.classList.toggle('show');
            langButton.classList.toggle('active', isShown);
        });

    };

    // Desktop va mobil uchun til tanlagichlarni sozlash
    setupLanguageSelector('desktop-lang-btn', 'desktop-lang-dropdown', 'desktop-selected-lang-text');
    // Yangi mobil til tanlash menyusi uchun chaqiruv
    setupLanguageSelector('mobile-header-lang-btn', 'mobile-header-lang-dropdown', 'mobile-header-selected-lang-text');


    // Hujjatning istalgan joyiga bosganda ochiq menyularni yopish
    document.addEventListener('click', () => {
        document.querySelectorAll('.language-dropdown.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        document.querySelectorAll('.language-selector-btn.active').forEach(button => {
            button.classList.remove('active');
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Sahifa to'liq yuklanishini kutmasdan, DOM tayyor bo'lganda preloaderni yashirish
        preloader.classList.add('preloader-hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 800);
    }
    
    // --- Telefon raqam uchun maska ---
    const phoneInput = document.getElementById('phone-number');
    if(phoneInput) {
        const prefix = '+998';
        phoneInput.addEventListener('input', (e) => {
            const input = e.target;
            let value = input.value;
            if (!value.startsWith(prefix)) {
                input.value = prefix;
                return;
            }
            const userDigits = value.substring(prefix.length).replace(/\D/g, '');
            let formattedNumber = '';
            if (userDigits.length > 0) formattedNumber += ' (' + userDigits.substring(0, 2);
            if (userDigits.length > 2) formattedNumber += ') ' + userDigits.substring(2, 5);
            if (userDigits.length > 5) formattedNumber += '-' + userDigits.substring(5, 7);
            if (userDigits.length > 7) formattedNumber += '-' + userDigits.substring(7, 9);
            input.value = prefix + formattedNumber;
        });
    }

    // --- Modal oyna logikasi ---
    const form = document.getElementById('consultation-form');
    const statusModal = document.getElementById('status-modal');
    if (form && statusModal) {
        const modalIconContainer = document.getElementById('modal-icon-container');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showModal('success', 'Muvaffaqiyatli!', 'Murojaatingiz qabul qilindi! Tez orada operatorlarimiz siz bilan bog\'lanishadi.');
            form.reset();
        });

        const showModal = (type, title, message) => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            if (type === 'success') {
                modalIconContainer.innerHTML = `<div class="success-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
            } else {
                modalIconContainer.innerHTML = `<div class="error-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>`;
            }
            statusModal.classList.add('show');
        };

        const closeModalWindow = () => {
            statusModal.classList.remove('show');
        };

        modalCloseBtn.addEventListener('click', closeModalWindow);
        statusModal.addEventListener('click', (e) => {
            if (e.target === statusModal) {
                closeModalWindow();
            }
        });
    }

    // =========================================================
    // === MOBIL MENYU UCHUN YANGI VA TO'G'IRLANGAN LOGIKA ===
    // =========================================================
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const navPanel = document.getElementById('header-nav');

    if (hamburgerBtn && navPanel) {
        const navLinks = navPanel.querySelectorAll('a');

        const openMenu = () => {
            navPanel.classList.add('active');
            hamburgerBtn.classList.add('active');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            document.body.classList.add('nav-open'); // Orqa fonni qimirlatmaslik uchun
        };

        const closeMenu = () => {
            navPanel.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        };

        const toggleMenu = () => {
            const isActive = navPanel.classList.contains('active');
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        // Gamburger tugmasi bosilganda menyuni ochish/yopish
        hamburgerBtn.addEventListener('click', toggleMenu);

        // Menyudagi biror link bosilsa, menyu yopiladi
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Escape tugmasi bosilganda menyuni yopish
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navPanel.classList.contains('active')) {
                closeMenu();
            }
        });
    }
});

// PRELOADER MANTIG'I (YANGI QO'SHILDI)
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Animatsiya ko'rinishi uchun kichik kechiktirish
        setTimeout(() => {
                preloader.classList.add('hidden');
        }, 200); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bitrixForm');
    const submitButton = document.getElementById('submitButton');
    const statusMessage = document.getElementById('statusMessage');
    const medicalFilesInput = document.getElementById('medicalFiles');
    const fileListDisplay = document.getElementById('fileList');
    const fileNameDisplay = document.getElementById('fileName');
    const dropZone = document.getElementById('dropZone');
    
    let selectedFiles = [];

    const modal = document.getElementById('formModal');
    const modalContent = modal.querySelector('.modal-content');
    const openModalButtons = document.querySelectorAll('#openModalBtn, #openModalBtnMobile, #openModalBtnHero');
    const closeBtn = document.getElementById('closeModalBtn');

    const successModal = document.getElementById('successModal');
    const successModalContent = successModal.querySelector('.success-modal-content');
    const closeSuccessBtn = document.getElementById('closeSuccessModalBtn');

    // --- NAVIGATSIYA MENYUSI UCHUN ELEMENTLAR (YANGI QO'SHILDI) ---
    const navMenu = document.getElementById('header-nav');
    const hamburgerMenu = document.getElementById('hamburger-menu');

    // --- MAXFIY KALITLAR "config.js" FAYLIDAN O'QILADI ---

    // Tug'ilgan sana maydonini sozlash (kengaytirilgan)
    const dobPicker = flatpickr("#dob", {
        locale: "uz_latn",
        altInput: true,
        altFormat: "d.m.Y",
        dateFormat: "Y-m-d",
        allowInput: true,
        defaultDate: null, // Avtomatik sana kiritilmasligi uchun
        maxDate: "today", // <<-- XATOLIK TUZATILDI: Kelajakdagi sanani tanlashni cheklash
        onOpen: function(selectedDates, dateStr, instance) {
            // Agar sana tanlanmagan bo'lsa, kalendarni 1990-yilga o'tkazish
            if (selectedDates.length === 0) {
                instance.jumpToDate("1990-01-01");
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            if (instance.altInput) {
                // Qo'lda kiritish uchun niqob va cheklovlar
                IMask(instance.altInput, {
                    mask: Date,
                    pattern: 'd.m.Y',
                    lazy: false,
                    placeholderChar: '_',
                    // Kun, oy va yil uchun cheklovlar
                    blocks: {
                        d: {
                            mask: IMask.MaskedRange,
                            from: 1,
                            to: 31,
                            maxLength: 2,
                        },
                        m: {
                            mask: IMask.MaskedRange,
                            from: 1,
                            to: 12,
                            maxLength: 2,
                        },
                        Y: {
                            mask: IMask.MaskedRange,
                            from: 1900,
                            to: new Date().getFullYear() // <<-- XATOLIK TUZATILDI: Joriy yil bilan cheklash
                        }
                    },
                    // IMask va Flatpickr o'rtasida sanani sinxronlashtirish
                    format: function(date) {
                        let day = String(date.getDate()).padStart(2, '0');
                        let month = String(date.getMonth() + 1).padStart(2, '0');
                        let year = date.getFullYear();
                        return [day, month, year].join('.');
                    },
                    parse: function(str) {
                        const [day, month, year] = str.split('.');
                        // Sanani to'g'ri formatda qaytarish
                        return new Date(year, month - 1, day);
                    },
                    autofix: true // Kiritishda xatoliklarni avtomatik to'g'irlash
                });
            }
        }
    });

    const phoneMask = IMask(document.getElementById('phone'), { mask: '(00) 000-00-00' });

    const saveFormData = () => {
        localStorage.setItem('formData', JSON.stringify({
            name: document.getElementById('name').value, dob: document.getElementById('dob').value,
            phone: phoneMask.unmaskedValue, email: document.getElementById('email').value,
            requirements: document.getElementById('requirements').value,
        }));
    };
    const loadFormData = () => {
        const data = JSON.parse(localStorage.getItem('formData'));
        if (data) {
            document.getElementById('name').value = data.name || '';
            dobPicker.setDate(data.dob || '', true);
            phoneMask.value = data.phone || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('requirements').value = data.requirements || '';
        }
    };
    form.querySelectorAll('input, textarea').forEach(input => {
        if(input.type !== 'file') input.addEventListener('input', saveFormData);
    });

    // --- MOBIL MENYUNI YOPISH FUNKSIYASI (YANGI QO'SHILDI) ---
    const closeNavMenu = () => {
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    };

    const openModal = () => {
        closeNavMenu(); // <<< O'ZGARTIRISH: Modal ochilishidan oldin menyuni yopish
        loadFormData();
        document.body.classList.add('modal-open');
        modal.classList.remove('invisible', 'opacity-0');
        modalContent.classList.remove('scale-95');
    };
    const closeModal = () => {
        document.body.classList.remove('modal-open');
        modal.classList.add('opacity-0');
        modalContent.classList.add('scale-95');
        setTimeout(() => modal.classList.add('invisible'), 300);
    };
    const openSuccessModal = () => {
        closeModal();
        successModal.classList.remove('invisible', 'opacity-0');
        successModalContent.classList.remove('scale-95');
    }
    const closeSuccessModal = () => {
        successModal.classList.add('opacity-0');
        successModalContent.classList.add('scale-95');
        setTimeout(() => successModal.classList.add('invisible'), 300);
    }

    openModalButtons.forEach(btn => btn.addEventListener('click', openModal));
    closeBtn.addEventListener('click', closeModal);
    closeSuccessBtn.addEventListener('click', closeSuccessModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
                modalContent.classList.add('shake');
                setTimeout(() => modalContent.classList.remove('shake'), 820);
        }
    });

    const handleFiles = (files) => {
        Array.from(files).forEach(file => {
            if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                selectedFiles.push(file);
            }
        });
        renderFileList();
    };
    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'ph-file-pdf';
        if (['doc', 'docx'].includes(ext)) return 'ph-file-doc';
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'ph-image';
        return 'ph-file';
    };
    const renderFileList = () => {
        fileListDisplay.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = "inline-flex items-center bg-gray-100 rounded-md py-1.5 pl-2 pr-1 text-xs transition-all max-w-full";
            fileElement.innerHTML = `<i class="ph ${getFileIcon(file.name)} text-lg mr-2 text-gray-500 flex-shrink-0"></i><span class="truncate min-w-0" title="${file.name}">${file.name}</span><button type="button" data-index="${index}" class="remove-file-btn ml-2 flex-shrink-0 text-red-500 hover:text-red-700 p-1"><i class="ph-bold ph-x"></i></button>`;
            fileListDisplay.appendChild(fileElement);
        });
        fileNameDisplay.textContent = selectedFiles.length > 0 ? `${selectedFiles.length} ta fayl tanlandi` : 'Fayllarni tanlang yoki bu yerga tashlang';
    };
    medicalFilesInput.addEventListener('change', (e) => handleFiles(e.target.files));
    fileListDisplay.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-file-btn');
        if (removeBtn) {
            selectedFiles.splice(parseInt(removeBtn.dataset.index, 10), 1);
            renderFileList();
        }
    });
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); });
    });
    ['dragenter', 'dragover'].forEach(eventName => dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover')));
    ['dragleave', 'drop'].forEach(eventName => dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover')));
    dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (selectedFiles.length === 0) {
            showError("Iltimos, kamida bitta tibbiy fayl yuklang."); return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = 'Yuborilmoqda... <i class="ph-bold ph-spinner-gap animate-spin ml-2"></i>';
        statusMessage.textContent = '';

        let filesDataForBitrix = [];
        try {
                for (const file of selectedFiles) {
                filesDataForBitrix.push([file.name, await toBase64(file)]);
            }
        } catch (error) {
            showError("Fayllarni o'qishda xatolik.");
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="ph ph-paper-plane-tilt text-xl mr-2"></i> Yuborish';
            return;
        }
        
        try {
            const [bitrixResult, telegramResult] = await Promise.all([
                sendToBitrix(filesDataForBitrix),
                sendToTelegram(selectedFiles)
            ]);

            if ((bitrixResult && bitrixResult.result) || (telegramResult && telegramResult.ok)) {
                localStorage.removeItem('formData');
                form.reset();
                phoneMask.value = '';
                selectedFiles = [];
                renderFileList();
                openSuccessModal();
            } else {
                let errorMessage = 'Xatolik yuz berdi. ';
                if (bitrixResult && bitrixResult.error_description) errorMessage += `Bitrix24: ${bitrixResult.error_description}. `;
                if (telegramResult && telegramResult.description) errorMessage += `Telegram: ${telegramResult.description}.`;
                showError(errorMessage.trim());
            }
        } catch (error) {
            console.error("Submission Error:", error);
            showError("Server bilan bog'lanishda xatolik. Iltimos, keyinroq urinib ko'ring.");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="ph ph-paper-plane-tilt text-xl mr-2"></i> Yuborish`;
        }
    });

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });

    function showError(message) {
        statusMessage.textContent = message;
        statusMessage.className = 'mt-4 text-center text-sm font-medium text-red-600';
    }

    const getFormData = () => ({
        name: document.getElementById('name').value, dob: document.getElementById('dob').value,
        phone: '+998' + phoneMask.unmaskedValue, email: document.getElementById('email').value,
        requirements: document.getElementById('requirements').value,
    });
    
    function sendToBitrix(filesData) {
        if (typeof BITRIX_WEBHOOK_URL === 'undefined' || !BITRIX_WEBHOOK_URL) {
            console.warn("Bitrix24 webhook URL o'rnatilmagan.");
            return Promise.resolve({ result: null, error_description: "Webhook URL not configured." });
        }
        const formData = getFormData();
        const data = {
            fields: {
                TITLE: `Saytdan yangi ariza: ${formData.name}`,
                NAME: formData.name,
                PHONE: [{ VALUE: formData.phone, VALUE_TYPE: "WORK" }],
                EMAIL: [{ VALUE: formData.email, VALUE_TYPE: "WORK" }],
                COMMENTS: `Bemor kasalliklari: ${formData.requirements}`,
                BIRTHDATE: formData.dob,
                SOURCE_ID: "WEB"
            }
        };
        
        if (filesData.length > 0 && typeof CUSTOM_LEAD_FILE_FIELD_ID !== 'undefined' && CUSTOM_LEAD_FILE_FIELD_ID) {
            data.fields[CUSTOM_LEAD_FILE_FIELD_ID] = filesData;
        }
        
        return fetch(BITRIX_WEBHOOK_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data) 
        }).then(res => res.json());
    }
    
    async function sendToTelegram(files) {
        if (typeof TELEGRAM_BOT_TOKEN === 'undefined' || typeof TELEGRAM_CHAT_ID === 'undefined') {
            console.warn("Telegram bot token yoki chat ID o'rnatilmagan.");
            return Promise.resolve({ok: false, description: "Bot sozlanmagan"});
        }
        const formData = getFormData();
        let caption = `<b>Saytdan yangi ariza!</b>\n\n`;
        caption += `<b>👤 Ism:</b> ${formData.name}\n<b>📅 T. Sana:</b> ${formData.dob}\n`;
        caption += `<b>📞 Telefon:</b> <code>${formData.phone}</code>\n<b>📧 Email:</b> ${formData.email || "Kiritilmagan"}\n`;
        caption += `<b>📝 Izohlar:</b>\n${formData.requirements || "Kiritilmagan"}`;
        
        const tgFormData = new FormData();
        tgFormData.append('chat_id', TELEGRAM_CHAT_ID);
        
        if (files.length === 0) {
            tgFormData.append('text', caption);
            tgFormData.append('parse_mode', 'HTML');
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            return fetch(url, { method: 'POST', body: tgFormData }).then(res => res.json());
        }
        
        const mediaToSend = files.slice(0, 10).map((file, index) => {
            const fileKey = `file${index}`;
            tgFormData.append(fileKey, file);
            return { type: 'document', media: `attach://${fileKey}`, caption: index === 0 ? caption : undefined, parse_mode: 'HTML' };
        });

        tgFormData.append('media', JSON.stringify(mediaToSend));
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`;
        return fetch(url, { method: 'POST', body: tgFormData }).then(res => res.json());
    }
});