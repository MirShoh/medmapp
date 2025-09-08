document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('preloader-hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 800);
    }
    
    // Header scroll effekti
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    // Faqat mobil qurilmalar uchun scroll effektini ishga tushirish
    if (window.innerWidth < 1024) {
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
                // Pastga scroll
                header.style.top = `-${header.offsetHeight}px`;
            } else {
                // Tepaga scroll
                header.style.top = '0';
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
        }, false);
    }

    // --- Telefon raqam uchun maska ---
    const phoneInput = document.getElementById('phone-number');
    const prefix = '+998';
    if(phoneInput) {
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
    const modalIconContainer = document.getElementById('modal-icon-container');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showModal('success', 'Muvaffaqiyatli!', 'Murojaatingiz qabul qilindi! Tez orada operatorlarimiz siz bilan bog\'lanishadi.');
            form.reset();
        });
    }

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

});