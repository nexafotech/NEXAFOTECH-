// ── Device Detection ──
const isMobile = window.innerWidth <= 768;
// Many Windows laptops have touch screens (maxTouchPoints > 0). We only want to disable heavy effects on actual mobile phones.
const isTouchDevice = isMobile || (('ontouchstart' in window) && navigator.userAgent.toLowerCase().match(/mobile/i));

// ── Throttle helper ──
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ── Navbar scroll effect ──
window.addEventListener('scroll', throttle(() => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
}, 100));

// ── Mouse Cursor Glow Tracker (desktop only) ──
if (!isTouchDevice) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
}

// ── Parallax Scroll ──
if (!isMobile) {
    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY;
        document.querySelectorAll('.glow-orb').forEach(orb => {
            orb.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.05}px))`;
        });
    }, 50));
}

// ── Lenis Smooth Scroll (desktop only) ──
let lenis;
if (!isTouchDevice) {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Update ScrollTrigger whenever Lenis scrolls
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker with Lenis requestAnimationFrame
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);
}

// ── GSAP Kinetic Typography (SplitType) ──
// Split text for hero title
const heroTitleSplit = new SplitType('.hero h1', { types: 'words, chars' });
gsap.from(heroTitleSplit.chars, {
    duration: 1,
    y: 100,
    opacity: 0,
    rotationX: -90,
    stagger: 0.05,
    ease: "back.out(1.7)",
    delay: 0.2
});

// Split text for section titles
const sectionTitles = document.querySelectorAll('.section-title');
sectionTitles.forEach(title => {
    const splitTitle = new SplitType(title, { types: 'words, chars' });
    gsap.from(splitTitle.chars, {
        scrollTrigger: {
            trigger: title,
            start: "top 85%",
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        rotationX: -90,
        stagger: 0.03,
        ease: "back.out(1.2)"
    });
});

// ── GSAP Staggered Reveals ──
// Replace old .anim-fade with GSAP scroll triggers
const sections = document.querySelectorAll('.section');
sections.forEach(sec => {
    const fadeElements = sec.querySelectorAll('.anim-fade, .reveal, .team-card, .faq-item, .svc-slice');
    if (fadeElements.length > 0) {
        gsap.fromTo(fadeElements, 
            { opacity: 0, y: 50 },
            {
                scrollTrigger: {
                    trigger: sec,
                    start: "top 75%",
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out"
            }
        );
    }
});

// ── Number Counter Animation (GSAP) ──
document.querySelectorAll('.step-num, .counter-num').forEach(el => {
    const text = el.innerText;
    const targetMatch = text.match(/\d+/);
    if (targetMatch) {
        const target = parseInt(targetMatch[0], 10);
        const prefix = text.substring(0, targetMatch.index);
        const suffix = text.substring(targetMatch.index + targetMatch[0].length);
        
        let obj = { val: 0 };
        gsap.to(obj, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%"
            },
            val: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
                let current = Math.floor(obj.val);
                el.innerText = prefix + (current < 10 ? '0'+current : current) + suffix;
            }
        });
    }
});

// ── Scroll-Scrubbed Parallax & Pinning ──
// Pin Hero Section and scale down orb on scroll
gsap.to('.orb-container', {
    scrollTrigger: {
        trigger: '.hero',
        start: "top top",
        end: "bottom top",
        scrub: true
    },
    scale: 0.5,
    opacity: 0.2,
    y: 200
});

// Services Image Parallax (Desktop Only)
let mm = gsap.matchMedia();
mm.add("(min-width: 769px)", () => {
    gsap.utils.toArray('.svc-slice').forEach(slice => {
        const img = slice.querySelector('.svc-bg');
        if (img) {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: slice,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                y: -100, // Move image up slightly as we scroll down
                ease: "none"
            });
        }
    });
});

// ── 3D Hero Perspective removed per request ──
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
    // Hover perspective removed
}

// ── Scroll Progress Bar ──
window.addEventListener('scroll', throttle(() => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progress = document.getElementById('scroll-progress');
    if (progress) progress.style.width = scrolled + '%';
}, 50));

// ── Spotlight Effect for Services ──
document.querySelectorAll('.svc-slice').forEach(slice => {
    slice.addEventListener('mousemove', (e) => {
        const rect = slice.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        slice.style.setProperty('--mouse-x', `${x}px`);
        slice.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ── Magnetic Elements (desktop only) ──
if (!isTouchDevice) {
    document.querySelectorAll('.magnetic-link, .magnetic-btn, .hiw-step-icon').forEach(el => {
        const xTo = gsap.quickTo(el, "x", {duration: 1, ease: "elastic.out(1, 0.3)"});
        const yTo = gsap.quickTo(el, "y", {duration: 1, ease: "elastic.out(1, 0.3)"});
        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;
            xTo(relX * 0.4);
            yTo(relY * 0.4);
        });
        el.addEventListener("mouseleave", () => {
            xTo(0);
            yTo(0);
        });
    });
}

// ── Process Timeline Horizontal Slide-in ──
gsap.fromTo('.timeline-step', 
    { x: 150, opacity: 0 },
    {
        scrollTrigger: {
            trigger: '.timeline',
            start: "top 85%",
            end: "bottom 60%",
            scrub: 1
        },
        x: 0,
        opacity: 1,
        stagger: 0.1,
        ease: "power2.out"
    }
);

// ── Bento Grid UI/UX Interactions ──
// ═══════════ NEW UX BENTO INTERACTIONS ═══════════
if (!isTouchDevice) {
    const bentoCursor = document.getElementById('bentoCursor');
    if (bentoCursor) {
        document.querySelectorAll('.bento-card').forEach(card => {
            card.addEventListener('mouseenter', () => bentoCursor.style.opacity = '1');
            card.addEventListener('mouseleave', () => bentoCursor.style.opacity = '0');
        });
        
        document.addEventListener('mousemove', (e) => {
            if(bentoCursor.style.opacity === '1') {
                bentoCursor.style.left = e.clientX + 'px';
                bentoCursor.style.top = e.clientY + 'px';
            }
        });
    }
}

// 1. Hacker Text
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
const hackerCard = document.getElementById('hackerCard');
const hackerText = hackerCard ? hackerCard.querySelector('.hacker-text') : null;
let hackerInterval = null;

if(hackerCard && hackerText) {
    const playHackerAnim = () => {
        let iterations = 0;
        clearInterval(hackerInterval);
        hackerInterval = setInterval(() => {
            hackerText.innerText = hackerText.innerText.split("")
                .map((letter, index) => {
                    if(index < iterations) return hackerText.dataset.value[index];
                    return letters[Math.floor(Math.random() * letters.length)];
                }).join("");
            if(iterations >= hackerText.dataset.value.length) clearInterval(hackerInterval);
            iterations += 1 / 3;
        }, 30);
    };
    
    hackerCard.addEventListener('mouseenter', playHackerAnim);
    
    // Also play once when scrolled into view (for mobile devices without hover)
    const observer = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting) {
            setTimeout(playHackerAnim, 500);
            observer.disconnect();
        }
    }, { threshold: 0.5 });
    observer.observe(hackerCard);
}

// 2. Glass Parallax
if (!isTouchDevice) {
    const glassCard = document.getElementById('glassCard');
    const panes = glassCard ? glassCard.querySelectorAll('.glass-pane') : [];
    if(glassCard && panes.length === 3) {
        glassCard.addEventListener('mousemove', (e) => {
            const rect = glassCard.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width/2) / 10;
            const y = (e.clientY - rect.top - rect.height/2) / 10;
            
            panes[0].style.transform = `translateZ(-100px) rotateY(${-15 + x}deg) rotateX(${-y}deg) translateX(-50px)`;
            panes[1].style.transform = `translateZ(0px) rotateY(${x * 1.5}deg) rotateX(${-y * 1.5}deg)`;
            panes[2].style.transform = `translateZ(100px) rotateY(${15 + x * 2}deg) rotateX(${-y * 2}deg) translateX(50px)`;
        });
        glassCard.addEventListener('mouseleave', () => {
            panes[0].style.transform = `translateZ(-100px) rotateY(-15deg) translateX(-50px)`;
            panes[1].style.transform = `translateZ(0px)`;
            panes[2].style.transform = `translateZ(100px) rotateY(15deg) translateX(50px)`;
        });
    }
}

// 3. Cyber Mask Reveal
if (!isTouchDevice) {
    const maskCard = document.getElementById('maskCard');
    if(maskCard) {
        maskCard.addEventListener('mousemove', (e) => {
            const rect = maskCard.getBoundingClientRect();
            maskCard.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            maskCard.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
    }
}

// 4. Fluid Gooey
if (!isTouchDevice) {
    const gooeyCard = document.getElementById('gooeyCard');
    if(gooeyCard) {
        gooeyCard.addEventListener('mousemove', (e) => {
            const rect = gooeyCard.getBoundingClientRect();
            gooeyCard.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            gooeyCard.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
    }
}

// 5. Interactions List dot
const intList = document.getElementById('intList');
if(intList) {
    const intItems = intList.querySelectorAll('.int-item');
    const intDot = document.getElementById('intDot');
    setTimeout(() => {
        if(intItems.length > 0) {
            intDot.style.transform = `translateY(${intItems[0].offsetTop}px)`;
        }
    }, 500);
    intItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            intItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            intDot.style.transform = `translateY(${item.offsetTop}px)`;
        });
    });
}

// 6. Variable Font Slider
const varSlider = document.getElementById('varSlider');
const varText = document.getElementById('varText');
if(varSlider && varText) {
    varSlider.addEventListener('input', (e) => {
        varText.style.fontWeight = e.target.value;
        varText.style.letterSpacing = (e.target.value / 100) + 'px';
    });
}

// 7. Custom Cursor
if (!isTouchDevice) {
    const cursorCard = document.getElementById('cursorCard');
    const customCursor = document.getElementById('customCursor');
    if(cursorCard && customCursor) {
        const xCursor = gsap.quickTo(customCursor, "x", {duration: 0.3, ease: "power3"});
        const yCursor = gsap.quickTo(customCursor, "y", {duration: 0.3, ease: "power3"});
        cursorCard.addEventListener('mousemove', (e) => {
            const rect = cursorCard.getBoundingClientRect();
            xCursor(e.clientX - rect.left);
            yCursor(e.clientY - rect.top);
        });
    }
}

// 8. Magnetic Button Demo
if (!isTouchDevice) {
    const magBtnDemo = document.getElementById('magBtnDemo');
    if (magBtnDemo) {
        const xBtn = gsap.quickTo(magBtnDemo, "x", {duration: 1, ease: "elastic.out(1, 0.3)"});
        const yBtn = gsap.quickTo(magBtnDemo, "y", {duration: 1, ease: "elastic.out(1, 0.3)"});
        
        magBtnDemo.parentElement.addEventListener("mousemove", (e) => {
            const rect = magBtnDemo.parentElement.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;
            xBtn(relX * 0.5);
            yBtn(relY * 0.5);
        });
        
        magBtnDemo.parentElement.addEventListener("mouseleave", () => {
            xBtn(0); yBtn(0);
        });
    }
}

// 9. 3D Spatial Tilt Demo
if (!isTouchDevice) {
    const tiltCard = document.getElementById('tiltCard');
    const tiltEl = document.getElementById('tiltEl');
    if (tiltCard && tiltEl) {
        const xTilt = gsap.quickTo(tiltEl, "rotationY", {duration: 0.5, ease: "power3"});
        const yTilt = gsap.quickTo(tiltEl, "rotationX", {duration: 0.5, ease: "power3"});
        
        tiltCard.addEventListener('mousemove', (e) => {
            const rect = tiltCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotX = ((y / rect.height) - 0.5) * -30;
            const rotY = ((x / rect.width) - 0.5) * 30;
            xTilt(rotY);
            yTilt(rotX);
        });
        
        tiltCard.addEventListener('mouseleave', () => {
            xTilt(0); yTilt(0);
        });
    }
}

// ── Hero entrance animation ──
setTimeout(() => {
    const hc = document.getElementById('heroContent');
    const hv = document.getElementById('heroVisual');
    if (hc) { hc.style.transition = 'all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; hc.style.opacity = '1'; hc.style.transform = 'translateY(0)'; }
    if (hv) { hv.style.transition = 'all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s'; hv.style.opacity = '1'; hv.style.transform = 'translateX(0)'; }
}, 100);

// Orb image slider animation
const slides = document.querySelectorAll('.orb-slide');
if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 4000); // 3 seconds per image + 1 second transition
}

// ── High-Tech Text Scramble (Decoder Effect) ──
if (!isTouchDevice) {
    const chars = "!<>-_\\\\/[]{}—=+*^?#________";
    document.querySelectorAll('.logo-name, .magnetic-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const originalText = el.innerText;
            if(el.dataset.scrambling === "true") return;
            el.dataset.scrambling = "true";
            
            let iteration = 0;
            const interval = setInterval(() => {
                el.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if(index < iteration) return originalText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");
                
                if(iteration >= originalText.length){ 
                    clearInterval(interval);
                    el.innerHTML = originalText.replace('TECH', '<span class="accent">TECH</span>'); 
                    el.dataset.scrambling = "false";
                }
                iteration += 1 / 2; 
            }, 30);
        });
    });
}

// ── FAQ accordion ──
function toggleFAQ(el) {
    const item = el.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
}

// ── How It Works Arch Logic ──
function toggleHIW(index) {
    document.querySelectorAll('.hiw-item').forEach(item => {
        if (parseInt(item.getAttribute('data-step')) === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    document.querySelectorAll('.hiw-step-icon').forEach(icon => {
        if (parseInt(icon.getAttribute('data-index')) === index) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
}

// ── Hamburger menu toggle ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
    });
    // Close on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });
    // Close on outside tap
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        }
    });
}

// ═══════════ CONTACT — NEURAL NETWORK CANVAS ═══════════
(function() {
    const canvas = document.getElementById('contactCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const section = document.getElementById('contact');
    let mouse = { x: -1000, y: -1000 };
    let particles = [];
    const PARTICLE_COUNT = isMobile ? 30 : 80;
    const CONNECT_DIST = isMobile ? 100 : 150;
    const MOUSE_DIST = 200;

    function resize() {
        const rect = section.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Track mouse relative to section
    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    section.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * (canvas.width || 1400),
            y: Math.random() * (canvas.height || 700),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 1,
            color: Math.random() > 0.7 ? 'rgba(255,81,35,' : 'rgba(255,255,255,'
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // Mouse attraction
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_DIST) {
                p.vx += dx * 0.0003;
                p.vy += dy * 0.0003;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + (0.4 + (dist < MOUSE_DIST ? 0.4 : 0)) + ')';
            ctx.fill();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const alpha = (1 - dist / CONNECT_DIST) * 0.15;
                    ctx.strokeStyle = 'rgba(255,81,35,' + alpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
            // Connect to mouse
            const mdx = particles[i].x - mouse.x;
            const mdy = particles[i].y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < MOUSE_DIST) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                const alpha = (1 - mdist / MOUSE_DIST) * 0.3;
                ctx.strokeStyle = 'rgba(255,81,35,' + alpha + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        requestAnimationFrame(animate);
    }
    
    // Only animate when section is visible
    const canvasObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { resize(); animate(); canvasObserver.disconnect(); }
    }, { threshold: 0.1 });
    canvasObserver.observe(section);
})();

// ═══════════ 3D HOLOGRAPHIC CARD TILT ═══════════
if (!isTouchDevice) {
    document.querySelectorAll('.holo-card[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateY = ((x - centerX) / centerX) * 15;
            const rotateX = ((centerY - y) / centerY) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            
            // Update holographic border angle
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 180;
            card.style.setProperty('--holo-angle', angle + 'deg');
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// ═══════════ DYNAMIC SERVICE OVERLAY ═══════════
const serviceData = {
    web_designing: {
        title: "01 — Web Designing",
        headline: "We build websites people actually enjoy using.",
        desc: "A website is often the first conversation you have with a customer — we make sure it's a good one. Clean design, fast load times, and an experience that feels effortless on any screen.",
        whatYouGet: ["Business websites", "Custom UI/UX", "Responsive design", "Landing pages", "Ongoing design support"],
        howWeWork: ["Research", "Design", "Build", "Optimize", "Grow"],
        image: "./image/web_design_illust_1785940025687.jpg"
    },
    fullstack: {
        title: "02 — Fullstack",
        headline: "One team, front to back.",
        desc: "No handoffs, no gaps between 'how it looks' and 'how it works.' Our fullstack engineers handle the entire stack — database, backend logic, and the interface your users touch — so everything fits together the way it should.",
        whatYouGet: ["Custom software builds", "API development & integration", "Product engineering", "Full-cycle app development"],
        howWeWork: ["Discover", "Architect", "Develop", "Launch", "Scale"],
        image: "./image/fullstack_illust_1785940042188.jpg"
    },
    software: {
        title: "03 — Software",
        headline: "Software that's built to last, not just to launch.",
        desc: "We engineer reliable, secure systems that can grow with your business — whether that's a fresh MVP or a platform serving thousands of users. We also stick around after launch to keep things running smoothly.",
        whatYouGet: ["Enterprise applications", "Software modernization", "Quality testing", "Long-term maintenance & support"],
        howWeWork: ["Understand", "Engineer", "Validate", "Evolve"],
        image: "./image/software_illust_1785940058004.jpg"
    },
    applications: {
        title: "04 — Applications",
        headline: "Apps your users will actually want to open.",
        desc: "From customer-facing mobile apps to internal dashboards, we design and build applications that are intuitive from the first tap. Android, iOS, or web — we meet your users where they are.",
        whatYouGet: ["Mobile apps (Android & iOS)", "Customer portals", "Enterprise dashboards", "E-commerce platforms"],
        howWeWork: ["Discover", "Design", "Develop", "Scale"],
        image: "./image/apps_illust_1785940073307.jpg"
    },
    iot: {
        title: "05 — IOT Products",
        headline: "Bringing your physical products online.",
        desc: "We help connect hardware to intelligent software — turning devices into smart, data-driven products. From prototyping to production-ready connected systems, we build the bridge between the physical and digital.",
        whatYouGet: ["Connected device integration", "Real-time data pipelines", "Custom dashboards", "End-to-end IoT product development"],
        howWeWork: ["Imagine", "Prototype", "Validate", "Launch"],
        image: "./image/iot_illust_1785940088279.jpg"
    },
    cybersecurity: {
        title: "06 — Cybersecurity",
        headline: "Because trust is your most valuable asset.",
        desc: "Security isn't something you bolt on at the end — it's built in from day one. We help you stay ahead of threats instead of reacting to them, protecting your systems, your data, and your customers' trust.",
        whatYouGet: ["Security assessments", "Vulnerability testing", "Threat monitoring", "Identity & access management", "Cloud security"],
        howWeWork: ["Assess", "Protect", "Monitor", "Strengthen"],
        image: "./image/cyber_illust_1785940104742.jpg"
    },
    consulting: {
        title: "07 — Consulting & Training",
        headline: "Technology is only as good as the people using it.",
        desc: "Whether you need a clear strategy for digital transformation or a team that's genuinely upskilled, we work alongside you — not just to advise, but to build lasting capability inside your organization.",
        whatYouGet: ["IT & digital transformation consulting", "Corporate training", "Workforce planning", "Nexafo Academy programs", "Internship & placement support"],
        howWeWork: ["Listen", "Strategize", "Execute", "Empower"],
        image: "./image/consulting_illust_1785940198973.jpg"
    }
};

const modal = document.getElementById('serviceModal');
const modalClose = document.getElementById('modalClose');
const svcBg = document.getElementById('modalBg');
const svcTitle = document.getElementById('modalTitle');
const svcHeadline = document.getElementById('modalHeadline');
const svcDesc = document.getElementById('modalDesc');
const svcGetList = document.getElementById('modalGetList');
const svcWorkList = document.getElementById('modalWorkList');

document.querySelectorAll('.svc-slice').forEach(slice => {
    slice.style.cursor = 'pointer';
    slice.addEventListener('click', () => {
        const svcId = slice.getAttribute('data-service');
        const data = serviceData[svcId];
        if(!data) return;
        
        // Populate Modal
        svcBg.src = data.image;
        svcTitle.innerText = data.title;
        svcHeadline.innerText = data.headline;
        svcDesc.innerText = data.desc;
        
        svcGetList.innerHTML = data.whatYouGet.map(item => `<li>${item}</li>`).join('');
        svcWorkList.innerHTML = data.howWeWork.map((step, idx) => {
            return `<div class="sm-step" style="animation-delay: ${idx * 0.4}s">${step}</div>` + 
                   (idx < data.howWeWork.length - 1 ? `<div class="sm-arrow" style="animation-delay: ${idx * 0.4}s">→</div>` : ``);
        }).join('');
        
        // Show Modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent bg scrolling
        
        // Animate flowchart according to scroll
        if (window.modalScrollTrigger) window.modalScrollTrigger.kill();
        window.modalScrollTrigger = ScrollTrigger.create({
            trigger: '#modalWorkList',
            scroller: '#serviceModal',
            start: "top 85%",
            onEnter: () => {
                gsap.fromTo(modal.querySelectorAll('.sm-step, .sm-arrow'), 
                    { opacity: 0, y: 100, rotationX: 45 }, 
                    { opacity: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)" }
                );
            },
            once: true
        });
    });
});

if(modalClose) {
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// ── Mobile Service Accordion (tap to toggle) ──
if (isTouchDevice) {
    document.querySelectorAll('.svc-slice').forEach(slice => {
        slice.addEventListener('click', (e) => {
            const wasActive = slice.classList.contains('mobile-active');
            // Close all
            document.querySelectorAll('.svc-slice').forEach(s => s.classList.remove('mobile-active'));
            // Toggle clicked
            if (!wasActive) {
                slice.classList.add('mobile-active');
                e.stopPropagation(); // Prevent modal on first tap
            }
        });
    });
}
