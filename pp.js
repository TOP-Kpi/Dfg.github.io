(function () {
    // ==================== 核心元素 ====================
    const birthday = new Date("2025-06-25T12:00:00");
    const countdownElement = document.getElementById('countdown');
    const mainTitle = document.getElementById('main-title');
    const photoWrapper = document.querySelector('.photo-wrapper');
    const ribbonBadge = document.querySelector('.ribbon-badge');

    let countdownInterval;
    let birthdayReached = false;
    let allConfetti = [];
    let allBalloons = [];
    let allSparkles = [];

    // ==================== 背景光点 ====================
    function createSparkles(count = 18) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'bg-sparkle';
            const size = 3 + Math.random() * 10;
            sparkle.style.width = size + 'px';
            sparkle.style.height = size + 'px';
            sparkle.style.left = Math.random() * 94 + '%';
            sparkle.style.top = Math.random() * 90 + '%';
            sparkle.style.animationDelay = Math.random() * 8 + 's';
            sparkle.style.animationDuration = 6 + Math.random() * 12 + 's';
            sparkle.style.opacity = 0.15 + Math.random() * 0.4;
            fragment.appendChild(sparkle);
            allSparkles.push(sparkle);
        }
        document.body.appendChild(fragment);
    }

    // ==================== 纸屑系统 ====================
    function createConfetti(count = 30) {
        const colors = [
            '#ff6b6b', '#ff8e8e', '#ffb3b3',
            '#4ecdc4', '#6ee7de', '#a0f0ea',
            '#ffd700', '#ffe566', '#fff0a0',
            '#e84393', '#f06292', '#f8a5c2',
            '#6a0572', '#9b59b6', '#c39bd3',
            '#ff8c00', '#ffa940', '#ffc078',
            '#00bcd4', '#4dd0e1', '#b2ebf2',
            '#ff9a9e', '#fad0c4', '#fbc2eb'
        ];
        const shapes = ['square', 'circle', 'ribbon', 'star-shape'];
        const fragment = document.createDocumentFragment();
        const isMobile = window.innerWidth < 480;

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // 形状分配
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (shape === 'circle') confetti.classList.add('circle');
            if (shape === 'ribbon') confetti.classList.add('ribbon');
            if (shape === 'star-shape') confetti.classList.add('star-shape');

            const baseSize = isMobile ? (3 + Math.random() * 5) : (5 + Math.random() * 10);
            confetti.style.width = baseSize + 'px';
            confetti.style.height = (shape === 'ribbon' ? baseSize * 3 : baseSize) + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 6 + 's';
            confetti.style.animationDuration = (isMobile ? 6 : 4) + Math.random() * (isMobile ? 8 : 7) + 's';
            confetti.style.opacity = 0.55 + Math.random() * 0.45;

            fragment.appendChild(confetti);
            allConfetti.push(confetti);
        }
        document.body.appendChild(fragment);
    }

    // ==================== 气球系统 ====================
    function createBalloon(delay = 0) {
        const container = document.createElement('div');
        container.className = 'balloon-container';
        container.style.left = 8 + Math.random() * 84 + '%';
        container.style.animationDelay = delay + 's';
        container.style.animationDuration = (10 + Math.random() * 16) + 's';

        const emojis = ['🎈', '🎂', '🎁', '🎉', '🎊', '💝', '🌟', '💖', '🎀', '🧁'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        container.innerHTML = `
            <span class="balloon-emoji">${emoji}</span>
            <div class="balloon-string"></div>
        `;
        document.body.appendChild(container);
        allBalloons.push({ el: container, createdAt: Date.now() });

        // 动画结束后自动清理
        const duration = parseFloat(container.style.animationDuration) + delay;
        setTimeout(() => {
            if (container.parentNode) {
                container.remove();
                allBalloons = allBalloons.filter(b => b.el !== container);
            }
        }, duration * 1000 + 2000);
    }

    function spawnBalloons(count = 6, spreadDelay = true) {
        for (let i = 0; i < count; i++) {
            const delay = spreadDelay ? i * 1.8 + Math.random() * 3 : Math.random() * 4;
            createBalloon(delay);
        }
    }

    // 持续补充气球
    function maintainBalloons() {
        allBalloons = allBalloons.filter(b => b.el.parentNode);
        const activeCount = allBalloons.length;
        const targetCount = window.innerWidth < 480 ? 3 : (birthdayReached ? 8 : 5);
        if (activeCount < targetCount) {
            const toSpawn = targetCount - activeCount;
            for (let i = 0; i < toSpawn; i++) {
                createBalloon(Math.random() * 5);
            }
        }
    }
    setInterval(maintainBalloons, 6000);

    // ==================== 倒计时逻辑 ====================
    function updateCountdown() {
        if (birthdayReached) return;

        const now = new Date();
        const diff = birthday - now;

        if (diff <= 0) {
            birthdayReached = true;
            clearInterval(countdownInterval);
            triggerCelebration();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdownElement.innerHTML =
            `⏳ 距离生日还有：<strong>${days}</strong> 天 <strong>${hours}</strong> 时 <strong>${minutes}</strong> 分 <strong>${seconds}</strong> 秒`;
    }

    function triggerCelebration() {
        countdownElement.style.display = 'none';
        mainTitle.innerHTML = "🎂 就是现在！生日快乐！ 🎂";
        mainTitle.classList.add('pulse-celebrate');
        ribbonBadge.textContent = '🎉 今天是你的一天！🎉';
        ribbonBadge.style.background = 'linear-gradient(135deg, #ffd700, #ff8c00)';
        ribbonBadge.style.boxShadow = '0 4px 22px rgba(255, 140, 0, 0.5)';

        // 照片光晕增强
        if (photoWrapper) {
            photoWrapper.classList.add('celebrate-glow');
        }

        // 大量纸屑
        const extraConfetti = window.innerWidth < 480 ? 80 : 200;
        createConfetti(extraConfetti);

        // 大量气球
        spawnBalloons(window.innerWidth < 480 ? 10 : 25, true);

        // 尝试自动播放
        if (player && player.play) {
            player.play().catch(() => {
                console.log('🎵 自动播放被浏览器阻止，请手动点击播放');
            });
        }

        // 延迟弹出祝福
        const finalMessage = "🌟 愿望成真，美梦成真！新的一岁，未来可期！ 🌟";
        setTimeout(() => {
            toggleMessage(finalMessage);
        }, 1200);
    }

    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();

    // ==================== Plyr 播放器 ====================
    let player;
    try {
        player = new Plyr('#audio-player', {
            controls: ['play', 'progress', 'current-time', 'mute', 'volume'],
            iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
            tooltips: { controls: true, seek: true },
        });
    } catch (e) {
        console.warn('Plyr初始化异常，使用原生播放器:', e);
        document.getElementById('audio-player').style.display = 'block';
    }

    // ==================== 消息弹窗 ====================
    const messages = [
        "🎉 愿你的每一天都充满阳光和欢笑！",
        "🎂 新的一岁要继续闪闪发光哦～",
        "🎁 所有美好都如期而至！",
        "🌟 祝世界上最棒的人生日快乐！",
        "💖 愿你的生活比蜜糖还甜！",
        "🎈 愿你岁岁平安，朝朝暮暮幸福！",
        "其实想表白的,但这样我太自私了",
    ];

    window.toggleMessage = function (specificMessage = null) {
        const message = specificMessage || messages[Math.floor(Math.random() * messages.length)];
        const overlay = document.createElement('div');
        overlay.className = 'message-overlay';
        overlay.innerHTML = `
            <div class="message-box">
                <p>${message}</p>
                <button onclick="this.closest('.message-overlay').remove()">💝 关闭</button>
            </div>
        `;
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);

        // ESC关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    // ==================== 图片加载 ====================
    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img.src);
            img.onerror = () => reject('图片加载失败，请检查链接或文件是否存在。');
            img.src = url;
            // 设置超时
            setTimeout(() => reject('图片加载超时'), 15000);
        });
    }

    function showError(message) {
        console.error('⚠️ 错误：', message);
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = '⚠️ ' + message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }

    // ==================== 初始化 ====================
    window.addEventListener('load', async () => {
        // 背景光点
        createSparkles(window.innerWidth < 480 ? 10 : 18);

        // 初始纸屑
        const initialConfetti = window.innerWidth < 480 ? 15 : 30;
        createConfetti(initialConfetti);

        // 初始气球
        spawnBalloons(window.innerWidth < 480 ? 4 : 8, true);

        // 加载照片
        const photoUrl =
            'https://imgur.la/images/2025/06/12/10000486179641f9a3209d337d.jpg';
        const photoImg = document.getElementById('birthday-photo');
        try {
            const loadedPhotoUrl = await loadImage(photoUrl);
            photoImg.src = loadedPhotoUrl;
            photoImg.style.width = '190px';
            photoImg.style.height = '190px';
        } catch (error) {
            showError(error);
            photoImg.src =
                'https://via.placeholder.com/200x200/ffe0f0/d81b60?text=%F0%9F%93%B7+%E7%85%A7%E7%89%87';
            photoImg.style.width = '190px';
            photoImg.style.height = '190px';
        }

        // 加载音频
        const audioUrl =
            'https://dlink.host/musics/aHR0cHM6Ly9vbmVkcnYtbXkuc2hhcmVwb2ludC5jb20vOnU6L2cvcGVyc29uYWwvc3Rvcl9vbmVkcnZfb25taWNyb3NvZnRfY29tL0VjbFBZYjRfVk1CTm00REhHZnpHYTFJQlBHdFExM3ZFUThCUGs4d1hQX2x4dUE.mp3';
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.innerHTML =
            `<source src="${audioUrl}" type="audio/mpeg">您的浏览器不支持音频播放。`;
        if (player && player.source) {
            try {
                player.source = {
                    type: 'audio',
                    sources: [{ src: audioUrl, type: 'audio/mpeg' }],
                };
            } catch (e) {
                console.warn('Plyr source设置失败:', e);
            }
        }

        console.log('🎉 生日页面已就绪！');
        console.log('💡 提示：点击"显示祝福"按钮查看随机祝福语');
        if (birthdayReached) {
            console.log('🎂 生日已到，庆祝模式已激活！');
        }
    });

    // ==================== 窗口大小变化适配 ====================
    let resizeDebounce;
    window.addEventListener('resize', () => {
        clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(() => {
            // 调整照片大小
            const photoImg = document.getElementById('birthday-photo');
            if (photoImg && photoImg.src && !photoImg.src.includes('placeholder')) {
                const size = window.innerWidth < 480 ? 120 : window.innerWidth < 768 ? 150 : 190;
                photoImg.style.width = size + 'px';
                photoImg.style.height = size + 'px';
            }
            // 清理过多纸屑
            const maxConfetti = window.innerWidth < 480 ? 60 : 250;
            while (allConfetti.length > maxConfetti) {
                const old = allConfetti.shift();
                if (old && old.parentNode) old.remove();
            }
        }, 300);
    });

    // ==================== 键盘快捷键 ====================
    window.addEventListener('keydown', function (e) {
        if (e.key === 'b' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // B键触发祝福
            const activeOverlay = document.querySelector('.message-overlay');
            if (!activeOverlay) {
                window.toggleMessage();
            }
        }
        if (e.key === ' ' && !e.ctrlKey && !e.metaKey) {
            // 空格键切换播放
            const activeOverlay = document.querySelector('.message-overlay');
            if (!activeOverlay && player && player.togglePlay) {
                e.preventDefault();
                player.togglePlay();
            }
        }
    });

    console.log('✨ 快捷键提示：按 B 键弹出祝福 | 按 空格键 播放/暂停音乐 | 按 ESC 关闭弹窗');
})();