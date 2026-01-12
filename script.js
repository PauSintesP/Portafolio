// Canvas Background
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let particlesArray;

// Size canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
    x: null,
    y: null,
    radius: 150
}

window.addEventListener('mousemove',
    function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
);

// Icons Configuration
const icons = [
    { code: '\uf17b', font: '900 20px "Font Awesome 6 Brands"', color: '#3DDC84' }, // Android
    { code: '\uf3b9', font: '900 20px "Font Awesome 6 Brands"', color: '#F7DF1E' }, // JS
    { code: '\uf4e4', font: '900 20px "Font Awesome 6 Brands"', color: '#f89820' }, // Java
    { code: '\uf41b', font: '900 20px "Font Awesome 6 Brands"', color: '#61DAFB' }, // React
    { code: '\uf1d3', font: '900 20px "Font Awesome 6 Brands"', color: '#F05032' }, // Git
    { code: '\uf1c0', font: '900 18px "Font Awesome 6 Free"', color: 'rgba(248, 250, 252, 0.3)' },   // Database
    { code: '\uf121', font: '900 18px "Font Awesome 6 Free"', color: 'rgba(6, 182, 212, 0.3)' },     // Code
    { code: '\uf120', font: '900 18px "Font Awesome 6 Free"', color: 'rgba(139, 92, 246, 0.3)' }      // Terminal
];

// Create Icon Particle
class IconParticle {
    constructor(x, y, directionX, directionY, iconData) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.iconData = iconData;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.opacitySpeed = Math.random() * 0.005;
        this.opacityDirection = 1;
        this.size = 20; // Approx size for collision
    }

    draw() {
        ctx.save();
        ctx.font = this.iconData.font;
        ctx.fillStyle = this.iconData.color;
        ctx.globalAlpha = this.opacity;
        ctx.fillText(this.iconData.code, this.x, this.y);
        ctx.restore();
    }

    update() {
        // Wall collision
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Mouse Repulsion
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            // Push away logic
            const directionX = forceDirectionX * force * 5;
            const directionY = forceDirectionY * force * 5;

            this.x -= directionX;
            this.y -= directionY;
        }

        // Move standard
        this.x += this.directionX;
        this.y += this.directionY;

        // Twinkle effect (opacity oscillation)
        this.opacity += this.opacitySpeed * this.opacityDirection;
        if (this.opacity >= 0.6 || this.opacity <= 0.1) {
            this.opacityDirection = -this.opacityDirection;
        }

        this.draw();
    }
}

// Create particle array
function init() {
    particlesArray = [];
    // Less dense than before
    let numberOfParticles = (canvas.height * canvas.width) / 15000;

    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        // Slower speed for "calm" effect
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;

        // Random icon from the list
        let iconData = icons[Math.floor(Math.random() * icons.length)];

        particlesArray.push(new IconParticle(x, y, directionX, directionY, iconData));
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
}

// Resize event
window.addEventListener('resize',
    function () {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        init();
    }
);

// Wait for fonts to load before starting
setTimeout(() => {
    init();
    animate();
}, 500);

// Intersection Observer for Animations (Preserved)
document.addEventListener('DOMContentLoaded', () => {
    // Select elements to animate
    const animatedElements = document.querySelectorAll('.timeline-item, .project-card, .skill-item, .section-title');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // -------------------------------------------------------------------------
    // Laptop Interaction & Animation Logic
    // -------------------------------------------------------------------------
    const laptop = document.getElementById('hero-laptop');
    let hasAnimated = false;

    // Mouse Parallax Logic
    // Listen on window to capture mouse movement relative to the screen center
    window.addEventListener('mousemove', (e) => {
        // Only trigger if we haven't scrolled away/animated the laptop exit
        if (!hasAnimated && laptop) {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Calculate mouse position as a percentage from center (-0.5 to 0.5)
            const mouseX = (e.clientX - width / 2) / width;
            const mouseY = (e.clientY - height / 2) / height;

            // Rotation multipliers (Max degrees to rotate)
            const rotationY = mouseX * 20; // Rotate Y (Left/Right)
            const rotationX = mouseY * -20; // Rotate X (Up/Down) - Inverted for natural feel

            // Apply interaction
            // Base tilt is -10deg. We temper the X rotation so it doesn't flip too far up/down.
            laptop.style.transform = `rotateX(${-10 + rotationX}deg) rotateY(${rotationY}deg)`;
        }
    });

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        if (scrollPosition > 50 && !hasAnimated) {
            hasAnimated = true;
            // Important: Clear the inline transform set by mousemove
            // so the CSS class 'closed-flip' can apply its own keyframe animation
            if (laptop) {
                laptop.style.transform = '';

                // First close the lid
                laptop.classList.add('closing');

                // Then flip (delay slightly to let lid start closing)
                setTimeout(() => {
                    laptop.classList.add('closed-flip');
                }, 600);
            }
        } else if (scrollPosition < 20 && hasAnimated) {
            // Optional: Reset if scrolled back to top
            hasAnimated = false;
            if (laptop) {
                laptop.classList.remove('closed-flip');
                laptop.classList.remove('closing');
            }
        }
    });


    // Timeline Expansion Logic
    const timelineItems = document.querySelectorAll('.timeline-content');

    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            const wasExpanded = item.classList.contains('expanded');

            // Close all
            timelineItems.forEach(i => i.classList.remove('expanded'));

            // Toggle current
            if (!wasExpanded) {
                item.classList.add('expanded');
            }
        });
    });
});
