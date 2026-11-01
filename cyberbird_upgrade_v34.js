/**
 * CYBERBIRD LINGO PRO v3.4.0 — AUTO-CRUISE DIALOGUE, ENERGY SHIELD, RADICAL DOJO & QC SKINS
 * ==========================================================================================
 * Nâng cấp toàn diện v3.4.0 cho CyberBird Lingo:
 *  1. 🎯 Đồng bộ Cổng-Banner 100% (Fix lỗi đổi câu hỏi sớm trước khi chim qua cổng) + Chạm Banner nghe lại (0 giật cánh)
 *  2. 🛸 Phương Án B Hoàn Chỉnh: Auto-Cruise 1.4s khi đổi câu dài + Ngắt 2-3 dòng + Tô Vàng 50+ Từ Khóa QC Nhà Xưởng
 *  3. 🛡️ Khiên Hộ Mệnh Năng Lượng (Cyber Energy Shield — Đỡ 1 lần va chạm / chọn nhầm cổng khó, nạp lại mỗi Combo 5)
 *  4. 🔥 Chuỗi Lửa Thiêng Hàng Ngày + ❄️ Khiên Băng Bảo Hộ + 🩹 Kho Phục Thù Câu Sai (SRS Mistake Vault)
 *  5. 🧩 Chiết Tự Bộ Thủ 160+ Chữ & ✍️ Bảng Tập Viết Điền Tự Cách ngay trên Flashcard GameOver
 *  6. 🎨 Xưởng Skin Chiến Điểu Nhà Máy (🐦 Neon, 👷 Kỹ Sư Mũ Bảo Hộ Vàng QC, 🔥 Phượng Hoàng, 🤖 Mecha Drone)
 *  7. 🎵 Âm Thanh Combo Thăng Cung (Pentatonic Pitch-Ascending) + 📱 Auto-Pause khi khóa màn hình / chuyển qua Telegram
 *
 * Developed by DEAN OPTIMIZE × Quân Sư Khổng Minh — 01/11/2026
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    DAILY: 'cyberbird_daily_meta_v34',
    SRS: 'cyberbird_srs_vault_v34',
    CRUISE: 'cyberbird_autocr_v34',
    SKIN: 'cyberbird_skin_v34'
  };

  // Safe localStorage helpers
  function sGetJSON(k, fb) {
    try {
      const r = localStorage.getItem(k);
      return r ? (JSON.parse(r) || fb) : fb;
    } catch (e) {
      return fb;
    }
  }
  function sSetJSON(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
  function sGetStr(k, fb = '') {
    try {
      const r = localStorage.getItem(k);
      return r !== null ? r : fb;
    } catch (e) {
      return fb;
    }
  }
  function sSetStr(k, v) {
    try {
      localStorage.setItem(k, String(v));
    } catch (e) {}
  }

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function diffDays(d1, d2) {
    if (!d1 || !d2) return 999;
    const t1 = new Date(d1 + 'T00:00:00').getTime();
    const t2 = new Date(d2 + 'T00:00:00').getTime();
    return Math.round((t2 - t1) / 86400000);
  }

  // =========================================================================
  // 1. 🔥 DAILY STREAK + ❄️ FREEZE TOKEN + 🩹 SRS MISTAKE VAULT
  // =========================================================================
  function loadAndTouchDailyStreak(markPlayedToday = false) {
    const today = todayISO();
    const meta = sGetJSON(STORAGE_KEYS.DAILY, {
      streak: 1,
      lastDate: today,
      freezes: 1,
      freezeNotice: ''
    });

    const gap = diffDays(meta.lastDate, today);
    if (gap === 1 && markPlayedToday) {
      meta.streak = (meta.streak || 1) + 1;
      meta.lastDate = today;
    } else if (gap > 1) {
      const missed = gap - 1;
      if ((meta.freezes || 0) >= missed) {
        meta.freezes -= missed;
        meta.lastDate = today;
        meta.freezeNotice = `❄️ Đã tự dùng ${missed} Khiên Băng bảo vệ chuỗi ${meta.streak} ngày!`;
      } else if (markPlayedToday) {
        meta.streak = 1;
        meta.lastDate = today;
      }
    } else if (markPlayedToday) {
      meta.lastDate = today;
      if (!meta.streak) meta.streak = 1;
    }

    sSetJSON(STORAGE_KEYS.DAILY, meta);
    return meta;
  }

  function awardFreezeOnMilestone(newScore, prevHigh) {
    if (newScore >= 50 && newScore > prevHigh) {
      const meta = loadAndTouchDailyStreak(false);
      if ((meta.freezes || 0) < 3) {
        meta.freezes = (meta.freezes || 0) + 1;
        sSetJSON(STORAGE_KEYS.DAILY, meta);
        return true;
      }
    }
    return false;
  }

  function getItemKey(q) {
    if (!q) return '';
    return q.q_zh ? `dlg:${q.q_zh}` : `voc:${q.zh || q.en || q.vi || ''}`;
  }

  function loadSrsVault() {
    return sGetJSON(STORAGE_KEYS.SRS, {});
  }

  function recordBirdSrs(q, isCorrect) {
    const key = getItemKey(q);
    if (!key) return false;
    const vault = loadSrsVault();
    if (!isCorrect) {
      vault[key] = {
        item: q,
        wins: 0,
        fails: ((vault[key] && vault[key].fails) || 0) + 1,
        ts: Date.now()
      };
      sSetJSON(STORAGE_KEYS.SRS, vault);
      return false;
    } else if (vault[key]) {
      vault[key].wins = (vault[key].wins || 0) + 1;
      let graduated = false;
      if (vault[key].wins >= 2) {
        delete vault[key];
        graduated = true;
      }
      sSetJSON(STORAGE_KEYS.SRS, vault);
      return graduated;
    }
    return false;
  }

  function getMistakeList() {
    const vault = loadSrsVault();
    return Object.values(vault)
      .filter((e) => e && e.item)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
      .map((e) => e.item);
  }

  // =========================================================================
  // 2. 🛸 AUTO-CRUISE READ BUFFER, ENERGY SHIELD & SKINS STATE
  // =========================================================================
  let autoCruiseEnabled = sGetStr(STORAGE_KEYS.CRUISE, '1') !== '0';
  let currentBirdSkin = sGetStr(STORAGE_KEYS.SKIN, 'qc_helmet'); // Default to cool Factory QC Helmet Bird!
  let hasEnergyShield = false;
  let shieldGraceFrames = 0;
  let cruiseFrames = 0;
  let isSrsRevengeRun = false;
  let _activeSyncedPipe = null;

  const BIRD_SKINS = [
    { id: 'neon', label: '🐦 Neon', unlockPts: 0 },
    { id: 'qc_helmet', label: '👷 Kỹ Sư Mũ QC', unlockPts: 0 },
    { id: 'phoenix', label: '🔥 Phượng Hoàng', unlockPts: 40 },
    { id: 'mecha', label: '🤖 Drone TĐH', unlockPts: 80 }
  ];

  // 55+ Core Factory / QC / Action Chinese Keywords to highlight in Cyber Gold (#fde047)
  const QC_HIGHLIGHT_KEYWORDS = [
    '限度样', '供应商', '不合格', '流水线', '缓冲层', '通风孔', '下巴带', '注塑机',
    '核对', '对标', '确认', '合格', '返工', '报废', '暂停', '停机', '全检', '抽检',
    '复检', '隔离', '更换', '调整', '记录', '通知', '汇报', '签字', '测试', '标准',
    '样品', '异常', '安全', '头盔', '原因', '检查', '立即', '马上', '严禁', '必须',
    '先', '禁止', '不能', '不用', '直接', '全部', '随便', '忽略', '隐瞒', '继续生产'
  ].sort((a, b) => b.length - a.length);

  // =========================================================================
  // 3. 🎯 PERFECT BANNER-TO-GATE SYNC & MULTI-MODE DIALOGUE LABELS
  // =========================================================================
  function formatGateLabelsForQuestion(q, correctAtTop) {
    if (isDialogueItem(q)) {
      let cText = q.correct_zh || '';
      let wText = q.wrong_zh || '';
      if (currentMode === 'en' && q.correct_en && q.wrong_en) {
        cText = q.correct_en;
        wText = q.wrong_en;
      } else if (currentMode === 'duo' && q.correct_vi && q.wrong_vi) {
        const shortCVi = q.correct_vi.length > 26 ? q.correct_vi.slice(0, 25) + '…' : q.correct_vi;
        const shortWVi = q.wrong_vi.length > 26 ? q.wrong_vi.slice(0, 25) + '…' : q.wrong_vi;
        cText = `${q.correct_zh} • ${shortCVi}`;
        wText = `${q.wrong_zh} • ${shortWVi}`;
      }
      return {
        topLabel: correctAtTop ? cText : wText,
        botLabel: correctAtTop ? wText : cText
      };
    }

    if (currentMode === 'zh') {
      return {
        topLabel: correctAtTop ? `${q.zh} (${q.pinyin})` : `${q.dist_zh} (${q.dist_pinyin})`,
        botLabel: correctAtTop ? `${q.dist_zh} (${q.dist_pinyin})` : `${q.zh} (${q.pinyin})`
      };
    } else if (currentMode === 'en') {
      return {
        topLabel: correctAtTop ? q.en : q.dist_en,
        botLabel: correctAtTop ? q.dist_en : q.en
      };
    } else {
      return {
        topLabel: correctAtTop ? `${q.en} • ${q.zh}` : `${q.dist_en} • ${q.dist_zh}`,
        botLabel: correctAtTop ? `${q.dist_en} • ${q.dist_zh}` : `${q.en} • ${q.zh}`
      };
    }
  }

  function syncBannerToQuestion(q, triggerVoice = true) {
    if (!q) return;
    currentQuestion = q;
    questBanner.classList.add('pulse');
    setTimeout(() => questBanner.classList.remove('pulse'), 240);

    if (isDialogueItem(q)) {
      if (questSpeaker) {
        questSpeaker.innerHTML = `${q.speaker || '💬 HỘI THOẠI XƯỞNG'}: <span class="v34-replay-pill">🔊 Nghe lại</span>`;
      }
      questTarget.textContent = (currentMode === 'en' && q.q_en) ? q.q_en : q.q_zh;
      if (questSub) questSub.textContent = `Nghĩa: ${q.q_vi || ''}`;
      if (triggerVoice) playDialogueAudio(q.q_audio);
    } else {
      const tag = isSrsRevengeRun
        ? '🩹 PHỤC THÙ TỪ HAY SAI'
        : (q.cat === 'daily' ? '📅 NHẬT KÝ NGÀY' : '🎯 BAY VÀO TỪ');
      if (questSpeaker) {
        questSpeaker.innerHTML = `${tag}: <span class="v34-replay-pill">🔊 Nghe lại</span>`;
      }
      questTarget.textContent = q.vi;
      if (questSub) questSub.textContent = `Tìm: ${q.zh} (${q.pinyin}) • ${q.en || ''}`;
      if (triggerVoice) playWordAudio(q);
    }
  }

  function replayActiveBannerAudio() {
    if (!currentQuestion) return;
    questBanner.classList.add('pulse');
    setTimeout(() => questBanner.classList.remove('pulse'), 220);
    if (isDialogueItem(currentQuestion)) {
      if (currentQuestion.q_audio) playDialogueAudio(currentQuestion.q_audio);
      else speakText(currentQuestion.q_zh, 'zh-CN');
    } else {
      playWordAudio(currentQuestion);
    }
  }

  // =========================================================================
  // 4. 📖 3-LINE SMART WRAP + GOLDEN QC KEYWORD HIGHLIGHTING ON PORTALS
  // =========================================================================
  function splitBalancedChineseLines(text, maxCharsPerLine) {
    const clean = (text || '').trim();
    if (!clean) return [''];
    if (clean.includes(' • ')) {
      const [p1, p2] = clean.split(' • ');
      const l1 = splitBalancedChineseLines(p1, maxCharsPerLine);
      return [...l1.slice(0, 2), p2].slice(0, 3);
    }
    if (clean.includes(' (')) {
      if (clean.length <= maxCharsPerLine + 3) return [clean];
      const idx = clean.indexOf(' (');
      return [clean.slice(0, idx), clean.slice(idx).trim()];
    }
    if (clean.length <= maxCharsPerLine) return [clean];

    // Split by clauses first (100% iOS Safari safe, zero lookbehind regex)
    const clauses = (clean.match(/[^，,；;、：:]+[，,；;、：:]?/g) || [clean]).map((s) => s.trim()).filter(Boolean);
    const lines = [];
    let cur = '';

    const pushChunk = (chunk) => {
      if (!chunk) return;
      if (!cur) {
        cur = chunk;
      } else if ((cur + chunk).length <= maxCharsPerLine + 1) {
        cur += chunk;
      } else {
        lines.push(cur);
        cur = chunk;
      }
    };

    if (clauses.length > 1) {
      for (const cl of clauses) {
        if (cl.length > maxCharsPerLine + 2) {
          const half = Math.ceil(cl.length / 2);
          pushChunk(cl.slice(0, half));
          pushChunk(cl.slice(half));
        } else {
          pushChunk(cl);
        }
      }
      if (cur) lines.push(cur);
    } else if (clean.includes(' ')) {
      // English or spaced text
      const words = clean.split(/\s+/);
      const maxEn = maxCharsPerLine * 2;
      for (const w of words) {
        if (!cur) cur = w;
        else if ((cur + ' ' + w).length <= maxEn) cur += ' ' + w;
        else {
          lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
    } else {
      const numLines = clean.length > maxCharsPerLine * 2 ? 3 : 2;
      const step = Math.ceil(clean.length / numLines);
      for (let i = 0; i < clean.length; i += step) {
        lines.push(clean.slice(i, i + step));
      }
    }

    if (lines.length > 3) {
      return [lines[0], lines[1], lines.slice(2).join('')];
    }
    return lines;
  }

  function tokenizeLineHighlights(lineStr) {
    if (!lineStr) return [];
    const tokens = [];
    let idx = 0;
    while (idx < lineStr.length) {
      let matchedKw = null;
      for (const kw of QC_HIGHLIGHT_KEYWORDS) {
        if (lineStr.startsWith(kw, idx)) {
          matchedKw = kw;
          break;
        }
      }
      if (matchedKw) {
        tokens.push({ text: matchedKw, highlight: true });
        idx += matchedKw.length;
      } else {
        if (tokens.length > 0 && !tokens[tokens.length - 1].highlight) {
          tokens[tokens.length - 1].text += lineStr[idx];
        } else {
          tokens.push({ text: lineStr[idx], highlight: false });
        }
        idx++;
      }
    }
    return tokens;
  }

  function drawHighlightedCenteredLine(ctx, lineText, centerX, centerY, maxW, enableHighlight) {
    if (!enableHighlight) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lineText, centerX, centerY, maxW);
      return;
    }
    const tokens = tokenizeLineHighlights(lineText);
    const totalW = ctx.measureText(lineText).width;
    const scaleX = totalW > maxW ? (maxW / totalW) : 1;

    ctx.save();
    ctx.translate(centerX, centerY);
    if (scaleX < 1) ctx.scale(scaleX, 1);
    ctx.textAlign = 'left';
    let curX = -totalW / 2;
    for (const tk of tokens) {
      ctx.fillStyle = tk.highlight ? '#fde047' : '#ffffff';
      ctx.fillText(tk.text, curX, 0);
      curX += ctx.measureText(tk.text).width;
    }
    ctx.restore();
  }

  function renderPortalTextV34(ctx, prefix, fullLabel, centerX, centerY, maxW, maxH) {
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
    ctx.shadowBlur = 4;

    const clean = (fullLabel || '').trim();
    const hasHanzi = /[\u4e00-\u9fff]/.test(clean);
    const maxChars = hasHanzi ? 11 : 13;
    const lines = splitBalancedChineseLines(clean, maxChars);

    let fontSize = currentFontSizePx;
    if (lines.length === 2) fontSize = Math.min(fontSize, 15);
    else if (lines.length >= 3) fontSize = Math.min(fontSize, 13.5);

    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    lines[0] = `${prefix} ${lines[0]}`;

    const useKwHighlight = hasHanzi && clean.length >= 8;
    const lineSpacing = lines.length >= 3 ? fontSize * 1.24 : fontSize * 1.32;
    const startY = centerY - ((lines.length - 1) * lineSpacing) / 2;

    for (let i = 0; i < lines.length; i++) {
      drawHighlightedCenteredLine(ctx, lines[i], centerX, startY + i * lineSpacing, maxW, useKwHighlight);
    }
    ctx.restore();
  }

  // =========================================================================
  // 5. 🎨 4 FACTORY & CYBER BIRD SKINS + ENERGY SHIELD + AUTO-CRUISE HUD
  // =========================================================================
  function drawCyberBirdV34(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);

    // Blink softly during post-shield recovery grace frames
    if (shieldGraceFrames > 0 && Math.floor(shieldGraceFrames / 4) % 2 === 0) {
      ctx.globalAlpha = 0.6;
    }

    // 1. Draw Cyber Energy Shield Bubble (if active)
    if (hasEnergyShield) {
      ctx.save();
      const pulseR = 25 + Math.sin(frameCount * 0.14) * 2;
      ctx.strokeStyle = '#2dd4bf';
      ctx.fillStyle = 'rgba(45, 212, 191, 0.14)';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(2, 0, pulseR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Auto-Cruise Read Buffer Halo (Phương Án B)
    if (cruiseFrames > 0) {
      ctx.save();
      const secLeft = (cruiseFrames / 60).toFixed(1);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-42, -44, 96, 19, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🛸 ĐỌC CÂU ${secLeft}s`, 6, -34.5);
      ctx.restore();
    }

    ctx.rotate(angle);

    // Skin palette
    let bodyCol = '#0284c7';
    let wingCol = '#38bdf8';
    let eyeCol = '#f43f5e';
    if (isOverdrive) {
      bodyCol = '#ec4899';
      wingCol = '#f472b6';
      eyeCol = '#fde047';
    } else if (currentBirdSkin === 'phoenix') {
      bodyCol = '#dc2626';
      wingCol = '#f59e0b';
      eyeCol = '#fef08a';
    } else if (currentBirdSkin === 'mecha') {
      bodyCol = '#475569';
      wingCol = '#22d3ee';
      eyeCol = '#34d399';
    }

    ctx.shadowColor = isOverdrive
      ? `hsl(${(frameCount * 15) % 360}, 100%, 65%)`
      : (currentBirdSkin === 'phoenix' ? '#f97316' : '#38bdf8');
    ctx.shadowBlur = isOverdrive ? 24 : 15;

    // Body
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mecha armor trim
    if (currentBirdSkin === 'mecha') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Wing (animated gentle flutter)
    const wingAngle = -Math.PI / 8 + Math.sin(frameCount * 0.25) * 0.14;
    ctx.fillStyle = wingCol;
    ctx.beginPath();
    ctx.ellipse(-4, 2, 10, 6, wingAngle, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = eyeCol;
    ctx.shadowColor = eyeCol;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(8, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(9, -5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(24, 2);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fill();

    // Special Accessory: 👷 Factory QC Safety Hard-Hat!
    if (currentBirdSkin === 'qc_helmet') {
      ctx.save();
      // Yellow Safety Helmet Dome
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(1, -9, 13, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Helmet Brim / Visor
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.roundRect(-14, -10.5, 31, 3.5, 2);
      ctx.fill();

      // QC Red/Cyan Badge Stripe
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-4, -17, 10, 4);
      ctx.restore();
    } else if (currentBirdSkin === 'mecha') {
      // Drone antenna
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-2, -13);
      ctx.lineTo(-5, -21);
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(-5, -21, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 6. 🧩 RADICAL BREAKDOWN v2.0 + ✍️ TIANZIGE CALLIGRAPHY MODAL
  // =========================================================================
  const FALLBACK_RADICALS = {
    '头': { parts: ['丶', '丶', '大'], meanings: ['2 chấm tóc', 'đại (người lớn)'], mnemonic: 'Hai chấm tóc trên người lớn = CÁI ĐẦU (Đầu khôi = Mũ bảo hiểm)' },
    '盔': { parts: ['灰', '皿'], meanings: ['hôi (xám)', 'mãnh (vỏ cứng)'], mnemonic: 'Vỏ chậu cứng bảo vệ đầu = MŨ BẢO HIỂM' },
    '检': { parts: ['木', '佥'], meanings: ['mộc (khuôn mẫu)', 'thiêm (đối chiếu)'], mnemonic: 'Đối chiếu kỹ từng chi tiết với mẫu chuẩn = KIỂM TRA (QC)' },
    '合': { parts: ['人', '一', '口'], meanings: ['nắp', 'khít', 'hộp'], mnemonic: 'Nắp đậy vừa khít miệng hộp = HỢP CÁCH / ĐẠT CHUẨN' },
    '格': { parts: ['木', '各'], meanings: ['khung chuẩn', 'riêng từng ô'], mnemonic: 'Khung tiêu chuẩn rõ ràng = QUY CÁCH' }
  };

  function getRadicalDB() {
    return Object.assign({}, FALLBACK_RADICALS, window.RADICAL_DB_V42 || {});
  }

  function extractQuestionHanziString(q) {
    if (!q) return '';
    if (isDialogueItem(q)) {
      return `${q.correct_zh || ''}${q.q_zh || ''}`;
    }
    return q.zh || '';
  }

  let _birdTraceActive = false;

  function openBirdRadicalModal(rawZh, idx = 0) {
    const uniqueChars = [];
    for (const ch of Array.from(String(rawZh || ''))) {
      if (/[\u4e00-\u9fff]/.test(ch) && !uniqueChars.includes(ch)) {
        uniqueChars.push(ch);
      }
    }
    if (uniqueChars.length === 0) return;
    const safeIdx = Math.max(0, Math.min(uniqueChars.length - 1, idx));
    const activeChar = uniqueChars[safeIdx];
    const db = getRadicalDB();
    const info = db[activeChar] || {
      parts: [activeChar],
      meanings: ['Hán tự nguyên khối'],
      mnemonic: `Chữ "${activeChar}" trong câu thực chiến nhà xưởng — bấm "✍️ Tập Viết" để quẹt tay nhớ mặt chữ gấp 3 lần!`
    };

    document.getElementById('v34-radical-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'v34-radical-modal';
    modal.className = 'v34-modal-backdrop v34-no-flap';
    const escapedRaw = uniqueChars.join('').replace(/'/g, '');

    modal.innerHTML = `
      <div class="v34-modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:12px;font-weight:900;color:#38bdf8;">🧩 CHIẾT TỰ BỘ THỦ &amp; LUYỆN NÉT</span>
          <button class="v34-mini-btn" onclick="window._speakBirdChar('${activeChar}')">🔊 Đọc "${activeChar}"</button>
        </div>
        <div class="v34-char-tabs">
          ${uniqueChars.slice(0, 14).map((c, i) => `
            <button class="v34-char-tab ${i === safeIdx ? 'active' : ''}" onclick="window.openBirdRadicalModal('${escapedRaw}', ${i})">${c}</button>
          `).join('')}
        </div>

        <div id="v34-rad-eq-view">
          <div style="font-size:46px;font-weight:900;color:#fff;margin:6px 0;">${activeChar}</div>
          <div class="v34-rad-eq">
            ${info.parts.map((p, i) => `
              <span class="v34-rad-chip">${p}</span>
              ${i < info.parts.length - 1 ? '<span style="color:#64748b;font-weight:900;">+</span>' : ''}
            `).join('')}
            <span style="color:#fde047;font-weight:900;">=</span>
            <span class="v34-rad-chip res">${activeChar}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:8px 0;">
            ${info.parts.map((p, i) => `<span class="v34-meaning-tag">${p}: ${info.meanings[i] || ''}</span>`).join('')}
          </div>
        </div>

        <div id="v34-rad-pad-view" class="hidden" style="margin:6px auto;">
          <div style="font-size:11px;color:#7dd3fc;margin-bottom:4px;font-weight:800;">✍️ Quẹt ngón tay tô theo nét chữ mờ:</div>
          <canvas id="v34-trace-cvs" width="184" height="184" style="border-radius:14px;border:1.5px solid #38bdf8;background:#071022;touch-action:none;"></canvas>
          <div style="margin-top:5px;">
            <button class="v34-mini-btn" onclick="window._clearBirdTrace && window._clearBirdTrace()">🧹 Xóa nét</button>
          </div>
        </div>

        <div class="v34-mnemonic-box">💡 ${info.mnemonic}</div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="v34-sec-btn" onclick="window._toggleBirdTrace('${activeChar}')">✍️ Tập Viết</button>
          <button class="v34-pri-btn" onclick="document.getElementById('v34-radical-modal')?.remove()">Đã nhớ ✓</button>
        </div>
      </div>
    `;
    document.getElementById('game-container').appendChild(modal);
    _birdTraceActive = false;
    speakText(activeChar, 'zh-CN');
  }

  window.openBirdRadicalModal = openBirdRadicalModal;
  window._speakBirdChar = function (ch) {
    speakText(ch, 'zh-CN');
  };
  window._toggleBirdTrace = function (ch) {
    const eq = document.getElementById('v34-rad-eq-view');
    const pd = document.getElementById('v34-rad-pad-view');
    if (!eq || !pd) return;
    _birdTraceActive = !_birdTraceActive;
    eq.classList.toggle('hidden', _birdTraceActive);
    pd.classList.toggle('hidden', !_birdTraceActive);
    if (_birdTraceActive) {
      initBirdCalligraphyCanvas(document.getElementById('v34-trace-cvs'), ch);
    }
  };

  function initBirdCalligraphyCanvas(cvs, ch) {
    if (!cvs) return;
    const size = 184;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cvs.style.width = size + 'px';
    cvs.style.height = size + 'px';
    cvs.width = Math.round(size * dpr);
    cvs.height = Math.round(size * dpr);
    const c = cvs.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    let strokes = [];
    let cur = null;

    function draw() {
      c.clearRect(0, 0, size, size);
      c.save();
      c.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      c.setLineDash([5, 5]);
      c.beginPath();
      c.moveTo(size / 2, 0); c.lineTo(size / 2, size);
      c.moveTo(0, size / 2); c.lineTo(size, size / 2);
      c.moveTo(0, 0); c.lineTo(size, size);
      c.moveTo(size, 0); c.lineTo(0, size);
      c.stroke();
      c.restore();

      c.save();
      c.fillStyle = 'rgba(148, 163, 184, 0.22)';
      c.font = `900 ${Math.round(size * 0.72)}px "KaiTi", "STKaiti", "Microsoft YaHei", sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(ch, size / 2, size / 2 + 4);
      c.restore();

      c.save();
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 8;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.shadowColor = '#38bdf8';
      c.shadowBlur = 8;
      for (const st of strokes) {
        if (st.length < 2) continue;
        c.beginPath();
        c.moveTo(st[0].x, st[0].y);
        for (let i = 1; i < st.length; i++) c.lineTo(st[i].x, st[i].y);
        c.stroke();
      }
      c.restore();
    }

    function pt(e) {
      const r = cvs.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    cvs.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      cvs.setPointerCapture(e.pointerId);
      cur = [pt(e)];
      strokes.push(cur);
      draw();
    };
    cvs.onpointermove = (e) => {
      if (!cur) return;
      e.preventDefault();
      cur.push(pt(e));
      draw();
    };
    cvs.onpointerup = () => { cur = null; };
    window._clearBirdTrace = () => { strokes = []; draw(); };
    draw();
  }

  // =========================================================================
  // 7. 🎵 MUSICAL PITCH-ASCENDING CHIME & SHIELD SAVE SFX
  // =========================================================================
  function installMusicalComboAudio() {
    if (!soundEngine || !soundEngine.playCorrect) return;
    const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    soundEngine.playCorrect = function (curStreak = 0) {
      if (!this.sfxEnabled) return;
      this.init();
      const t = this.ctx.currentTime;
      const baseFreq = PENTATONIC[Math.min(PENTATONIC.length - 1, Math.max(0, curStreak - 1))];
      [baseFreq, baseFreq * 1.5].forEach((freq, idx) => {
        const nt = t + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, nt);
        gain.gain.setValueAtTime(0.16, nt);
        gain.gain.exponentialRampToValueAtTime(0.0001, nt + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(nt);
        osc.stop(nt + 0.22);
      });
    };

    soundEngine.playShieldSave = function () {
      if (!this.sfxEnabled) return;
      this.init();
      const t = this.ctx.currentTime;
      [440, 659.25, 880].forEach((f, i) => {
        const nt = t + i * 0.06;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, nt);
        g.gain.setValueAtTime(0.22, nt);
        g.gain.exponentialRampToValueAtTime(0.0001, nt + 0.28);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(nt);
        osc.stop(nt + 0.28);
      });
    };
  }

  // =========================================================================
  // 8. HOOK CORE GAME ENGINE FUNCTIONS
  // =========================================================================
  function hookCoreGameV34() {
    installMusicalComboAudio();

    // 8.1 Override renderPortalText & drawCyberBird
    window.renderPortalText = renderPortalTextV34;
    window.drawCyberBird = drawCyberBirdV34;

    // 8.2 Override spawnGate -> NO premature banner overwrite!
    window.spawnGate = function () {
      if (!activeVocabList || activeVocabList.length === 0) {
        activeVocabList = (currentPlayMode === 'dialogue') ? [...FACTORY_DIALOGUES] : [...FULL_VOCAB_DATABASE];
      }
      const q = activeVocabList[Math.floor(Math.random() * activeVocabList.length)];
      const topH = Math.random() * (canvas.height - gateGap - 220) + 100;
      const correctAtTop = Math.random() > 0.5;
      const { topLabel, botLabel } = formatGateLabelsForQuestion(q, correctAtTop);

      const newPipe = {
        x: canvas.width + 30,
        top: topH,
        passed: false,
        question: q,
        correctAtTop: correctAtTop,
        topLabel: topLabel,
        botLabel: botLabel,
        w: 52
      };
      pipes.push(newPipe);

      // Only sync banner immediately if there is NO other un-passed gate ahead of the bird!
      const unpassed = pipes.filter((p) => !p.passed);
      if (unpassed.length === 1) {
        _activeSyncedPipe = newPipe;
        syncBannerToQuestion(q, true);
        if (autoCruiseEnabled && isLongOrDialogue(q)) {
          cruiseFrames = 84; // ~1.4 seconds Auto-Cruise Read Buffer (Phương Án B)
        }
      }
    };

    // 8.3 Override getNextUpcomingPipe -> Syncs Banner on exact gate transition + drives Auto-Cruise & Shield Grace!
    window.getNextUpcomingPipe = function () {
      if (shieldGraceFrames > 0) shieldGraceFrames--;

      let upcoming = null;
      for (const p of pipes) {
        if (!p.passed) {
          upcoming = p;
          break;
        }
      }

      if (upcoming && upcoming !== _activeSyncedPipe) {
        _activeSyncedPipe = upcoming;
        syncBannerToQuestion(upcoming.question, true);
        if (autoCruiseEnabled && isLongOrDialogue(upcoming.question)) {
          cruiseFrames = 84;
        }
      }

      // Auto-Cruise Read Buffer physics (Phương Án B): holds altitude smoothly for 1.4s while player reads banner
      if (cruiseFrames > 0 && gameState === 'playing') {
        cruiseFrames--;
        const safeMidY = upcoming ? (upcoming.top + gateGap / 2) : (canvas.height / 2);
        bird.y += (safeMidY - bird.y) * 0.085;
        bird.vy = -gravity; // Cancels loop()'s `bird.vy += gravity` so net vy == 0!
        pipeSpeed = Math.min(pipeSpeed, basePipeSpeed * 0.38);
      }

      return upcoming;
    };

    // 8.4 Override flap -> Instant manual takeover from Auto-Cruise!
    const origFlap = window.flap;
    window.flap = function () {
      if (cruiseFrames > 0) cruiseFrames = 0;
      origFlap();
    };

    // 8.5 Override switchMode -> Refresh active pipe labels & banner immediately!
    const origSwitchMode = window.switchMode;
    window.switchMode = function (m) {
      currentMode = m;
      document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
      document.getElementById(`mode-${m}`)?.classList.add('active');
      for (const p of pipes) {
        if (!p.passed && p.question) {
          const lbls = formatGateLabelsForQuestion(p.question, p.correctAtTop);
          p.topLabel = lbls.topLabel;
          p.botLabel = lbls.botLabel;
        }
      }
      if (gameState === 'playing' && currentQuestion) {
        syncBannerToQuestion(currentQuestion, false);
      }
    };

    // 8.6 Override updateScoreHUD -> Show Shield Icon on Streak Badge
    const origUpdateHUD = window.updateScoreHUD;
    window.updateScoreHUD = function () {
      origUpdateHUD();
      if (hasEnergyShield && streakBadge) {
        streakBadge.textContent = `🛡️ ${streakBadge.textContent}`;
      }
    };

    // 8.7 Override startGame -> Initialize Daily Streak, Energy Shield & Reset Sync State
    const origStartGame = window.startGame;
    window.startGame = function (revengeMode = false) {
      isSrsRevengeRun = Boolean(revengeMode);
      if (isSrsRevengeRun) {
        const mistakes = getMistakeList();
        if (mistakes.length > 0) {
          const pad = [...FACTORY_DIALOGUES.slice(0, 4), ...FULL_VOCAB_DATABASE.slice(0, 4)];
          activeVocabList = mistakes.length >= 5 ? mistakes : [...mistakes, ...mistakes, ...pad];
        } else {
          isSrsRevengeRun = false;
        }
      }

      const daily = loadAndTouchDailyStreak(true);
      hasEnergyShield = (currentDifficulty === 'easy') || ((daily.streak || 1) >= 2) || isSrsRevengeRun;
      shieldGraceFrames = 0;
      cruiseFrames = 0;
      _activeSyncedPipe = null;
      document.getElementById('v34-pause-overlay')?.classList.add('hidden');

      origStartGame();
      window.updateScoreHUD();

      if (hasEnergyShield) {
        addFloatingText(bird.x + 45, bird.y - 34, '🛡️ KHIÊN HỘ MỆNH SẴN SÀNG!', '#2dd4bf', 13.5);
      }
    };

    // 8.8 Override onAnswer -> Recharge Shield every 5 streak + Graduate SRS Mistakes
    const origOnAnswer = window.onAnswer;
    window.onAnswer = function (isCorrect, pipe) {
      if (isCorrect) {
        const prevHigh = highscore;
        const graduated = recordBirdSrs(pipe.question, true);
        origOnAnswer(true, pipe);

        if (graduated) {
          score += 15;
          addFloatingText(bird.x + 30, bird.y - 52, '🩹 ĐÃ XÓA NỢ CÂU SAI! +15', '#fde047', 15);
        }
        if (streak > 0 && streak % 5 === 0 && !hasEnergyShield) {
          hasEnergyShield = true;
          addFloatingText(bird.x + 35, bird.y - 66, '🛡️ NẠP ĐẦY KHIÊN HỘ MỆNH!', '#2dd4bf', 15);
        }
        if (awardFreezeOnMilestone(score, prevHigh)) {
          addFloatingText(bird.x + 40, bird.y - 80, '❄️ +1 KHIÊN BĂNG BẢO VỆ STREAK!', '#38bdf8', 14);
        }
        window.updateScoreHUD();
        renderStartHubV34();
      } else {
        window.gameOver(pipe.question, pipe);
      }
    };

    // 8.9 Override gameOver -> Intercept with Energy Shield OR show Radical Breakdown button
    const origGameOver = window.gameOver;
    window.gameOver = function (q, failedPipe = null) {
      if (gameState !== 'playing') return;

      // Ignore residual wall/floor touches while recovering from a shield save
      if (shieldGraceFrames > 0) {
        const safeMid = _activeSyncedPipe ? (_activeSyncedPipe.top + gateGap / 2) : (canvas.height / 2);
        bird.y = Math.max(70, Math.min(canvas.height - 90, safeMid));
        bird.vy = -1.5;
        return;
      }

      const targetQ = q || currentQuestion;
      recordBirdSrs(targetQ, false);

      // ENERGY SHIELD INTERCEPT!
      if (hasEnergyShield) {
        hasEnergyShield = false;
        shieldGraceFrames = 72; // ~1.2s invulnerability recovery
        cruiseFrames = 0;

        // Mark colliding or failed pipe as passed so it won't re-collide next frame
        if (failedPipe) failedPipe.passed = true;
        for (const p of pipes) {
          if (!p.passed && p.x < bird.x + 85) {
            p.passed = true;
          }
        }

        const nextP = pipes.find((p) => !p.passed);
        const safeY = nextP ? (nextP.top + gateGap / 2) : (canvas.height / 2);
        bird.y = Math.max(85, Math.min(canvas.height - 105, safeY));
        bird.vy = -2.2;

        if (soundEngine && soundEngine.playShieldSave) soundEngine.playShieldSave();
        vibrate([40, 30, 60]);
        triggerShake(7);
        addFloatingText(bird.x + 55, bird.y - 30, '🛡️ VỠ KHIÊN — CỨU MẠNG!', '#2dd4bf', 17);

        for (let i = 0; i < 24; i++) {
          particles.push({
            x: bird.x,
            y: bird.y,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 9,
            color: i % 2 === 0 ? '#2dd4bf' : '#fde047',
            size: 3.5,
            life: 34
          });
        }
        window.updateScoreHUD();
        renderStartHubV34();
        return;
      }

      // Actual Game Over
      isSrsRevengeRun = false;
      origGameOver(targetQ);
      renderStartHubV34();
      updateGameOverRadicalButton(targetQ);
    };

    // 8.10 Override returnToMenu -> Refresh Hub stats & return to regular pool
    const origReturnMenu = window.returnToMenu;
    window.returnToMenu = function () {
      if (isSrsRevengeRun) {
        isSrsRevengeRun = false;
        if (typeof selectPlayMode === 'function') selectPlayMode(currentPlayMode || 'timeline');
      }
      document.getElementById('v34-pause-overlay')?.classList.add('hidden');
      origReturnMenu();
      renderStartHubV34();
    };
  }

  function updateGameOverRadicalButton(q) {
    const fcBox = document.getElementById('flashcard-box');
    if (!fcBox) return;
    let btn = document.getElementById('v34-fc-radical-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'v34-fc-radical-btn';
      btn.className = 'replay-voice-btn v34-no-flap';
      btn.style.cssText = 'margin-left:6px;background:rgba(168,85,247,0.22);border-color:#c084fc;color:#f3e8ff;';
      const replayBtn = fcBox.querySelector('.replay-voice-btn');
      if (replayBtn) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-top:8px;';
        replayBtn.style.marginTop = '0';
        replayBtn.parentNode.insertBefore(row, replayBtn);
        row.appendChild(replayBtn);
        row.appendChild(btn);
      } else {
        fcBox.appendChild(btn);
      }
    }
    const zhChars = extractQuestionHanziString(q);
    const hasZh = /[\u4e00-\u9fff]/.test(zhChars);
    btn.style.display = hasZh ? 'inline-flex' : 'none';
    btn.innerHTML = '🧩 Tách Bộ Thủ &amp; Tập Viết';
    btn.onclick = () => openBirdRadicalModal(zhChars, 0);
  }

  // =========================================================================
  // 9. 🎨 UI INJECTION (HUB STRIP, AUTO-CRUISE & SKIN SETTINGS, AUTO-PAUSE)
  // =========================================================================
  function injectV34StylesAndDOM() {
    if (!document.getElementById('v34-styles')) {
      const st = document.createElement('style');
      st.id = 'v34-styles';
      st.textContent = `
        #quest-banner { cursor: pointer; }
        .v34-replay-pill {
          display: inline-block;
          font-size: 9.5px;
          color: #fde047;
          background: rgba(250, 204, 21, 0.14);
          border: 1px solid rgba(250, 204, 21, 0.4);
          padding: 1px 6px;
          border-radius: 99px;
          margin-left: 4px;
          vertical-align: middle;
        }
        .v34-hub-strip {
          width: 100%;
          max-width: 370px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          margin: 4px 0 8px;
        }
        .v34-hub-chip {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.35);
          border-radius: 11px;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 800;
          color: #e2e8f0;
          text-align: center;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: transform 0.1s ease;
        }
        .v34-hub-chip:active, .play-btn:active, .opt-btn:active, .mode-btn:active {
          transform: scale(0.93);
        }
        .v34-hub-chip.revenge-hot {
          border-color: #f43f5e;
          background: linear-gradient(135deg, rgba(225, 29, 72, 0.25), rgba(15, 23, 42, 0.92));
          color: #fecdd3;
        }
        .v34-hub-chip.arcade-link {
          border-color: rgba(192, 132, 252, 0.5);
          background: linear-gradient(135deg, rgba(126, 34, 206, 0.25), rgba(15, 23, 42, 0.92));
          color: #e9d5ff;
        }
        .v34-hub-chip.eon-factory-link {
          grid-column: span 2;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 900;
          border: 1.5px solid #34d399;
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.42), rgba(15, 23, 42, 0.96));
          color: #fde047;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.32);
        }
        .v34-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(3, 7, 18, 0.86);
          backdrop-filter: blur(10px);
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
        }
        .v34-modal-backdrop.hidden { display: none; }
        .v34-modal-card {
          width: 100%;
          max-width: 348px;
          background: linear-gradient(145deg, #0f172a, #090d1a);
          border: 1.5px solid #38bdf8;
          border-radius: 18px;
          padding: 14px;
          text-align: center;
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.8);
        }
        .v34-char-tabs {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 5px;
          margin-bottom: 6px;
        }
        .v34-char-tab {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(30, 41, 59, 0.85);
          color: #cbd5e1;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }
        .v34-char-tab.active {
          border-color: #38bdf8;
          background: rgba(2, 132, 199, 0.38);
          color: #fff;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.45);
        }
        .v34-rad-eq {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        .v34-rad-chip {
          padding: 5px 10px;
          border-radius: 10px;
          background: rgba(56, 189, 248, 0.16);
          border: 1px solid rgba(56, 189, 248, 0.45);
          font-size: 20px;
          font-weight: 900;
          color: #e0f2fe;
        }
        .v34-rad-chip.res {
          background: rgba(250, 204, 21, 0.18);
          border-color: #fde047;
          color: #fde047;
        }
        .v34-meaning-tag {
          font-size: 10.5px;
          padding: 2px 7px;
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.9);
          color: #bae6fd;
          border: 1px solid rgba(56, 189, 248, 0.25);
        }
        .v34-mnemonic-box {
          font-size: 11.5px;
          line-height: 1.4;
          color: #fde68a;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: 11px;
          padding: 8px 10px;
          margin-top: 6px;
        }
        .v34-mini-btn {
          padding: 4px 9px;
          border-radius: 8px;
          border: 1px solid rgba(56, 189, 248, 0.45);
          background: rgba(2, 132, 199, 0.25);
          color: #e0f2fe;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }
        .v34-sec-btn, .v34-pri-btn {
          flex: 1;
          padding: 9px;
          border-radius: 11px;
          font-size: 12.5px;
          font-weight: 900;
          cursor: pointer;
        }
        .v34-sec-btn {
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.45);
          color: #7dd3fc;
        }
        .v34-pri-btn {
          background: linear-gradient(135deg, #0284c7, #2563eb);
          border: none;
          color: #fff;
        }
      `;
      document.head.appendChild(st);
    }

    // 9.1 Tap Quest Banner to replay voice without flapping!
    if (questBanner) {
      questBanner.classList.add('v34-no-flap');
      questBanner.onclick = (e) => {
        e.stopPropagation();
        replayActiveBannerAudio();
      };
    }

    // 9.2 Inject Hub Strip above Hero Play Button on Start Screen
    const heroBtn = document.querySelector('.hero-play-btn');
    if (heroBtn && !document.getElementById('v34-start-hub')) {
      const hub = document.createElement('div');
      hub.id = 'v34-start-hub';
      hub.className = 'v34-hub-strip v34-no-flap';
      heroBtn.parentNode.insertBefore(hub, heroBtn);
    }

    // 9.3 Inject Auto-Cruise (Phương Án B) & Bird Skin Rows into .settings-panel
    const settingsPanel = document.querySelector('.settings-panel');
    if (settingsPanel && !document.getElementById('v34-cruise-row')) {
      const cruiseRow = document.createElement('div');
      cruiseRow.id = 'v34-cruise-row';
      cruiseRow.className = 'setting-row';
      cruiseRow.innerHTML = `
        <span class="setting-title">🛸 Câu Dài:</span>
        <div class="setting-pills">
          <button id="v34-cr-on" class="opt-btn ${autoCruiseEnabled ? 'active' : ''}" onclick="window._setAutoCruise(true)">🛸 Tự Lướt 1.4s (B)</button>
          <button id="v34-cr-off" class="opt-btn ${!autoCruiseEnabled ? 'active' : ''}" onclick="window._setAutoCruise(false)">⚡ Bay Liền (A)</button>
        </div>
      `;
      settingsPanel.appendChild(cruiseRow);

      const skinRow = document.createElement('div');
      skinRow.id = 'v34-skin-row';
      skinRow.className = 'setting-row';
      skinRow.innerHTML = `
        <span class="setting-title">🎨 Chiến Điểu:</span>
        <div id="v34-skin-pills" class="setting-pills" style="flex-wrap:wrap;justify-content:flex-end;"></div>
      `;
      settingsPanel.appendChild(skinRow);
    }

    // 9.4 Inject Mobile Auto-Pause Overlay
    const container = document.getElementById('game-container');
    if (container && !document.getElementById('v34-pause-overlay')) {
      const pOv = document.createElement('div');
      pOv.id = 'v34-pause-overlay';
      pOv.className = 'v34-modal-backdrop v34-no-flap hidden';
      pOv.innerHTML = `
        <div class="v34-modal-card">
          <div style="font-size:20px;font-weight:900;color:#fde047;margin-bottom:6px;">⏸ ĐANG TẠM DỪNG</div>
          <div style="font-size:12px;color:#cbd5e1;margin-bottom:12px;">Game đã tự giữ an toàn cho Chiến Điểu khi bạn chuyển màn hình!</div>
          <button class="play-btn" style="width:100%;" onclick="window._resumeBirdFromPause()">▶ BAY TIẾP NGAY</button>
        </div>
      `;
      container.appendChild(pOv);
    }

    // 9.5 Mobile Visibility Auto-Pause Listener
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && gameState === 'playing') {
        gameState = 'paused';
        stopCurrentVoice();
        if (soundEngine) soundEngine.stopBGM();
        document.getElementById('v34-pause-overlay')?.classList.remove('hidden');
      }
    });
  }

  window._setAutoCruise = function (enabled) {
    autoCruiseEnabled = Boolean(enabled);
    sSetStr(STORAGE_KEYS.CRUISE, autoCruiseEnabled ? '1' : '0');
    document.getElementById('v34-cr-on')?.classList.toggle('active', autoCruiseEnabled);
    document.getElementById('v34-cr-off')?.classList.toggle('active', !autoCruiseEnabled);
  };

  window._selectBirdSkin = function (skinId, unlockPts) {
    if (highscore < unlockPts) {
      alert(`🔒 Đạt Kỷ lục ${unlockPts} pts để mở khóa Chiến Điểu này! (Kỷ lục hiện tại: ${highscore} pts)`);
      return;
    }
    currentBirdSkin = skinId;
    sSetStr(STORAGE_KEYS.SKIN, skinId);
    renderSkinPills();
  };

  window._resumeBirdFromPause = function () {
    document.getElementById('v34-pause-overlay')?.classList.add('hidden');
    if (gameState === 'paused') {
      cruiseFrames = Math.max(cruiseFrames, 45); // Gentle 0.75s hover on resume so bird doesn't plummet!
      gameState = 'playing';
      if (soundEngine && soundEngine.bgmEnabled) soundEngine.startBGM();
    }
  };

  window._startSrsRevengeFlight = function () {
    const cnt = getMistakeList().length;
    if (cnt === 0) {
      window.startGame(false);
      return;
    }
    window.startGame(true);
  };

  function renderSkinPills() {
    const box = document.getElementById('v34-skin-pills');
    if (!box) return;
    if (highscore < 40 && (currentBirdSkin === 'phoenix' || currentBirdSkin === 'mecha')) {
      currentBirdSkin = 'qc_helmet';
    }
    box.innerHTML = BIRD_SKINS.map((sk) => {
      const locked = highscore < sk.unlockPts;
      const active = currentBirdSkin === sk.id;
      return `<button class="opt-btn ${active ? 'active' : ''}" style="font-size:10.5px;padding:4px 7px;${locked ? 'opacity:0.55;' : ''}" onclick="window._selectBirdSkin('${sk.id}', ${sk.unlockPts})">${locked ? '🔒 ' : ''}${sk.label}</button>`;
    }).join('');
  }

  function renderStartHubV34() {
    const hub = document.getElementById('v34-start-hub');
    if (!hub) return;
    const daily = loadAndTouchDailyStreak(false);
    const mistakesCnt = getMistakeList().length;

    hub.innerHTML = `
      <a class="v34-hub-chip eon-factory-link" href="https://truongduc164.github.io/factory-eon/">
        🏭 VÀO GAME NHÀ MÁY EON (G179 • 17 Khu QA/QC) ➜
      </a>
      <button class="v34-hub-chip ${mistakesCnt > 0 ? 'revenge-hot' : ''}" onclick="window._startSrsRevengeFlight()">
        🩹 Ôn Câu Sai (${mistakesCnt})
      </button>
      <a class="v34-hub-chip arcade-link" href="https://truongduc164.github.io/cyberlingo-arcade/">
        🕹️ Arcade Top 12 →
      </a>
      <div class="v34-hub-chip" title="Chuỗi ngày bay liên tiếp &amp; Khiên Băng bảo hộ">
        🔥 ${daily.streak || 1} Ngày • ❄️ ${daily.freezes || 0}/3
      </div>
      <div class="v34-hub-chip" title="Kỷ lục cao nhất &amp; Trạng thái Khiên Hộ Mệnh">
        🏆 Kỷ lục: ${highscore} • 🛡️ Khiên
      </div>
    `;
    renderSkinPills();
  }

  function initCyberBirdV34() {
    hookCoreGameV34();
    injectV34StylesAndDOM();
    renderStartHubV34();
    console.log('🚀 [CyberBird Lingo PRO v3.4.0] Auto-Cruise + QC Keyword Highlight + Energy Shield + Radical Dojo READY!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCyberBirdV34);
  } else {
    initCyberBirdV34();
  }
})();
