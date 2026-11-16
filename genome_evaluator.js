/**
 * CyberBird Genome Evaluator v1.0 — Tối ưu hóa lộ trình học tập Boss Battles
 * ============================================================================
 * Genome = bộ tham số {quiz_order, difficulty_curve, time_pressure, hint_frequency,
 *                      retry_penalty, spaced_interval_modifier}
 *
 * Fitness = accuracy * 0.4 + speed * 0.3 + streak * 0.2 + retention * 0.1
 *           (chuẩn hóa về thang 0–100)
 *
 * Thuật toán tiến hóa di truyền (GA) dùng để tìm bộ tham số tối ưu cho
 * thứ tự boss, độ khó, áp lực thời gian, tần suất gợi ý — giúp người học
 * nhà máy đạt kết quả cao nhất với nỗ lực vừa phải (Feynman 80/20).
 *
 * Tương thích: Node.js >= 18 (CLI batch) & Browser (game integration)
 * Encoding: UTF-8
 */
(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
  const BOSS_COUNT = 12;
  const DIFFICULTY_CURVES = ['linear', 'exponential', 'adaptive'];
  const POPULATION_DEFAULT = 20;
  const GENERATIONS_DEFAULT = 50;
  const MUTATION_RATE_DEFAULT = 0.15;
  const CROSSOVER_RATE = 0.7;
  const ELITISM_COUNT = 2;

  // Fitness weights (tổng = 1.0)
  const W_ACCURACY  = 0.4;
  const W_SPEED     = 0.3;
  const W_STREAK    = 0.2;
  const W_RETENTION = 0.1;

  // ── Utility helpers ────────────────────────────────────────────────────────
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandom(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  // ── Genome Creation ────────────────────────────────────────────────────────
  /**
   * Tạo genome ngẫu nhiên với các tham số hợp lệ.
   * @returns {Object} genome
   */
  function createRandomGenome() {
    const indices = [];
    for (let i = 1; i <= BOSS_COUNT; i++) indices.push(i);
    return {
      quiz_order:               shuffleArray(indices),
      difficulty_curve:         pickRandom(DIFFICULTY_CURVES),
      time_pressure:            parseFloat(randFloat(0.5, 2.0).toFixed(2)),
      hint_frequency:           parseFloat(randFloat(0.0, 1.0).toFixed(2)),
      retry_penalty:            parseFloat(randFloat(0.0, 0.5).toFixed(2)),
      spaced_interval_modifier: parseFloat(randFloat(0.8, 1.5).toFixed(2))
    };
  }

  // ── Genome Validation ──────────────────────────────────────────────────────
  /**
   * Kiểm tra genome có hợp lệ không.
   * @param {Object} genome
   * @returns {boolean}
   */
  function isValidGenome(genome) {
    if (!genome || typeof genome !== 'object') return false;

    // quiz_order: phải là mảng 12 phần tử, chứa đúng 1-12 không trùng
    const qo = genome.quiz_order;
    if (!Array.isArray(qo) || qo.length !== BOSS_COUNT) return false;
    const sorted = qo.slice().sort((a, b) => a - b);
    for (let i = 0; i < BOSS_COUNT; i++) {
      if (sorted[i] !== i + 1) return false;
    }

    // difficulty_curve
    if (!DIFFICULTY_CURVES.includes(genome.difficulty_curve)) return false;

    // numeric ranges
    if (typeof genome.time_pressure !== 'number' ||
        genome.time_pressure < 0.5 || genome.time_pressure > 2.0) return false;
    if (typeof genome.hint_frequency !== 'number' ||
        genome.hint_frequency < 0.0 || genome.hint_frequency > 1.0) return false;
    if (typeof genome.retry_penalty !== 'number' ||
        genome.retry_penalty < 0.0 || genome.retry_penalty > 0.5) return false;
    if (typeof genome.spaced_interval_modifier !== 'number' ||
        genome.spaced_interval_modifier < 0.8 || genome.spaced_interval_modifier > 1.5) return false;

    return true;
  }

  // ── Difficulty Multiplier ──────────────────────────────────────────────────
  function getDifficultyMultiplier(curve, questionIndex, totalQuestions) {
    const progress = questionIndex / Math.max(1, totalQuestions - 1); // 0..1
    switch (curve) {
      case 'linear':
        return 0.5 + progress * 0.5;  // 0.5 → 1.0
      case 'exponential':
        return 0.4 + 0.6 * Math.pow(progress, 2);  // 0.4 → 1.0 exponential
      case 'adaptive':
        // sigmoid-like: starts easy, middle ramps, plateau
        return 0.3 + 0.7 / (1 + Math.exp(-8 * (progress - 0.5)));
      default:
        return 1.0;
    }
  }

  // ── Genome Evaluation ──────────────────────────────────────────────────────
  /**
   * Mô phỏng chơi và chấm điểm genome dựa trên lịch sử người chơi.
   *
   * @param {Object} genome - Bộ tham số genome
   * @param {Object} [playerHistory] - Lịch sử người chơi (optional, mô phỏng nếu thiếu)
   *   { attempts: [{boss_idx, correct, time_ms}], avg_accuracy: 0-1, streak_best: N }
   * @returns {Object} { fitness, breakdown: {accuracy, speed, streak, retention} }
   */
  function evaluateGenome(genome, playerHistory) {
    if (!isValidGenome(genome)) {
      return { fitness: 0, breakdown: { accuracy: 0, speed: 0, streak: 0, retention: 0 } };
    }

    const history = playerHistory || generateSimulatedHistory(genome);
    const totalQ = genome.quiz_order.length;

    // ── 1. Accuracy score (0-100) ──
    let correctCount = 0;
    let totalAttempts = 0;
    const order = genome.quiz_order;

    for (let i = 0; i < order.length; i++) {
      const bossIdx = order[i];
      const attempt = findAttempt(history, bossIdx);
      const diffMult = getDifficultyMultiplier(genome.difficulty_curve, i, totalQ);

      // Hint boosts accuracy slightly but reduces learning depth
      const hintBoost = genome.hint_frequency * 0.15;
      // Time pressure reduces accuracy for rushed players
      const pressurePenalty = Math.max(0, (genome.time_pressure - 1.0) * 0.1);

      let baseAccuracy = attempt ? (attempt.correct ? 1.0 : 0.0) : (0.6 - diffMult * 0.2 + hintBoost);
      baseAccuracy = clamp(baseAccuracy - pressurePenalty, 0, 1);

      // Apply retry penalty
      if (attempt && !attempt.correct) {
        baseAccuracy = Math.max(0, baseAccuracy - genome.retry_penalty);
      }

      correctCount += baseAccuracy;
      totalAttempts++;
    }
    const accuracyScore = (correctCount / Math.max(1, totalAttempts)) * 100;

    // ── 2. Speed score (0-100) ──
    // Faster completion = higher score, modulated by time_pressure
    let speedSum = 0;
    for (let i = 0; i < order.length; i++) {
      const attempt = findAttempt(history, order[i]);
      const timeLimit = 30000 / genome.time_pressure; // base 30s per question
      const actualTime = attempt ? attempt.time_ms : randInt(8000, 25000);
      const timeRatio = clamp(1 - (actualTime / timeLimit), 0, 1);
      speedSum += timeRatio;
    }
    const speedScore = (speedSum / Math.max(1, totalQ)) * 100;

    // ── 3. Streak score (0-100) ──
    let currentStreak = 0;
    let bestStreak = 0;
    for (let i = 0; i < order.length; i++) {
      const attempt = findAttempt(history, order[i]);
      const correct = attempt ? attempt.correct : (Math.random() > 0.4);
      if (correct) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    // Order that groups easier bosses first → longer early streaks → confidence boost
    const streakScore = clamp((bestStreak / totalQ) * 100, 0, 100);

    // ── 4. Retention score (0-100) ──
    // SM-2 interval modifier affects long-term retention
    // Sweet spot around 1.0-1.2; too low = too many reviews, too high = forgetting
    const simModifier = genome.spaced_interval_modifier;
    const retentionBase = 1.0 - Math.abs(simModifier - 1.1) * 1.5;
    // Hint frequency hurts retention (crutch effect)
    const hintPenalty = genome.hint_frequency * 0.25;
    const retentionScore = clamp((retentionBase - hintPenalty) * 100, 0, 100);

    // ── Weighted fitness ──
    const fitness = clamp(
      accuracyScore * W_ACCURACY +
      speedScore    * W_SPEED +
      streakScore   * W_STREAK +
      retentionScore * W_RETENTION,
      0, 100
    );

    return {
      fitness: parseFloat(fitness.toFixed(2)),
      breakdown: {
        accuracy:  parseFloat(accuracyScore.toFixed(2)),
        speed:     parseFloat(speedScore.toFixed(2)),
        streak:    parseFloat(streakScore.toFixed(2)),
        retention: parseFloat(retentionScore.toFixed(2))
      }
    };
  }

  function findAttempt(history, bossIdx) {
    if (!history || !history.attempts) return null;
    return history.attempts.find(a => a.boss_idx === bossIdx) || null;
  }

  function generateSimulatedHistory(genome) {
    const attempts = [];
    for (let i = 0; i < genome.quiz_order.length; i++) {
      const bossIdx = genome.quiz_order[i];
      const diffMult = getDifficultyMultiplier(genome.difficulty_curve, i, genome.quiz_order.length);
      const correctProb = 0.7 - diffMult * 0.3 + genome.hint_frequency * 0.1;
      attempts.push({
        boss_idx: bossIdx,
        correct: Math.random() < correctProb,
        time_ms: randInt(5000, Math.round(30000 * genome.time_pressure))
      });
    }
    return { attempts, avg_accuracy: 0.6, streak_best: 3 };
  }

  // ── Crossover ──────────────────────────────────────────────────────────────
  /**
   * Lai ghép 2 genome cha mẹ → 1 genome con.
   * quiz_order dùng Order Crossover (OX) để giữ tính hoán vị.
   */
  function crossover(parent1, parent2) {
    // Order Crossover (OX) for quiz_order
    const size = BOSS_COUNT;
    const start = randInt(0, size - 2);
    const end = randInt(start + 1, size - 1);

    const childOrder = new Array(size).fill(null);
    // Copy segment from parent1
    for (let i = start; i <= end; i++) {
      childOrder[i] = parent1.quiz_order[i];
    }
    // Fill remaining from parent2 in order
    let fillIdx = (end + 1) % size;
    for (let i = 0; i < size; i++) {
      const idx = (end + 1 + i) % size;
      const gene = parent2.quiz_order[idx];
      if (!childOrder.includes(gene)) {
        childOrder[fillIdx] = gene;
        fillIdx = (fillIdx + 1) % size;
      }
    }

    // Blend numeric params
    const alpha = Math.random();
    return {
      quiz_order: childOrder,
      difficulty_curve: Math.random() < 0.5 ? parent1.difficulty_curve : parent2.difficulty_curve,
      time_pressure: parseFloat(clamp(
        alpha * parent1.time_pressure + (1 - alpha) * parent2.time_pressure,
        0.5, 2.0
      ).toFixed(2)),
      hint_frequency: parseFloat(clamp(
        alpha * parent1.hint_frequency + (1 - alpha) * parent2.hint_frequency,
        0.0, 1.0
      ).toFixed(2)),
      retry_penalty: parseFloat(clamp(
        alpha * parent1.retry_penalty + (1 - alpha) * parent2.retry_penalty,
        0.0, 0.5
      ).toFixed(2)),
      spaced_interval_modifier: parseFloat(clamp(
        alpha * parent1.spaced_interval_modifier + (1 - alpha) * parent2.spaced_interval_modifier,
        0.8, 1.5
      ).toFixed(2))
    };
  }

  // ── Mutation ───────────────────────────────────────────────────────────────
  /**
   * Đột biến genome với tỷ lệ cho trước.
   * @param {Object} genome
   * @param {number} [rate=0.15] - Xác suất đột biến mỗi gene
   * @returns {Object} genome đã đột biến (bản sao mới)
   */
  function mutate(genome, rate) {
    const mr = typeof rate === 'number' ? rate : MUTATION_RATE_DEFAULT;
    const g = JSON.parse(JSON.stringify(genome)); // deep clone

    // Mutate quiz_order: swap 2 positions
    if (Math.random() < mr) {
      const i = randInt(0, BOSS_COUNT - 1);
      const j = randInt(0, BOSS_COUNT - 1);
      [g.quiz_order[i], g.quiz_order[j]] = [g.quiz_order[j], g.quiz_order[i]];
    }

    // Mutate difficulty_curve
    if (Math.random() < mr) {
      g.difficulty_curve = pickRandom(DIFFICULTY_CURVES);
    }

    // Mutate numeric genes with Gaussian-like perturbation
    if (Math.random() < mr) {
      g.time_pressure = parseFloat(clamp(
        g.time_pressure + randFloat(-0.3, 0.3), 0.5, 2.0
      ).toFixed(2));
    }
    if (Math.random() < mr) {
      g.hint_frequency = parseFloat(clamp(
        g.hint_frequency + randFloat(-0.2, 0.2), 0.0, 1.0
      ).toFixed(2));
    }
    if (Math.random() < mr) {
      g.retry_penalty = parseFloat(clamp(
        g.retry_penalty + randFloat(-0.1, 0.1), 0.0, 0.5
      ).toFixed(2));
    }
    if (Math.random() < mr) {
      g.spaced_interval_modifier = parseFloat(clamp(
        g.spaced_interval_modifier + randFloat(-0.15, 0.15), 0.8, 1.5
      ).toFixed(2));
    }

    return g;
  }

  // ── Tournament Selection ───────────────────────────────────────────────────
  function tournamentSelect(scoredPop, tournamentSize) {
    const size = tournamentSize || 3;
    let best = null;
    for (let i = 0; i < size; i++) {
      const candidate = scoredPop[randInt(0, scoredPop.length - 1)];
      if (!best || candidate.fitness > best.fitness) {
        best = candidate;
      }
    }
    return best.genome;
  }

  // ── Run Generation ─────────────────────────────────────────────────────────
  /**
   * Tiến hóa 1 thế hệ.
   * @param {Array<Object>} population - Mảng genome
   * @param {Object} [playerHistory] - Lịch sử người chơi
   * @returns {Object} { population, bestGenome, bestFitness, avgFitness, stats }
   */
  function runGeneration(population, playerHistory) {
    // Evaluate all genomes
    const scored = population.map(genome => {
      const result = evaluateGenome(genome, playerHistory);
      return { genome, fitness: result.fitness, breakdown: result.breakdown };
    });

    // Sort by fitness descending
    scored.sort((a, b) => b.fitness - a.fitness);

    const bestGenome = scored[0].genome;
    const bestFitness = scored[0].fitness;
    const avgFitness = parseFloat(
      (scored.reduce((sum, s) => sum + s.fitness, 0) / scored.length).toFixed(2)
    );

    // Elitism: keep top N
    const newPopulation = [];
    for (let i = 0; i < Math.min(ELITISM_COUNT, scored.length); i++) {
      newPopulation.push(JSON.parse(JSON.stringify(scored[i].genome)));
    }

    // Fill rest with crossover + mutation
    while (newPopulation.length < population.length) {
      if (Math.random() < CROSSOVER_RATE && scored.length >= 2) {
        const p1 = tournamentSelect(scored);
        const p2 = tournamentSelect(scored);
        let child = crossover(p1, p2);
        child = mutate(child, MUTATION_RATE_DEFAULT);
        newPopulation.push(child);
      } else {
        const parent = tournamentSelect(scored);
        newPopulation.push(mutate(parent, MUTATION_RATE_DEFAULT));
      }
    }

    return {
      population: newPopulation,
      bestGenome,
      bestFitness,
      avgFitness,
      stats: {
        best_breakdown: scored[0].breakdown,
        worst_fitness: scored[scored.length - 1].fitness
      }
    };
  }

  // ── Export Best Genome ─────────────────────────────────────────────────────
  /**
   * Xuất genome tốt nhất thành JSON config cho game integration.
   * @param {Object} genome
   * @param {Object} [meta] - Thông tin bổ sung
   * @returns {string} JSON string (UTF-8 safe)
   */
  function exportBestGenome(genome, meta) {
    const config = {
      _version: '1.0.0',
      _generated_at: new Date().toISOString(),
      _generator: 'CyberBird Genome Evaluator v1.0',
      _description: 'Bộ tham số tối ưu cho Boss Battle lộ trình học chuẩn mũ bảo hiểm quốc tế',
      genome: genome,
      meta: meta || {}
    };
    return JSON.stringify(config, null, 2);
  }

  // ── Full Evolution Run (for CLI/batch) ─────────────────────────────────────
  /**
   * Chạy toàn bộ quá trình tiến hóa.
   * @param {Object} options
   *   { generations, populationSize, playerHistory, verbose }
   * @returns {Object} { bestGenome, bestFitness, history }
   */
  function runEvolution(options) {
    const opts = options || {};
    const generations = opts.generations || GENERATIONS_DEFAULT;
    const popSize = opts.populationSize || POPULATION_DEFAULT;
    const verbose = opts.verbose !== undefined ? opts.verbose : true;

    // Initialize population
    let population = [];
    for (let i = 0; i < popSize; i++) {
      population.push(createRandomGenome());
    }

    const evolutionHistory = [];
    let globalBestGenome = null;
    let globalBestFitness = -Infinity;

    for (let gen = 0; gen < generations; gen++) {
      const result = runGeneration(population, opts.playerHistory);
      population = result.population;

      // Track global best across ALL generations (fix: prevents losing peak fitness)
      if (result.bestFitness > globalBestFitness) {
        globalBestFitness = result.bestFitness;
        globalBestGenome = JSON.parse(JSON.stringify(result.bestGenome)); // deep copy
        if (verbose) {
          console.log(
            `  ★ NEW GLOBAL BEST at Gen ${gen + 1}: ${globalBestFitness.toFixed(2)}`
          );
        }
      }

      evolutionHistory.push({
        generation: gen + 1,
        bestFitness: result.bestFitness,
        avgFitness: result.avgFitness,
        worstFitness: result.stats.worst_fitness
      });

      if (verbose) {
        console.log(
          `  Gen ${String(gen + 1).padStart(3)}/${generations} | ` +
          `Best: ${result.bestFitness.toFixed(2)} | ` +
          `Avg: ${result.avgFitness.toFixed(2)} | ` +
          `Worst: ${result.stats.worst_fitness.toFixed(2)} | ` +
          `Global: ${globalBestFitness.toFixed(2)}`
        );
      }
    }

    return {
      bestGenome: globalBestGenome,
      bestFitness: globalBestFitness,
      history: evolutionHistory
    };
  }

  // ── Module Export ──────────────────────────────────────────────────────────
  const exportedApi = {
    // Core GA functions
    createRandomGenome,
    evaluateGenome,
    crossover,
    mutate,
    runGeneration,
    exportBestGenome,
    runEvolution,
    // Helpers
    isValidGenome,
    // Constants
    BOSS_COUNT,
    DIFFICULTY_CURVES,
    POPULATION_DEFAULT,
    GENERATIONS_DEFAULT
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportedApi;
  }
  if (typeof window !== 'undefined') {
    window.CYBERBIRD_GENOME = exportedApi;
  }
})();
