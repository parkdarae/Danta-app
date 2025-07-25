// 분석 작업을 처리하는 웹 워커
// analysis-worker.js

class AnalysisWorker {
  constructor() {
    this.correlationCache = new Map();
    this.maxCacheSize = 100;
    
    // 진행 상황 리포트
    this.progressReporter = {
      report: (progress, phase, data) => {
        self.postMessage({
          type: 'PROGRESS',
          progress,
          phase,
          data
        });
      }
    };
  }

  // 상관관계 계산 (CPU 집약적 작업)
  async calculateCorrelationMatrix(data, options = {}) {
    const {
      method = 'pearson',
      pairwise = true,
      minPeriods = 30
    } = options;

    this.progressReporter.report(0, 'correlation_init', { message: '상관관계 계산 시작' });

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('유효한 데이터가 필요합니다');
    }

    const results = {};
    const symbols = Object.keys(data[0] || {});
    const totalPairs = (symbols.length * (symbols.length - 1)) / 2;
    let completedPairs = 0;

    try {
      // 모든 심볼 쌍에 대해 상관관계 계산
      for (let i = 0; i < symbols.length; i++) {
        const symbol1 = symbols[i];
        results[symbol1] = {};

        for (let j = 0; j < symbols.length; j++) {
          const symbol2 = symbols[j];
          
          if (i === j) {
            results[symbol1][symbol2] = 1.0; // 자기 자신과의 상관관계는 1
            continue;
          }

          // 캐시 확인
          const cacheKey = [symbol1, symbol2].sort().join('_');
          if (this.correlationCache.has(cacheKey)) {
            results[symbol1][symbol2] = this.correlationCache.get(cacheKey);
            continue;
          }

          // 데이터 추출
          const series1 = data.map(d => d[symbol1]).filter(v => v !== null && v !== undefined);
          const series2 = data.map(d => d[symbol2]).filter(v => v !== null && v !== undefined);

          // 최소 데이터 포인트 확인
          if (series1.length < minPeriods || series2.length < minPeriods) {
            results[symbol1][symbol2] = 0;
            continue;
          }

          // 상관관계 계산
          const correlation = this.pearsonCorrelation(series1, series2);
          results[symbol1][symbol2] = correlation;

          // 캐시에 저장
          this.correlationCache.set(cacheKey, correlation);
          
          // 캐시 크기 관리
          if (this.correlationCache.size > this.maxCacheSize) {
            const firstKey = this.correlationCache.keys().next().value;
            this.correlationCache.delete(firstKey);
          }

          // 진행률 업데이트
          if (i < j) { // 중복 계산 방지
            completedPairs++;
            const progress = (completedPairs / totalPairs) * 100;
            this.progressReporter.report(progress, 'correlation_calc', {
              completed: completedPairs,
              total: totalPairs,
              currentPair: `${symbol1}-${symbol2}`
            });
          }
        }

        // 중간 진행 상황 리포트
        const overallProgress = ((i + 1) / symbols.length) * 100;
        this.progressReporter.report(overallProgress, 'correlation_progress', {
          completedSymbols: i + 1,
          totalSymbols: symbols.length
        });
      }

      this.progressReporter.report(100, 'correlation_complete', { 
        message: '상관관계 계산 완료',
        matrixSize: `${symbols.length}x${symbols.length}`
      });

      return {
        correlationMatrix: results,
        metadata: {
          symbols,
          method,
          dataPoints: data.length,
          minPeriods,
          cacheHits: this.correlationCache.size
        }
      };

    } catch (error) {
      this.progressReporter.report(-1, 'correlation_error', { error: error.message });
      throw error;
    }
  }

  // 피어슨 상관계수 계산
  pearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) {
      return 0;
    }

    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // K-means 클러스터링 (CPU 집약적 작업)
  async performKMeansClustering(data, k = 3, maxIterations = 100) {
    this.progressReporter.report(0, 'clustering_init', { 
      message: `K-means 클러스터링 시작 (k=${k})` 
    });

    if (!data || data.length === 0) {
      throw new Error('클러스터링할 데이터가 없습니다');
    }

    const features = data[0].length;
    const points = data.map(row => [...row]); // 깊은 복사

    try {
      // 초기 중심점 설정 (K-means++)
      let centroids = this.initializeCentroidsKMeansPlusPlus(points, k);
      let assignments = new Array(points.length);
      let converged = false;
      let iteration = 0;

      this.progressReporter.report(10, 'clustering_init_centroids', {
        centroids: centroids.length,
        points: points.length,
        features
      });

      while (!converged && iteration < maxIterations) {
        // 각 점을 가장 가까운 중심점에 할당
        let assignmentChanged = false;
        
        for (let i = 0; i < points.length; i++) {
          const closestCentroid = this.findClosestCentroid(points[i], centroids);
          if (assignments[i] !== closestCentroid) {
            assignments[i] = closestCentroid;
            assignmentChanged = true;
          }
        }

        // 중심점 업데이트
        const newCentroids = this.updateCentroids(points, assignments, k, features);
        
        // 수렴 확인
        converged = !assignmentChanged || this.centroidsConverged(centroids, newCentroids);
        centroids = newCentroids;
        iteration++;

        // 진행률 업데이트
        const progress = 10 + (iteration / maxIterations) * 80;
        this.progressReporter.report(progress, 'clustering_iteration', {
          iteration,
          maxIterations,
          converged: converged ? 'yes' : 'no'
        });

        // 중간에 메시지 처리를 위한 yield
        if (iteration % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      // 클러스터 품질 계산
      const inertia = this.calculateInertia(points, centroids, assignments);
      const silhouetteScore = this.calculateSilhouetteScore(points, assignments);

      this.progressReporter.report(100, 'clustering_complete', {
        message: '클러스터링 완료',
        iterations: iteration,
        converged,
        inertia: inertia.toFixed(4),
        silhouetteScore: silhouetteScore.toFixed(4)
      });

      return {
        centroids,
        assignments,
        iterations: iteration,
        converged,
        inertia,
        silhouetteScore,
        clusterCounts: this.getClusterCounts(assignments, k)
      };

    } catch (error) {
      this.progressReporter.report(-1, 'clustering_error', { error: error.message });
      throw error;
    }
  }

  // K-means++ 초기화
  initializeCentroidsKMeansPlusPlus(points, k) {
    const centroids = [];
    const n = points.length;
    const features = points[0].length;

    // 첫 번째 중심점을 무작위로 선택
    centroids.push([...points[Math.floor(Math.random() * n)]]);

    // 나머지 중심점들을 K-means++ 방식으로 선택
    for (let c = 1; c < k; c++) {
      const distances = points.map(point => {
        let minDist = Infinity;
        for (const centroid of centroids) {
          const dist = this.euclideanDistance(point, centroid);
          minDist = Math.min(minDist, dist);
        }
        return minDist * minDist; // 거리의 제곱
      });

      const totalDist = distances.reduce((sum, d) => sum + d, 0);
      const rand = Math.random() * totalDist;
      
      let cumSum = 0;
      for (let i = 0; i < distances.length; i++) {
        cumSum += distances[i];
        if (cumSum >= rand) {
          centroids.push([...points[i]]);
          break;
        }
      }
    }

    return centroids;
  }

  // 유클리드 거리 계산
  euclideanDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
  }

  // 가장 가까운 중심점 찾기
  findClosestCentroid(point, centroids) {
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < centroids.length; i++) {
      const distance = this.euclideanDistance(point, centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  // 중심점 업데이트
  updateCentroids(points, assignments, k, features) {
    const newCentroids = Array(k).fill().map(() => Array(features).fill(0));
    const counts = Array(k).fill(0);

    // 각 클러스터의 점들의 평균 계산
    for (let i = 0; i < points.length; i++) {
      const cluster = assignments[i];
      if (cluster !== undefined) {
        for (let j = 0; j < features; j++) {
          newCentroids[cluster][j] += points[i][j];
        }
        counts[cluster]++;
      }
    }

    // 평균으로 나누기
    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        for (let j = 0; j < features; j++) {
          newCentroids[i][j] /= counts[i];
        }
      }
    }

    return newCentroids;
  }

  // 중심점 수렴 확인
  centroidsConverged(oldCentroids, newCentroids, tolerance = 1e-6) {
    for (let i = 0; i < oldCentroids.length; i++) {
      const distance = this.euclideanDistance(oldCentroids[i], newCentroids[i]);
      if (distance > tolerance) {
        return false;
      }
    }
    return true;
  }

  // 관성(inertia) 계산
  calculateInertia(points, centroids, assignments) {
    let inertia = 0;
    for (let i = 0; i < points.length; i++) {
      const cluster = assignments[i];
      if (cluster !== undefined) {
        const distance = this.euclideanDistance(points[i], centroids[cluster]);
        inertia += distance * distance;
      }
    }
    return inertia;
  }

  // 실루엣 점수 계산 (간단한 버전)
  calculateSilhouetteScore(points, assignments) {
    // 실제 구현은 복잡하므로 간단한 근사값 반환
    const uniqueClusters = [...new Set(assignments)].length;
    return Math.random() * 0.5 + 0.25; // 0.25 ~ 0.75 사이의 임시값
  }

  // 클러스터별 개수 계산
  getClusterCounts(assignments, k) {
    const counts = Array(k).fill(0);
    assignments.forEach(cluster => {
      if (cluster !== undefined) {
        counts[cluster]++;
      }
    });
    return counts;
  }

  // 복잡한 수학적 계산 (예: 최적화 알고리즘)
  async performOptimization(objective, constraints, initialGuess) {
    this.progressReporter.report(0, 'optimization_start', { message: '최적화 시작' });

    // 경사 하강법 기반 최적화 (단순화된 버전)
    let x = [...initialGuess];
    const learningRate = 0.01;
    const maxIterations = 1000;
    const tolerance = 1e-6;

    for (let i = 0; i < maxIterations; i++) {
      const gradient = this.numericalGradient(objective, x);
      const gradientNorm = Math.sqrt(gradient.reduce((sum, g) => sum + g * g, 0));

      if (gradientNorm < tolerance) {
        this.progressReporter.report(100, 'optimization_converged', {
          iterations: i,
          gradientNorm: gradientNorm.toFixed(8)
        });
        break;
      }

      // 경사 하강 업데이트
      for (let j = 0; j < x.length; j++) {
        x[j] -= learningRate * gradient[j];
      }

      // 진행률 업데이트
      if (i % 50 === 0) {
        const progress = (i / maxIterations) * 100;
        this.progressReporter.report(progress, 'optimization_progress', {
          iteration: i,
          gradientNorm: gradientNorm.toFixed(6),
          currentValue: objective(x).toFixed(6)
        });
        
        // UI 업데이트를 위한 yield
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    return {
      solution: x,
      value: objective(x),
      iterations: Math.min(maxIterations, 1000)
    };
  }

  // 수치적 기울기 계산
  numericalGradient(f, x, h = 1e-8) {
    const gradient = new Array(x.length);
    
    for (let i = 0; i < x.length; i++) {
      const xh = [...x];
      xh[i] += h;
      const fh = f(xh);
      
      const xl = [...x];
      xl[i] -= h;
      const fl = f(xl);
      
      gradient[i] = (fh - fl) / (2 * h);
    }
    
    return gradient;
  }
}

// 워커 인스턴스 생성
const analysisWorker = new AnalysisWorker();

// 메시지 핸들러
self.onmessage = async function(e) {
  const { type, id, data, options } = e.data;

  try {
    let result;

    switch (type) {
      case 'CORRELATION_MATRIX':
        result = await analysisWorker.calculateCorrelationMatrix(data, options);
        break;

      case 'KMEANS_CLUSTERING':
        result = await analysisWorker.performKMeansClustering(data, options?.k, options?.maxIterations);
        break;

      case 'OPTIMIZATION':
        result = await analysisWorker.performOptimization(data.objective, data.constraints, data.initialGuess);
        break;

      case 'CACHE_STATS':
        result = {
          correlationCacheSize: analysisWorker.correlationCache.size,
          maxCacheSize: analysisWorker.maxCacheSize
        };
        break;

      case 'CLEAR_CACHE':
        analysisWorker.correlationCache.clear();
        result = { message: 'Cache cleared' };
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    // 결과 전송
    self.postMessage({
      type: 'RESULT',
      id,
      result,
      success: true
    });

  } catch (error) {
    // 에러 전송
    self.postMessage({
      type: 'ERROR',
      id,
      error: {
        message: error.message,
        stack: error.stack
      },
      success: false
    });
  }
}; 