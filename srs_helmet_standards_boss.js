/**
 * CYBERBIRD LINGO v3.6.1 — HELMET STANDARDS SM-2 SRS & BOSS BATTLE PACK
 * CPSC 16 CFR 1203 / CE EN 1078 / GB 24429 / AS-NZS 2063 (Vi - En - Zh - Pinyin)
 * Offline-first SM-2 Spaced Repetition + 10-Question Certification Boss Arena
 */
(function () {
  'use strict';

  const SRS_STORAGE_KEY = 'cyberbird_helmet_std_sm2_v1';

  const HELMET_STANDARDS_DECK = [
    {
      id: 'std_01',
      standard: 'US CPSC 16 CFR 1203',
      zh: '美国CPSC 1203冲击峰值加速度上限300g',
      pinyin: 'Měiguó CPSC 1203 chōngjī fēngzhí jiāsùdù shàngxiàn 300g',
      en: 'CPSC 16 CFR 1203 Peak Acceleration Limit < 300g',
      vi: 'Chuẩn Mỹ CPSC 16 CFR 1203: Gia tốc đỉnh va đập < 300g',
      feynman: 'Mũ Mỹ rơi từ độ cao 2.0m xuống đe phẳng (hoặc 1.2m đe bán cầu/lề đường) không được vượt quá 300g.',
      audio_zh: 'audio/boss_std_01.mp3',
      audio_en: 'audio/boss_std_01_en.mp3'
    },
    {
      id: 'std_02',
      standard: 'EU CE EN 1078',
      zh: '欧盟EN 1078峰值加速度限值250g',
      pinyin: 'Ōuméng EN 1078 fēngzhí jiāsùdù xiànzhí 250g',
      en: 'CE EN 1078 Peak Impact Limit < 250g',
      vi: 'Chuẩn Châu Âu CE EN 1078: Giới hạn va đập < 250g (chặt hơn Mỹ)',
      feynman: 'EN 1078 khắt khe hơn về giới hạn g (<250g ở 5.42 m/s), đòi hỏi xốp EPS hấp thụ xung mềm hơn.',
      audio_zh: 'audio/boss_std_02.mp3',
      audio_en: 'audio/boss_std_02_en.mp3'
    },
    {
      id: 'std_03',
      standard: 'CN GB 24429-2009',
      zh: '中国国标GB 24429运动头盔安全标准',
      pinyin: 'Zhōngguó Guóbiāo GB 24429 yùndòng tóukuī ānquán biāozhǔn',
      en: 'China GB 24429 Sports Helmet Safety Standard',
      vi: 'Tiêu chuẩn quốc gia Trung Quốc GB 24429 cho mũ thể thao/xe đạp',
      feynman: 'GB 24429 yêu cầu kiểm tra xuyên thủng, trường nhìn ngang >=105° và độ bền giữ quai nón.',
      audio_zh: 'audio/boss_std_03.mp3',
      audio_en: 'audio/boss_std_03_en.mp3'
    },
    {
      id: 'std_04',
      standard: 'AU AS/NZS 2063',
      zh: '澳新AS/NZS 2063耐穿刺与刚度测试',
      pinyin: 'Ào Xīn AS/NZS 2063 nài chuāncì yǔ gāngdù cèshì',
      en: 'AS/NZS 2063 Penetration & Load Distribution Test',
      vi: 'Chuẩn Úc AS/NZS 2063: Kiểm tra đâm xuyên côn nhọn & phân tải',
      feynman: 'Điểm gắt nhất của AS/NZS 2063 là bài thả mũi khoan/côn 3kg từ 1m không được xuyên chạm đầu giả.',
      audio_zh: 'audio/boss_std_04.mp3',
      audio_en: 'audio/boss_std_04_en.mp3'
    },
    {
      id: 'std_05',
      standard: 'Impact Anvils',
      zh: '三种碰撞冲击铁砧：平砧、半球砧、路缘石砧',
      pinyin: 'Sān zhǒng pèngzhuàng chōngjī tiězhēn: píngzhēn, bànqiúzhēn, lùyuánshí zhēn',
      en: 'Three Impact Anvils: Flat, Hemispherical, Kerbstone',
      vi: '3 loại đe thử va đập: Đe phẳng, Đe bán cầu, Đe cạnh vỉa hè',
      feynman: 'Đe phẳng thử độ nén đều EPS; đe bán cầu/vỉa hè kiểm tra khả năng không vỡ toác cục bộ.',
      audio_zh: 'audio/boss_std_05.mp3',
      audio_en: 'audio/boss_std_05_en.mp3'
    },
    {
      id: 'std_06',
      standard: 'Retention Strap',
      zh: '下颏带防脱与动态拉力 20N-50N 预载',
      pinyin: 'Xiàkēdài fángtuō yǔ dòngtài lālì 20N-50N yùzài',
      en: 'Chinstrap Retention 20N–50N Preload & Elongation <= 25mm',
      vi: 'Lực kéo dây quai cằm 20N–50N (2.04–5.10 Kg.f) & độ giãn <= 25mm',
      feynman: 'Dây quai bị giãn quá 25mm hoặc tụt khóa dưới lực giật sẽ khiến mũ văng ra khỏi đầu khi va chạm.',
      audio_zh: 'audio/boss_std_06.mp3',
      audio_en: 'audio/boss_std_06_en.mp3'
    },
    {
      id: 'std_07',
      standard: 'Roll-off Test',
      zh: '头盔防脱落（后掀/前翻）稳定性测试',
      pinyin: 'Tóukuī fángtuōluò (hòuxiān/qiánfān) wěndìngxìng cèshì',
      en: 'Positional Stability / Roll-Off Retention Test',
      vi: 'Bài thử chống lật tuột mũ (Roll-Off Forward & Rearward)',
      feynman: 'Treo quả nặng thả rơi tạo mô-men giật về trước/sau: mũ có thể xoay nhẹ nhưng tuyệt đối không văng khỏi đầu giả.',
      audio_zh: 'audio/boss_std_07.mp3',
      audio_en: 'audio/boss_std_07_en.mp3'
    },
    {
      id: 'std_08',
      standard: 'EPS Liner',
      zh: '发泡聚苯乙烯EPS缓冲层密度 75-95 g/L',
      pinyin: 'Fāpào jùběnyǐxī EPS huǎnchōngcéng mìdù 75-95 g/L',
      en: 'Expanded Polystyrene (EPS) Liner Density 75–95 g/L',
      vi: 'Lớp xốp giảm chấn EPS: Mật độ chuẩn 75–95 g/L & kết dính >=85%',
      feynman: 'Xốp quá cứng sẽ truyền xung >250g lên não; quá mềm sẽ bẹp đáy (bottoming out). Mật độ đúng là sống còn.',
      audio_zh: 'audio/boss_std_08.mp3',
      audio_en: 'audio/boss_std_08_en.mp3'
    },
    {
      id: 'std_09',
      standard: 'Conditioning',
      zh: '高温50°C、低温-20°C及浸水环境预处理',
      pinyin: 'Gāowēn 50°C, dīwēn -20°C jí jìnshuǐ huánjìng yùchǔlǐ',
      en: 'Hot (+50°C), Cold (-20°C) & Wet Conditioning Pre-Test',
      vi: 'Ổn định môi trường mẫu Lab: Nóng +50°C, Lạnh -20°C, Ngâm nước',
      feynman: 'Mỗi mẫu mũ phải chịu nhiệt khắc nghiệt 4-6 tiếng trước khi thả rơi trong vòng vài phút sau khi lấy khỏi tủ.',
      audio_zh: 'audio/boss_std_09.mp3',
      audio_en: 'audio/boss_std_09_en.mp3'
    },
    {
      id: 'std_10',
      standard: 'Field of View',
      zh: '水平周边视野角不小于105度',
      pinyin: 'Shuǐpíng zhōubiān shìyějiǎo bù xiǎoyú 105 dù',
      en: 'Peripheral Field of Vision >= 105 Degrees Left & Right',
      vi: 'Góc quan sát ngoại vi hai bên >= 105 độ (Chuẩn EN 1078 / GB 24429)',
      feynman: 'Vành mũ hoặc kính chắn không được che mất tầm nhìn liếc xe hai bên ở góc tối thiểu 105° mỗi phía.',
      audio_zh: 'audio/boss_std_10.mp3',
      audio_en: 'audio/boss_std_10_en.mp3'
    },
    {
      id: 'std_11',
      standard: 'MIPS / Rotational',
      zh: '多向冲击保护系统MIPS降低脑部旋转加速度',
      pinyin: 'Duōxiàng chōngjī bǎohù xìtǒng MIPS jiàngdī nǎobù xuánzhuǎn jiāsùdù',
      en: 'MIPS Low-Friction Slip Layer for Rotational Brain Injury Reduction',
      vi: 'Lớp trượt MIPS giảm gia tốc xoay lên não khi va chạm xiên',
      feynman: 'Va đập ngoài thực tế hiếm khi thẳng góc; lớp lót trượt 10-15mm giúp phân tán lực xoắn cực hiệu quả.',
      audio_zh: 'audio/boss_std_11.mp3',
      audio_en: 'audio/boss_std_11_en.mp3'
    },
    {
      id: 'std_12',
      standard: 'Calibration & ISO',
      zh: '三轴加速度传感器与头模跌落台校准',
      pinyin: 'Sānzhóu jiāsùdù chuángǎnqì yǔ tóumó diēluòtái jiàozhǔn',
      en: 'Triaxial Accelerometer & MEP Pad Drop Rig Calibration',
      vi: 'Hiệu chuẩn cảm biến gia tốc 3 trục & đệm MEP trước mỗi ca test',
      feynman: 'Bắt buộc thả kiểm chứng đầu giả lên đệm MEP chuẩn đầu ca; sai số quá +/-5% phải dừng ngay máy test.',
      audio_zh: 'audio/boss_std_12.mp3',
      audio_en: 'audio/boss_std_12_en.mp3'
    }
  ];

  // Build 10 rigorous Boss questions cleanly from the dataset + factory compliance edge cases
  const BOSS_QUESTIONS = [
    {
      q: 'Đoàn kiểm toán hỏi giới hạn gia tốc đỉnh (Peak g) của chuẩn Mỹ CPSC 16 CFR 1203 và Châu Âu CE EN 1078. Con số nào ĐÚNG?',
      zhCue: '峰值加速度上限对比',
      options: [
        'CPSC < 300g | CE EN 1078 < 250g',
        'CPSC < 200g | CE EN 1078 < 350g',
        'CPSC < 450g | CE EN 1078 < 400g',
        'Cả hai chuẩn đều cho phép tới 380g'
      ],
      answer: 0,
      explain: 'Chuẩn Mỹ CPSC 1203 giới hạn < 300g, trong khi Châu Âu CE EN 1078 khắt khe hơn ở mức < 250g.'
    },
    {
      q: 'Trong phòng Lab thử nghiệm mũ bảo hiểm, cụm thuật ngữ "平砧 / 半球砧 / 路缘石砧" nghĩa là gì?',
      zhCue: '三种碰撞冲击铁砧',
      options: [
        'Máy ép phun 3 trục, Lò sấy UV, Cân tự động',
        'Đe phẳng, Đe bán cầu, Đe cạnh vỉa hè (3 loại đe va đập)',
        'Nhiệt độ phòng, Độ ẩm tương đối, Áp suất buồng sơn',
        'Chốt định vị khuôn S1, S2, S3'
      ],
      answer: 1,
      explain: '3 loại đe kinh điển trong Lab: 平砧 (Flat anvil), 半球砧 (Hemispherical anvil), 路缘石砧 (Kerbstone anvil).'
    },
    {
      q: 'Chuẩn Úc AS/NZS 2063 nổi tiếng khắt khe với phép thử nào mà EN 1078 không bắt buộc giống hệt?',
      zhCue: '耐穿刺与载荷分布测试',
      options: [
        'Test chống tia cực tím 500 giờ',
        'Thả côn nhọn xuyên thủng vỏ (Penetration Test)',
        'Kiểm tra độ bóng sơn qua cốc Ford Cup #4',
        'Đo độ ồn gió ở tốc độ 120 km/h'
      ],
      answer: 1,
      explain: 'AS/NZS 2063 có bài thử xuyên thủng bằng mũi côn nhọn 3kg: mũi nhọn tuyệt đối không được chạm đầu giả.'
    },
    {
      q: 'Quy đổi vàng Feynman 80/20 tại bàn kéo dây quai mũ: Lực kéo 20N – 50N tương đương tải trọng xấp xỉ bao nhiêu Kg.f?',
      zhCue: '织带拉力 20N-50N',
      options: [
        '0.50 – 1.20 Kg.f',
        '2.04 – 5.10 Kg.f',
        '10.0 – 25.0 Kg.f',
        '20.0 – 50.0 Kg.f'
      ],
      answer: 1,
      explain: 'Với 1 Kg.f ≈ 9.81 N, lực 20N ≈ 2.04 Kg.f và 50N ≈ 5.10 Kg.f.'
    },
    {
      q: 'Khi thực hiện bài thử Roll-Off (防脱测试), lỗi nào sau đây khiến lô mũ FAIL tức thì?',
      zhCue: '防脱落稳定性测试',
      options: [
        'Mũ bị giật tuột/văng ra khỏi đầu giả',
        'Lớp sơn mờ có vết trầy nhẹ sau khi giật',
        'Độ giãn tức thời dây quai là 8 mm (<=25mm)',
        'Trọng lượng mũ nhẹ hơn 260g'
      ],
      answer: 0,
      explain: 'Roll-off là bài kiểm tra sống còn: mũ không được lật tuột khỏi đầu giả dưới xung lực giật từ phía sau/trước.'
    },
    {
      q: 'Tại sao mật độ xốp EPS (EPS密度) quá cao hoặc quá thấp đều làm FAIL bài va đập va chạm g?',
      zhCue: 'EPS缓冲层密度 75-95 g/L',
      options: [
        'Quá cứng truyền lực >250g lên não; quá mềm bị bẹp đáy (bottoming out)',
        'Vì xốp không bám dính tem nước',
        'Vì xốp sẽ làm hỏng côn xuyên thủng ở máy test kéo',
        'Chỉ ảnh hưởng màu sắc thẩm mỹ khi xuất khẩu'
      ],
      answer: 0,
      explain: 'Xốp EPS hấp thụ năng lượng bằng cách biến dạng dẻo vừa đủ; quá cứng hoặc quá mềm đều làm đỉnh gia tốc g vọt quá chuẩn.'
    },
    {
      q: 'Điều kiện môi trường tiền xử lý mẫu (Conditioning) trước khi thả rơi trong phòng Lab gồm những tủ nào?',
      zhCue: '高低温及浸水环境预处理',
      options: [
        'Chỉ để nhiệt độ phòng 25°C trong 1 giờ',
        'Nóng (+50°C), Lạnh (-20°C) và Ngâm nước / Phun sương ẩm',
        'Đun sôi ở 100°C và chiếu đèn UV 30 ngày',
        'Nén thủy tĩnh ở độ sâu 50m'
      ],
      answer: 1,
      explain: 'Ba nhánh điều kiện chuẩn: Hot (+50°C), Cold (-20°C), và Wet/Water immersion để kiểm tra vỏ PC/xốp EPS không giòn gãy hoặc trương nở.'
    },
    {
      q: 'Tầm nhìn ngoại vi ngang tối thiểu (视野角) theo chuẩn EN 1078 và GB 24429 là bao nhiêu độ mỗi bên?',
      zhCue: '水平周边视野角',
      options: [
        '>= 60 độ',
        '>= 85 độ',
        '>= 105 độ',
        '>= 165 độ'
      ],
      answer: 2,
      explain: 'Góc quan sát ngang mỗi bên phải đạt >= 105 độ để người đội phát hiện xe cộ từ hai hướng.'
    },
    {
      q: 'Vai trò cốt lõi của lớp trượt MIPS (多向冲击保护系统) bên trong mũ bảo hiểm là gì?',
      zhCue: 'MIPS脑部旋转加速度保护',
      options: [
        'Giảm gia tốc xoay (Rotational Acceleration) truyền lên não khi va chạm góc xiên',
        'Tăng độ bám của tem nước trên vỏ PC',
        'Chống thấm nước khi xếp hàng vào container 40HC',
        'Thay thế hoàn toàn dây quai cằm và khóa cài'
      ],
      answer: 0,
      explain: 'Lớp MIPS cho phép xê dịch 10–15mm khi va đập xiên, làm giảm lực xoắn nguy hiểm gây chấn thương sọ não.'
    },
    {
      q: 'Trước mỗi ca thử nghiệm va đập trên tháp rơi, kỹ thuật viên Lab BẮT BUỘC làm bước Poka-Yoke nào?',
      zhCue: '三轴加速度传感器与头模校准',
      options: [
        'Thả kiểm chứng đầu giả lên đệm MEP chuẩn (Calibration Check) đạt sai số <= ±5%',
        'Thay toàn bộ hạt xốp EPS trong kho',
        'Đo độ nhớt sơn bằng cốc Ford Cup #4',
        'Lấy mẫu random 1 thùng trong container 45HC'
      ],
      answer: 0,
      explain: 'Hiệu chuẩn tháp rơi + cảm biến 3 trục bằng đệm MEP là bước khóa chuẩn đầu ca để dữ liệu g không bị sai lệch hệ thống.'
    }
  ];

  // SM-2 Spaced Repetition Algorithm (SuperMemo 2)
  function computeNextSm2(cardState, quality) {
    const prev = cardState || { reps: 0, interval: 0, ease: 2.5, dueAt: 0, lastQuality: null };
    let { reps, interval, ease } = prev;
    const q = Math.max(0, Math.min(5, Number(quality)));

    if (q < 3) {
      reps = 0;
      interval = 1;
    } else {
      if (reps === 0) interval = 1;
      else if (reps === 1) interval = 6;
      else interval = Math.round(interval * ease);
      reps += 1;
    }

    ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ease < 1.3) ease = 1.3;

    const now = Date.now();
    const dueAt = now + interval * 86400000;
    return { reps, interval, ease: Number(ease.toFixed(2)), dueAt, lastQuality: q };
  }

  function loadSrsStore() {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SRS_STORAGE_KEY) : null;
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveSrsStore(store) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(store));
      }
    } catch (e) {}
  }

  function getDueCards(store, nowMs) {
    const now = nowMs || Date.now();
    return HELMET_STANDARDS_DECK.filter((card) => {
      const st = store[card.id];
      return !st || (st.dueAt || 0) <= now;
    });
  }

  function speakDual(cardOrText, lang) {
    try {
      if (typeof Audio !== 'undefined' && typeof cardOrText === 'object') {
        const src = lang === 'en-US' ? cardOrText.audio_en : cardOrText.audio_zh;
        if (src) {
          const a = new Audio(src);
          a.play().catch(() => ttsFallback(lang === 'en-US' ? cardOrText.en : cardOrText.zh, lang));
          return;
        }
      }
    } catch (e) {}
    const txt = typeof cardOrText === 'string' ? cardOrText : (lang === 'en-US' ? cardOrText.en : cardOrText.zh);
    ttsFallback(txt, lang);
  }

  function ttsFallback(text, lang) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || 'zh-CN';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Interactive Modal UI (works inside CyberBird Lingo OR standalone HTML host)
  function injectStyles() {
    if (typeof document === 'undefined' || document.getElementById('helmet-srs-boss-css')) return;
    const style = document.createElement('style');
    style.id = 'helmet-srs-boss-css';
    style.textContent = `
      .srs-boss-backdrop {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(2, 6, 23, 0.88); backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center; padding: 14px;
      }
      .srs-boss-modal {
        width: 100%; max-width: 680px; max-height: 92vh; overflow-y: auto;
        background: #0f172a; color: #f8fafc; border: 1.5px solid #f59e0b;
        border-radius: 14px; padding: 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.7);
        font-family: system-ui, -apple-system, sans-serif;
      }
      .srs-boss-hdr { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px; }
      .srs-boss-tabs { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
      .srs-tab { background:#1e293b; color:#cbd5e1; border:1px solid #334155; border-radius:8px; padding:7px 12px; cursor:pointer; font-weight:700; font-size:12.5px; }
      .srs-tab.active { background:#d97706; border-color:#fbbf24; color:#fff; }
      .srs-card { background:#1e293b; border:1px solid #334155; border-radius:10px; padding:14px; margin-bottom:12px; }
      .srs-badge { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; background:rgba(245,158,11,0.18); color:#fcd34d; border:1px solid rgba(245,158,11,0.4); }
      .srs-rate-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:12px; }
      .srs-btn { padding:8px 10px; border-radius:8px; border:1px solid #475569; background:#0f172a; color:#fff; cursor:pointer; font-weight:700; font-size:12px; }
      .srs-btn.q1 { border-color:#f43f5e; color:#fda4af; }
      .srs-btn.q3 { border-color:#f59e0b; color:#fde68a; }
      .srs-btn.q4 { border-color:#38bdf8; color:#bae6fd; }
      .srs-btn.q5 { border-color:#10b981; color:#a7f3d0; }
      .boss-opt { width:100%; text-align:left; margin:6px 0; padding:10px 12px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:#f1f5f9; cursor:pointer; font-size:13px; }
      .boss-opt.ok { border-color:#10b981; background:rgba(16,185,129,0.2); }
      .boss-opt.bad { border-color:#f43f5e; background:rgba(244,63,94,0.2); }
    `;
    document.head.appendChild(style);
  }

  function openHelmetStandardsBossModal(initialTab) {
    if (typeof document === 'undefined') return;
    injectStyles();
    const existing = document.getElementById('helmet-srs-boss-modal');
    if (existing) existing.remove();

    let activeTab = initialTab || 'srs';
    let srsIdx = 0;
    let revealed = false;
    let bossIdx = 0;
    let bossScore = 0;
    let bossLocked = false;

    const backdrop = document.createElement('div');
    backdrop.id = 'helmet-srs-boss-modal';
    backdrop.className = 'srs-boss-backdrop';

    const modal = document.createElement('div');
    modal.className = 'srs-boss-modal';
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    function render() {
      const store = loadSrsStore();
      const due = getDueCards(store);
      const deck = due.length ? due : HELMET_STANDARDS_DECK;
      if (srsIdx >= deck.length) srsIdx = 0;
      const curCard = deck[srsIdx];

      const hdrHtml = `
        <div class="srs-boss-hdr">
          <div>
            <div style="font-size:16px;font-weight:800;color:#fbbf24;">🪖 HELMET STANDARDS SM-2 SRS &amp; BOSS BATTLE</div>
            <div style="font-size:11.5px;color:#94a3b8;">CPSC 1203 &bull; CE EN 1078 &bull; GB 24429 &bull; AS/NZS 2063 (12 Cards + 10 Boss Qs)</div>
          </div>
          <button class="srs-btn" id="srsBossClose">✕ Đóng</button>
        </div>
        <div class="srs-boss-tabs">
          <button class="srs-tab ${activeTab === 'srs' ? 'active' : ''}" id="tabSrsBtn">🧠 Ôn Tập SM-2 (${due.length} Đến Hạn)</button>
          <button class="srs-tab ${activeTab === 'boss' ? 'active' : ''}" id="tabBossBtn">⚔️ Boss Audit (10 Câu Chuẩn Quốc Tế)</button>
        </div>
      `;

      let bodyHtml = '';
      if (activeTab === 'srs') {
        const st = store[curCard.id] || { reps: 0, interval: 0, ease: 2.5 };
        bodyHtml = `
          <div class="srs-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span class="srs-badge">${escapeHtml(curCard.standard)}</span>
              <span style="font-size:11.5px;color:#94a3b8;">Thẻ ${srsIdx + 1}/${deck.length} &bull; Reps: ${st.reps} &bull; Interval: ${st.interval}d</span>
            </div>
            <div style="font-size:20px;font-weight:800;color:#38bdf8;margin-bottom:4px;">${escapeHtml(curCard.zh)}</div>
            <div style="font-size:13px;color:#cbd5e1;margin-bottom:10px;">${escapeHtml(curCard.pinyin)}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
              <button class="srs-btn" id="btnSpeakZh">🔊 Nghe Tiếng Trung</button>
              <button class="srs-btn" id="btnSpeakEn">🔊 Nghe Tiếng Anh</button>
              ${!revealed ? '<button class="srs-btn q4" id="btnRevealCard">👁️ Lật Nghĩa &amp; Mẹo Feynman 80/20</button>' : ''}
            </div>
            ${revealed ? `
              <div style="border-top:1px solid #334155;padding-top:10px;margin-top:8px;">
                <div style="font-weight:700;color:#10b981;margin-bottom:4px;">🇻🇳 ${escapeHtml(curCard.vi)}</div>
                <div style="font-size:13px;color:#e2e8f0;margin-bottom:6px;">🇬🇧 ${escapeHtml(curCard.en)}</div>
                <div style="font-size:12.5px;color:#fde68a;background:rgba(245,158,11,0.1);padding:8px;border-radius:6px;">💡 ${escapeHtml(curCard.feynman)}</div>
                <div class="srs-rate-row">
                  <button class="srs-btn q1" data-q="1">1. Quên (1d)</button>
                  <button class="srs-btn q3" data-q="3">3. Khó</button>
                  <button class="srs-btn q4" data-q="4">4. Tốt</button>
                  <button class="srs-btn q5" data-q="5">5. Thuộc Lòng</button>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        if (bossIdx >= BOSS_QUESTIONS.length) {
          const pct = Math.round((bossScore / BOSS_QUESTIONS.length) * 100);
          bodyHtml = `
            <div class="srs-card" style="text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">${pct >= 80 ? '🏆 AUDIT PASSED!' : '⚠️ CẦN ÔN THÊM LAB 80/20'}</div>
              <div style="font-size:18px;font-weight:800;color:#38bdf8;">Điểm Boss Audit: ${bossScore}/${BOSS_QUESTIONS.length} (${pct}%)</div>
              <p style="font-size:13px;color:#cbd5e1;">Đạt >= 80% để sẵn sàng tiếp đoàn Audit CPSC 1203 / CE EN 1078 / AS-NZS 2063.</p>
              <button class="srs-btn q5" id="btnBossRestart">🔄 Đấu Lại Boss 10 Câu</button>
            </div>
          `;
        } else {
          const bq = BOSS_QUESTIONS[bossIdx];
          bodyHtml = `
            <div class="srs-card">
              <div style="display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;margin-bottom:8px;">
                <span class="srs-badge">BOSS QUESTION ${bossIdx + 1}/${BOSS_QUESTIONS.length}</span>
                <span>Điểm hiện tại: <strong style="color:#10b981;">${bossScore}</strong></span>
              </div>
              <div style="font-size:12px;color:#38bdf8;margin-bottom:4px;">Gợi ý Lab (中文): ${escapeHtml(bq.zhCue)}</div>
              <div style="font-size:15px;font-weight:700;margin-bottom:10px;">${escapeHtml(bq.q)}</div>
              <div id="bossOptsBox">
                ${bq.options.map((opt, idx) => `<button class="boss-opt" data-idx="${idx}">${idx + 1}. ${escapeHtml(opt)}</button>`).join('')}
              </div>
              <div id="bossExplainBox" style="display:none;margin-top:10px;padding:10px;border-radius:8px;background:#0f172a;border:1px solid #334155;font-size:12.5px;"></div>
            </div>
          `;
        }
      }

      modal.innerHTML = hdrHtml + bodyHtml;

      document.getElementById('srsBossClose').onclick = () => backdrop.remove();
      document.getElementById('tabSrsBtn').onclick = () => { activeTab = 'srs'; render(); };
      document.getElementById('tabBossBtn').onclick = () => { activeTab = 'boss'; render(); };

      if (activeTab === 'srs') {
        document.getElementById('btnSpeakZh').onclick = () => speakDual(curCard, 'zh-CN');
        document.getElementById('btnSpeakEn').onclick = () => speakDual(curCard, 'en-US');
        const revBtn = document.getElementById('btnRevealCard');
        if (revBtn) revBtn.onclick = () => { revealed = true; render(); };
        modal.querySelectorAll('[data-q]').forEach((btn) => {
          btn.onclick = () => {
            const q = Number(btn.dataset.q);
            const nextStore = loadSrsStore();
            nextStore[curCard.id] = computeNextSm2(nextStore[curCard.id], q);
            saveSrsStore(nextStore);
            revealed = false;
            srsIdx = (srsIdx + 1) % Math.max(1, deck.length);
            render();
          };
        });
      } else if (bossIdx < BOSS_QUESTIONS.length) {
        const bq = BOSS_QUESTIONS[bossIdx];
        bossLocked = false;
        modal.querySelectorAll('.boss-opt').forEach((btn) => {
          btn.onclick = () => {
            if (bossLocked) return;
            bossLocked = true;
            const picked = Number(btn.dataset.idx);
            const ok = picked === bq.answer;
            if (ok) bossScore += 1;
            modal.querySelectorAll('.boss-opt').forEach((ob, i) => {
              if (i === bq.answer) ob.classList.add('ok');
              else if (i === picked && !ok) ob.classList.add('bad');
            });
            const exp = document.getElementById('bossExplainBox');
            exp.style.display = 'block';
            exp.innerHTML = `
              <div style="font-weight:700;color:${ok ? '#10b981' : '#f43f5e'};margin-bottom:4px;">${ok ? '✅ Chính xác!' : '❌ Chưa chính xác!'}</div>
              <div style="color:#cbd5e1;margin-bottom:8px;">${escapeHtml(bq.explain)}</div>
              <button class="srs-btn q4" id="btnBossNext">${bossIdx + 1 >= BOSS_QUESTIONS.length ? 'Xem Tổng Kết 🏆' : 'Câu Tiếp Theo ➜'}</button>
            `;
            document.getElementById('btnBossNext').onclick = () => { bossIdx += 1; render(); };
          };
        });
      } else {
        const rs = document.getElementById('btnBossRestart');
        if (rs) rs.onclick = () => { bossIdx = 0; bossScore = 0; render(); };
      }
    }

    render();
  }

  function mountIntoCyberBirdHub() {
    if (typeof document === 'undefined') return;
    const tryMount = () => {
      const hub = document.getElementById('v34-start-hub');
      if (!hub || document.getElementById('v361-helmet-boss-btn')) return;
      const btn = document.createElement('button');
      btn.id = 'v361-helmet-boss-btn';
      btn.className = 'v34-hub-chip';
      btn.style.cssText = 'grid-column:span 2;border-color:#f59e0b;background:linear-gradient(135deg,rgba(180,83,9,0.38),rgba(234,88,12,0.28));color:#fde68a;font-size:11.5px;padding:8px 10px;cursor:pointer;';
      btn.textContent = '🪖 ĐẤU TRƯỜNG CHUẨN MŨ QUỐC TẾ (SM-2 SRS & BOSS CPSC/EN1078/GB) ➜';
      btn.onclick = () => openHelmetStandardsBossModal('srs');
      hub.appendChild(btn);
    };
    setTimeout(tryMount, 80);
    setTimeout(tryMount, 450);
  }

  const exportedApi = {
    HELMET_STANDARDS_DECK,
    BOSS_QUESTIONS,
    computeNextSm2,
    getDueCards,
    openHelmetStandardsBossModal
  };

  if (typeof window !== 'undefined') {
    window.CYBERBIRD_HELMET_STD_BOSS = exportedApi;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountIntoCyberBirdHub);
    } else {
      mountIntoCyberBirdHub();
    }
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportedApi;
  }
})();
