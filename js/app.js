document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Theme Switcher (Claro / Oscuro) ---
    const toggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    toggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
    });

    // --- 2. Mobile Menu Toggle ---
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileBtn && mainNav) {
        mobileBtn.addEventListener('click', () => {
            const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true' || false;
            mobileBtn.setAttribute('aria-expanded', !isExpanded);
            mobileBtn.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.setAttribute('aria-expanded', 'false');
                mobileBtn.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // --- 3. Sticky Header on Scroll ---
    const header = document.getElementById('header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    // --- 4. Animaciones de Scroll (Intersection Observer) ---
    // Handle both single elements (.fade-up) and staggered containers (.stagger-up)
    const animateElements = document.querySelectorAll('.fade-up, .stagger-up');
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const appearOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const appearOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, appearOptions);

        animateElements.forEach(el => {
            appearOnScroll.observe(el);
        });
    } else {
        // Fallback or if user prefers reduced motion
        animateElements.forEach(el => el.classList.add('visible'));
    }

    // --- 6. Form Validation ---
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const ruc = document.getElementById('ruc').value.trim();
            const btn = form.querySelector('button[type="submit"]');
            
            // Regex for DNI (8 digits) or RUC (11 digits)
            const rucRegex = /^(?:[0-9]{8}|[0-9]{11})$/;
            if(!rucRegex.test(ruc)) {
                alert("Por favor ingrese un DNI (8 dígitos) o RUC (11 dígitos) válido, sin espacios ni letras.");
                document.getElementById('ruc').focus();
                return;
            }

            // Real form submission via fetch
            const originalText = btn.innerText;
            btn.innerHTML = '<svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;margin-right:10px;animation:rotate 2s linear infinite;"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" style="stroke-dasharray:1,200;stroke-dashoffset:0;animation:dash 1.5s ease-in-out infinite;stroke-linecap:round;"></circle></svg> Enviando...';
            btn.disabled = true;

            const formData = new FormData(form);

            fetch('send_mail.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.status === 'success') {
                    alert("Su solicitud ha sido enviada con éxito. Un asesor comercial se comunicará a la brevedad.");
                    form.reset();
                } else {
                    alert("Error: " + (data.message || "No se pudo enviar el correo."));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Hubo un problema de conexión. Intente nuevamente.");
            })
            .finally(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        });
    }

    // --- 7. Hero Background Carousel ---
    const heroSection = document.querySelector('.hero-bg-overlay');
    if (heroSection && !prefersReducedMotion) {
        const heroImages = [
            'assets/images/hero_1.webp',
            'assets/images/hero_2.webp',
            'assets/images/hero_3.webp'
        ];
        let currentImageIndex = 0;

        // Preload
        heroImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % heroImages.length;
            heroSection.style.backgroundImage = `url('${heroImages[currentImageIndex]}')`;
        }, 6000);
    }

    // --- 8. Project Cards Image Carousel ---
    const projectCarousels = document.querySelectorAll('.carousel-img');
    if(!prefersReducedMotion) {
        projectCarousels.forEach(img => {
            const imagesList = img.getAttribute('data-images');
            if(!imagesList) return;
            
            const images = imagesList.split(',');
            if (images.length > 1) {
                let currentIndex = 0;
                
                // Preload
                images.forEach(src => {
                    const preImg = new Image();
                    preImg.src = src;
                });

                setInterval(() => {
                    img.style.opacity = 0; 
                    setTimeout(() => {
                        currentIndex = (currentIndex + 1) % images.length;
                        img.src = images[currentIndex];
                        img.style.opacity = 1; 
                    }, 500); 
                }, 5000); 
            }
        });
    }
});
