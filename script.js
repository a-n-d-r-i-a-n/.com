document.addEventListener('DOMContentLoaded', () => {
    // Tab functionality for Rules section
    const tabButtons = document.querySelectorAll('.tab-button:not(.external-link)');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');

            const contentToShow = document.getElementById(targetTab);
            if (contentToShow) {
                contentToShow.classList.add('active');
            }
        });
    });

    // Optional: Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });

            document.querySelectorAll('nav a').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Intersection Observer for active navigation links on scroll
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('header nav ul li a');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Initial check for active link on page load
    const currentHash = window.location.hash;
    if (currentHash && document.querySelector(`nav a[href="${currentHash}"]`)) {
        document.querySelector(`nav a[href="${currentHash}"]`).classList.add('active');
    } else {
        document.querySelector('nav a[href="#home"]').classList.add('active');
    }

    // --- Spam Protection: Math Captcha ---
    const captchaQuestionElement = document.getElementById('captcha-question');
    const captchaInput = document.getElementById('captcha');
    const correctCaptchaAnswer = 2 + 18; // Задана відповідь для "2 + 18"

    // --- Spam Protection: Time-based protection ---
    const formLoadTimeInput = document.getElementById('form-load-time');
    const MIN_SUBMISSION_TIME_SECONDS = 3; // Мінімальний час (у секундах) для відправки форми

    // Записуємо час завантаження форми
    if (formLoadTimeInput) {
        formLoadTimeInput.value = Date.now();
    }

    // --- Form Submission to Discord Webhook ---
    const contactForm = document.querySelector('.contact-form');
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1395186335232557186/6hB50h1KaPoU58bZMOoG2McFbBT0g5-FCFBYeODGfZP07vlXGzpqstAyv__VB4ZPs6b_'; // ВАШ DISCORD WEBHOOK URL

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Запобігаємо стандартній відправці форми

            // 1. Перевірка капчі
            if (parseInt(captchaInput.value) !== correctCaptchaAnswer) {
                alert('Неправильна відповідь на капчу. Будь ласка, спробуйте ще раз.');
                captchaInput.value = ''; // Очищаємо поле капчі
                return; // Зупиняємо відправку форми
            }

            // 2. Перевірка часу відправки
            const currentTime = Date.now();
            const formLoadedAt = parseInt(formLoadTimeInput.value);
            const timeElapsedSeconds = (currentTime - formLoadedAt) / 1000;

            if (timeElapsedSeconds < MIN_SUBMISSION_TIME_SECONDS) {
                alert('Занадто швидка відправка форми. Будь ласка, зачекайте кілька секунд перед відправкою.');
                return; // Зупиняємо відправку форми
            }

            // Збір даних форми
            const nickname = document.getElementById('nickname').value;
            const contactInfo = document.getElementById('contact-info').value;
            const message = document.getElementById('message').value;

            // Створюємо об'єкт даних для Discord Webhook
            const payload = {
                content: null,
                embeds: [
                    {
                        title: "Нова заявка на вступ до клану WINSTON",
                        description: "Надійшла нова заявка через форму на сайті.",
                        color: 15099750, // Колір Embed (помаранчевий WINSTON, десятковий)
                        fields: [
                            {
                                name: "Нікнейм в грі",
                                value: nickname,
                                inline: true
                            },
                            {
                                name: "Контактні дані (Пошта/Discord)",
                                value: contactInfo,
                                inline: true
                            },
                            {
                                name: "Повідомлення від кандидата",
                                value: message.length > 0 ? message : "Немає додаткового повідомлення.",
                                inline: false
                            },
                            {
                                name: "Час заповнення форми",
                                value: `${timeElapsedSeconds.toFixed(2)} секунд`,
                                inline: true
                            }
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: "Сайт клану WINSTON"
                        }
                    }
                ]
            };

            try {
                const response = await fetch(discordWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    alert('Ваша заявка успішно надіслана! Ми зв\'яжемося з вами найближчим часом.');
                    contactForm.reset(); // Очищаємо форму
                    // Оновлюємо час завантаження форми після успішної відправки
                    if (formLoadTimeInput) {
                        formLoadTimeInput.value = Date.now();
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Помилка відправки заявки:', response.status, errorText);
                    alert(`Виникла помилка при відправці заявки. Статус: ${response.status}. Деталі: ${errorText.substring(0, 100)}... Будь ласка, спробуйте ще раз пізніше.`);
                }
            } catch (error) {
                console.error('Помилка мережі при відправці заявки:', error);
                alert('Виникла мережева помилка. Перевірте ваше підключення до Інтернету та спробуйте ще раз.');
            }
        });
    }
});
