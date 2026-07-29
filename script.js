// script.js
(function() {
    // DOM元素
    const principalInput = document.getElementById('principal');
    const customRateInput = document.getElementById('customRate');
    const rateSlider = document.getElementById('rateSlider');
    const sliderCurrent = document.getElementById('sliderCurrent');
    const presetGrid = document.getElementById('presetGrid');
    const btnPositive = document.getElementById('btnPositive');
    const btnNegative = document.getElementById('btnNegative');
    const resultArea = document.getElementById('resultArea');
    const resultBadge = document.getElementById('resultBadge');
    const resultGain = document.getElementById('resultGain');
    const resultTotal = document.getElementById('resultTotal');
    const visualBarFill = document.getElementById('visualBarFill');
    const visualBarMarker = document.getElementById('visualBarMarker');
    const quickFillBtns = document.querySelectorAll('.quick-fill button');

    // 状态
    let currentRateSign = 'positive'; // 'positive' | 'negative'
    let activePresetBtn = null;
    let isUpdatingFromPreset = false;
    let isUpdatingFromSlider = false;
    let isUpdatingFromInput = false;

    // 格式化数字（千分位，保留2位小数）
    function formatCurrency(num) {
        const absNum = Math.abs(num);
        const formatted = absNum.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return num < 0 ? '-' + formatted : formatted;
    }

    // 格式化收益率显示
    function formatRate(rate) {
        const rounded = Math.round(rate * 10) / 10;
        if (rounded > 0) return '+' + rounded.toFixed(1) + '%';
        if (rounded < 0) return rounded.toFixed(1) + '%';
        return '0.0%';
    }

    // 解析本金输入
    function getPrincipal() {
        const raw = principalInput.value.replace(/[^\d.]/g, '');
        const val = parseFloat(raw);
        if (isNaN(val) || val < 0) return 0;
        return val;
    }

    // 获取当前收益率（百分比数值，如10表示10%）
    function getCurrentRate() {
        const raw = customRateInput.value.replace(/[^\d.-]/g, '');
        const val = parseFloat(raw);
        if (!isNaN(val)) {
            // 根据符号状态调整
            if (currentRateSign === 'negative' && val > 0) return -val;
            if (currentRateSign === 'positive' && val < 0) return Math.abs(val);
            return val;
        }
        // 如果自定义输入为空，使用滑块值
        return parseFloat(rateSlider.value);
    }

    // 更新所有UI
    function updateAll(source) {
        const rate = getCurrentRate();
        const principal = getPrincipal();

        // 更新滑块（如果不是滑块触发的）
        if (source !== 'slider') {
            const clampedRate = Math.max(-100, Math.min(200, rate));
            rateSlider.value = clampedRate;
        }

        // 更新滑块下方文字
        const sliderVal = parseFloat(rateSlider.value);
        sliderCurrent.textContent = formatRate(sliderVal);
        sliderCurrent.className = 'slider-current';
        if (sliderVal > 0) sliderCurrent.classList.add('positive-rate');
        else if (sliderVal < 0) sliderCurrent.classList.add('negative-rate');

        // 更新自定义输入框（如果不是输入框触发的）
        if (source !== 'input') {
            const absRate = Math.abs(rate);
            customRateInput.value = absRate === 0 ? '0' : absRate.toFixed(1).replace(/\.0$/, '');
            // 更新符号状态
            if (rate < 0 && currentRateSign !== 'negative') {
                currentRateSign = 'negative';
                updateSignToggleUI();
            } else if (rate > 0 && currentRateSign !== 'positive') {
                currentRateSign = 'positive';
                updateSignToggleUI();
            } else if (rate === 0) {
                // 保持当前符号状态不变
            }
        }

        // 更新符号切换按钮UI
        updateSignToggleUI();

        // 更新预设按钮高亮（如果不是预设按钮触发的）
        if (source !== 'preset') {
            updatePresetHighlight(rate);
        }

        // 计算结果
        const gain = principal * (rate / 100);
        const total = principal + gain;

        // 更新结果区域
        updateResultArea(principal, gain, total, rate);

        // 更新可视化条
        updateVisualBar(principal, total, gain);
    }

    function updateSignToggleUI() {
        if (currentRateSign === 'positive') {
            btnPositive.classList.add('active');
            btnNegative.classList.remove('active');
        } else {
            btnNegative.classList.add('active');
            btnPositive.classList.remove('active');
        }
    }

    function updatePresetHighlight(rate) {
        // 移除所有高亮
        const allPresetBtns = presetGrid.querySelectorAll('.preset-btn');
        allPresetBtns.forEach(btn => {
            btn.classList.remove('active-positive', 'active-negative', 'active-zero');
        });

        // 查找匹配的预设按钮
        const roundedRate = Math.round(rate * 10) / 10;
        let matchedBtn = null;
        allPresetBtns.forEach(btn => {
            const btnRate = parseFloat(btn.getAttribute('data-rate'));
            if (Math.abs(btnRate - roundedRate) < 0.05) {
                matchedBtn = btn;
            }
        });

        if (matchedBtn) {
            if (roundedRate > 0) matchedBtn.classList.add('active-positive');
            else if (roundedRate < 0) matchedBtn.classList.add('active-negative');
            else matchedBtn.classList.add('active-zero');
            activePresetBtn = matchedBtn;
        } else {
            activePresetBtn = null;
        }
    }

    function updateResultArea(principal, gain, total, rate) {
        // 更新样式
        resultArea.classList.remove('profit', 'loss', 'flat');
        if (gain > 0.005) {
            resultArea.classList.add('profit');
            resultBadge.textContent = '📈 盈利';
            resultGain.className = 'result-value gain';
        } else if (gain < -0.005) {
            resultArea.classList.add('loss');
            resultBadge.textContent = '📉 亏损';
            resultGain.className = 'result-value lose';
        } else {
            resultArea.classList.add('flat');
            resultBadge.textContent = '➡️ 持平';
            resultGain.className = 'result-value';
        }

        // 更新数值
        if (principal <= 0) {
            resultGain.textContent = '—';
            resultTotal.textContent = '—';
            resultBadge.textContent = '⚠️ 请输入本金';
            resultArea.classList.remove('profit', 'loss');
            resultArea.classList.add('flat');
        } else {
            resultGain.textContent = (gain >= 0 ? '¥' : '-¥') + formatCurrency(Math.abs(gain));
            resultTotal.textContent = '¥' + formatCurrency(total);
        }
    }

    function updateVisualBar(principal, total, gain) {
        if (principal <= 0) {
            visualBarFill.style.width = '0%';
            visualBarMarker.style.left = '0%';
            visualBarFill.className = 'visual-bar-fill profit-fill';
            return;
        }

        // 可视化：以本金为基准，显示最终总额相对于本金的位置
        // 标记在50%位置表示总额=本金（无盈亏）
        // 标记>50%表示盈利，<50%表示亏损
        const maxRatio = Math.max(total / principal, 2.5); // 最多显示2.5倍
        const minRatio = Math.min(total / principal, 0);
        const clampedRatio = Math.max(0, Math.min(maxRatio, total / principal));

        // 映射到0%-100%的宽度
        let markerPercent;
        if (total >= principal) {
            // 盈利：标记在50%-100%之间
            const ratioInRange = Math.min((total / principal - 1) / 1.5, 1); // 1.5倍映射到100%
            markerPercent = 50 + ratioInRange * 50;
        } else {
            // 亏损：标记在0%-50%之间
            const ratioInRange = total / principal; // 0到1之间
            markerPercent = ratioInRange * 50;
        }
        markerPercent = Math.max(2, Math.min(98, markerPercent));

        visualBarMarker.style.left = markerPercent + '%';

        // 填充条
        if (gain >= 0) {
            visualBarFill.className = 'visual-bar-fill profit-fill';
            visualBarFill.style.width = markerPercent + '%';
        } else {
            visualBarFill.className = 'visual-bar-fill loss-fill';
            visualBarFill.style.width = markerPercent + '%';
        }
    }

    // 事件监听

    // 本金输入
    principalInput.addEventListener('input', function() {
        // 过滤非数字字符（保留数字和小数点）
        const cursorPos = this.selectionStart;
        const oldVal = this.value;
        const filtered = oldVal.replace(/[^\d.]/g, '');
        // 只保留第一个小数点
        const parts = filtered.split('.');
        const cleaned = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
        if (cleaned !== oldVal) {
            this.value = cleaned;
            // 调整光标位置
            const diff = oldVal.length - cleaned.length;
            this.setSelectionRange(Math.max(0, cursorPos - diff), Math.max(0, cursorPos - diff));
        }
        updateAll('principal');
    });
    principalInput.addEventListener('blur', function() {
        const val = getPrincipal();
        if (val > 0) {
            this.value = val.toFixed(0).replace(/\.0$/, '');
        }
    });

    // 快捷填充按钮
    quickFillBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            principalInput.value = amount;
            updateAll('principal');
            // 添加点击反馈
            this.style.transform = 'scale(0.9)';
            setTimeout(() => { this.style.transform = ''; }, 120);
        });
    });

    // 预设按钮
    presetGrid.addEventListener('click', function(e) {
        const btn = e.target.closest('.preset-btn');
        if (!btn) return;
        const rate = parseFloat(btn.getAttribute('data-rate'));
        isUpdatingFromPreset = true;
        customRateInput.value = Math.abs(rate) === 0 ? '0' : Math.abs(rate).toFixed(1)
            .replace(/\.0$/, '');
        if (rate < 0) {
            currentRateSign = 'negative';
        } else if (rate > 0) {
            currentRateSign = 'positive';
        }
        updateSignToggleUI();
        rateSlider.value = rate;
        activePresetBtn = btn;
        updateAll('preset');
        isUpdatingFromPreset = false;
    });

    // 自定义收益率输入
    customRateInput.addEventListener('input', function() {
        if (isUpdatingFromPreset || isUpdatingFromSlider) return;
        const raw = this.value.replace(/[^\d.]/g, '');
        const parts = raw.split('.');
        const cleaned = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
        if (cleaned !== this.value) {
            this.value = cleaned;
        }
        isUpdatingFromInput = true;
        const numVal = parseFloat(cleaned);
        if (!isNaN(numVal)) {
            let actualRate = numVal;
            if (currentRateSign === 'negative') actualRate = -Math.abs(numVal);
            else actualRate = Math.abs(numVal);
            rateSlider.value = Math.max(-100, Math.min(200, actualRate));
        }
        updateAll('input');
        isUpdatingFromInput = false;
    });
    customRateInput.addEventListener('blur', function() {
        const raw = this.value.replace(/[^\d.]/g, '');
        const val = parseFloat(raw);
        if (!isNaN(val) && val >= 0) {
            this.value = val.toFixed(1).replace(/\.0$/, '');
        } else if (raw === '' || isNaN(val)) {
            this.value = '';
        }
        updateAll('input');
    });

    // 符号切换按钮
    btnPositive.addEventListener('click', function() {
        if (currentRateSign === 'positive') return;
        currentRateSign = 'positive';
        updateSignToggleUI();
        const raw = customRateInput.value.replace(/[^\d.]/g, '');
        const val = parseFloat(raw);
        if (!isNaN(val) && val >= 0) {
            customRateInput.value = val.toFixed(1).replace(/\.0$/, '');
        }
        updateAll('sign-toggle');
    });
    btnNegative.addEventListener('click', function() {
        if (currentRateSign === 'negative') return;
        currentRateSign = 'negative';
        updateSignToggleUI();
        const raw = customRateInput.value.replace(/[^\d.]/g, '');
        const val = parseFloat(raw);
        if (!isNaN(val) && val >= 0) {
            customRateInput.value = val.toFixed(1).replace(/\.0$/, '');
        }
        updateAll('sign-toggle');
    });

    // 滑块
    rateSlider.addEventListener('input', function() {
        if (isUpdatingFromInput || isUpdatingFromPreset) return;
        isUpdatingFromSlider = true;
        const rate = parseFloat(this.value);
        const absRate = Math.abs(rate);
        customRateInput.value = absRate === 0 ? '0' : absRate.toFixed(1).replace(/\.0$/, '');
        if (rate < 0) currentRateSign = 'negative';
        else if (rate > 0) currentRateSign = 'positive';
        updateSignToggleUI();
        updateAll('slider');
        isUpdatingFromSlider = false;
    });
    rateSlider.addEventListener('change', function() {
        updateAll('slider');
    });

    // 键盘监听：在自定义输入框按上下键调整数值
    customRateInput.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const raw = this.value.replace(/[^\d.]/g, '');
            const val = parseFloat(raw) || 0;
            const newVal = Math.round((val + 0.5) * 10) / 10;
            this.value = newVal.toFixed(1).replace(/\.0$/, '');
            updateAll('input');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const raw = this.value.replace(/[^\d.]/g, '');
            const val = parseFloat(raw) || 0;
            const newVal = Math.max(0, Math.round((val - 0.5) * 10) / 10);
            this.value = newVal.toFixed(1).replace(/\.0$/, '');
            updateAll('input');
        }
    });

    // 本金输入框键盘上下调整
    principalInput.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const val = getPrincipal();
            const step = val >= 10000 ? 1000 : (val >= 1000 ? 500 : 100);
            const newVal = val + step;
            this.value = Math.round(newVal).toString();
            updateAll('principal');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const val = getPrincipal();
            const step = val > 10000 ? 1000 : (val > 1000 ? 500 : 100);
            const newVal = Math.max(0, val - step);
            this.value = Math.round(newVal).toString();
            updateAll('principal');
        }
    });

    // 初始化
    function init() {
        rateSlider.value = 10;
        customRateInput.value = '10';
        currentRateSign = 'positive';
        updateSignToggleUI();
        updateAll('init');
        // 初始高亮+10%预设按钮
        const preset10 = presetGrid.querySelector('[data-rate="10"]');
        if (preset10) {
            preset10.classList.add('active-positive');
            activePresetBtn = preset10;
        }
    }

    init();

    console.log('📈 股价收益率计算器已就绪');
    console.log('   💡 提示：可使用键盘上下箭头微调数值');
    console.log('   🖱️ 点击预设按钮快速选择收益率');
    console.log('   🎚️ 拖动滑块或手动输入自定义收益率');
})();            confetti.style.left = Math.random() * 100 + '%';
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
