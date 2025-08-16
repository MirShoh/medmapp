// DOM elementlariga murojaat qilish
            const residentSelect = document.getElementById('resident-of');
            const treatmentSelect = document.getElementById('treatment');
            const phoneNumberInput = document.getElementById('phone-number');
            const mainSearchInput = document.getElementById('main-search-input');
            const chatButton = document.getElementById('chat-button');
            const requestAppointmentButtons = document.querySelectorAll('.request-appointment-button');

            // Boshlang'ich qiymatlarni o'rnatish
            residentSelect.value = 'uzbekistan';
            treatmentSelect.value = 'angiography';
            phoneNumberInput.value = '+998';

            // Qidiruv funksiyasi
            function handleSearch(query) {
                console.log('Qidirilmoqda:', query);
                // Haqiqiy ilovada bu qidiruv natijalarini olish uchun API chaqiruvini ishga tushiradi
                // Siz bu yerga Django backend-ingizga so'rov yuborish kodini qo'shishingiz mumkin.
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

            // Carousel navigatsiya funksionalligi
            const hospitalCarousel = document.getElementById('hospitalCarousel');
            const prevHospitalButton = document.getElementById('prevHospital');
            const nextHospitalButton = document.getElementById('nextHospital');

            if (hospitalCarousel && prevHospitalButton && nextHospitalButton) {
                prevHospitalButton.addEventListener('click', () => {
                    hospitalCarousel.scrollBy({
                        left: -hospitalCarousel.offsetWidth / 2, // Yarim ekran bo'yicha orqaga aylantirish
                        behavior: 'smooth'
                    });
                });

                nextHospitalButton.addEventListener('click', () => {
                    hospitalCarousel.scrollBy({
                        left: hospitalCarousel.offsetWidth / 2, // Yarim ekran bo'yicha oldinga aylantirish
                        behavior: 'smooth'
                    });
                });
            }

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

document.addEventListener('DOMContentLoaded', function () {
const header = document.querySelector('.header');
const nav = document.querySelector('.header-nav');
const hamburger = document.querySelector('.hamburger-menu');

// Gamburger menyuni ochish/yopish
if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
        // Ikonkani o'zgartirish (ixtiyoriy, xochga aylantirish uchun)
        if (nav.classList.contains('active')) {
            hamburger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        } else {
            hamburger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
        }
    });
}

// Sahifa scroll qilinganda headerga 'scrolled' classini qo'shish/olib tashlash
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
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
    const statsSection = document.querySelector('.stats-section');
    
    if (statsSection) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numberElements = statsSection.querySelectorAll('.stat-number');
                    numberElements.forEach(el => {
                        const target = +el.getAttribute('data-target');
                        el.innerText = '0'; // Boshlang'ich qiymat

                        const updateCount = () => {
                            const current = +el.innerText;
                            const increment = target / 100; // Animatsiya tezligi

                            if (current < target) {
                                el.innerText = `${Math.ceil(current + increment)}`;
                                setTimeout(updateCount, 20); // Har 20ms da yangilash
                            } else {
                                el.innerText = target.toLocaleString() + (el.dataset.target > 500 ? '+' : '');
                            }
                        };
                        updateCount();
                    });
                    observer.unobserve(statsSection); // Animatsiya bir marta ishlashi uchun
                }
            });
        }, { threshold: 0.4 }); // Bo'limning 40%i ko'ringanda ishlaydi

        counterObserver.observe(statsSection);
    }
});

