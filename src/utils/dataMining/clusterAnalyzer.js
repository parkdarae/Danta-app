/**
 * 주식 데이터 마이닝 프레임북 - 클러스터링 및 테마 분석 모듈
 * K-means, 계층적 군집화, 토픽 모델링, 테마 추출 담당
 */

// 클러스터링 알고리즘 타입
export const CLUSTERING_ALGORITHMS = {
  KMEANS: 'kmeans',
  HIERARCHICAL: 'hierarchical',
  DBSCAN: 'dbscan',
  SPECTRAL: 'spectral'
};

// 거리 측정 방법
export const DISTANCE_METRICS = {
  EUCLIDEAN: 'euclidean',
  MANHATTAN: 'manhattan',
  COSINE: 'cosine',
  JACCARD: 'jaccard'
};

/**
 * K-means 클러스터링
 */
export class KMeansClusterer {
  constructor(k = 3, maxIterations = 100, tolerance = 1e-4) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
    this.centroids = [];
    this.labels = [];
    this.iterations = 0;
    this.inertia = 0;
  }

  // 클러스터링 실행
  fit(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('유효한 데이터가 필요합니다.');
    }

    const n = data.length;
    const d = data[0].length;

    // 초기 중심점 설정 (K-means++)
    this.centroids = this.initializeCentroids(data, this.k);
    this.labels = new Array(n);

    for (this.iterations = 0; this.iterations < this.maxIterations; this.iterations++) {
      const prevCentroids = this.centroids.map(c => [...c]);

      // 1. 각 점을 가장 가까운 중심점에 할당
      for (let i = 0; i < n; i++) {
        this.labels[i] = this.findClosestCentroid(data[i]);
      }

      // 2. 중심점 업데이트
      this.updateCentroids(data);

      // 3. 수렴 확인
      if (this.hasConverged(prevCentroids)) {
        break;
      }
    }

    // 관성(inertia) 계산
    this.inertia = this.calculateInertia(data);

    return {
      labels: this.labels,
      centroids: this.centroids,
      inertia: this.inertia,
      iterations: this.iterations
    };
  }

  // K-means++ 초기화
  initializeCentroids(data, k) {
    const centroids = [];
    const n = data.length;

    // 첫 번째 중심점은 랜덤 선택
    centroids.push([...data[Math.floor(Math.random() * n)]]);

    // 나머지 중심점들은 거리 기반 확률로 선택
    for (let c = 1; c < k; c++) {
      const distances = data.map(point => {
        return Math.min(...centroids.map(centroid => 
          this.calculateDistance(point, centroid)
        ));
      });

      const totalDistance = distances.reduce((sum, d) => sum + d * d, 0);
      const probabilities = distances.map(d => (d * d) / totalDistance);

      // 확률 기반 선택
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < n; i++) {
        cumulative += probabilities[i];
        if (rand <= cumulative) {
          centroids.push([...data[i]]);
          break;
        }
      }
    }

    return centroids;
  }

  // 가장 가까운 중심점 찾기
  findClosestCentroid(point) {
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < this.centroids.length; i++) {
      const distance = this.calculateDistance(point, this.centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  // 중심점 업데이트
  updateCentroids(data) {
    const newCentroids = [];
    const d = data[0].length;

    for (let c = 0; c < this.k; c++) {
      const clusterPoints = data.filter((_, i) => this.labels[i] === c);
      
      if (clusterPoints.length === 0) {
        // 빈 클러스터인 경우 랜덤 재초기화
        newCentroids.push([...data[Math.floor(Math.random() * data.length)]]);
      } else {
        const centroid = new Array(d).fill(0);
        clusterPoints.forEach(point => {
          point.forEach((value, dim) => {
            centroid[dim] += value;
          });
        });
        
        centroid.forEach((sum, dim) => {
          centroid[dim] = sum / clusterPoints.length;
        });
        
        newCentroids.push(centroid);
      }
    }

    this.centroids = newCentroids;
  }

  // 수렴 확인
  hasConverged(prevCentroids) {
    for (let i = 0; i < this.centroids.length; i++) {
      const distance = this.calculateDistance(this.centroids[i], prevCentroids[i]);
      if (distance > this.tolerance) {
        return false;
      }
    }
    return true;
  }

  // 관성 계산
  calculateInertia(data) {
    let inertia = 0;
    for (let i = 0; i < data.length; i++) {
      const centroidIndex = this.labels[i];
      const distance = this.calculateDistance(data[i], this.centroids[centroidIndex]);
      inertia += distance * distance;
    }
    return inertia;
  }

  // 유클리드 거리 계산
  calculateDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
  }

  // 최적 k 찾기 (엘보우 방법)
  static findOptimalK(data, maxK = 10) {
    const results = [];
    
    for (let k = 1; k <= maxK; k++) {
      const kmeans = new KMeansClusterer(k);
      const result = kmeans.fit(data);
      results.push({
        k: k,
        inertia: result.inertia,
        silhouetteScore: k > 1 ? this.calculateSilhouetteScore(data, result.labels) : 0
      });
    }

    // 엘보우 포인트 찾기
    const optimalK = this.findElbowPoint(results);
    
    return {
      optimalK: optimalK,
      results: results
    };
  }

  // 실루엣 점수 계산
  static calculateSilhouetteScore(data, labels) {
    const n = data.length;
    let totalScore = 0;

    for (let i = 0; i < n; i++) {
      const clusterLabel = labels[i];
      
      // a(i): 같은 클러스터 내 다른 점들과의 평균 거리
      const sameCluster = data.filter((_, j) => j !== i && labels[j] === clusterLabel);
      const a = sameCluster.length > 0 ? 
        sameCluster.reduce((sum, point) => sum + this.calculateEuclideanDistance(data[i], point), 0) / sameCluster.length : 0;

      // b(i): 가장 가까운 다른 클러스터의 점들과의 평균 거리
      const otherClusters = [...new Set(labels.filter(l => l !== clusterLabel))];
      let minB = Infinity;

      otherClusters.forEach(otherLabel => {
        const otherCluster = data.filter((_, j) => labels[j] === otherLabel);
        const avgDist = otherCluster.reduce((sum, point) => 
          sum + this.calculateEuclideanDistance(data[i], point), 0) / otherCluster.length;
        minB = Math.min(minB, avgDist);
      });

      const b = minB === Infinity ? 0 : minB;
      const silhouette = (b - a) / Math.max(a, b);
      totalScore += silhouette;
    }

    return totalScore / n;
  }

  // 엘보우 포인트 찾기
  static findElbowPoint(results) {
    if (results.length < 3) return results[0]?.k || 1;

    let maxCurvature = 0;
    let elbowK = 1;

    for (let i = 1; i < results.length - 1; i++) {
      const prev = results[i - 1].inertia;
      const curr = results[i].inertia;
      const next = results[i + 1].inertia;

      // 곡률 계산 (간단한 근사)
      const curvature = Math.abs(prev + next - 2 * curr);
      
      if (curvature > maxCurvature) {
        maxCurvature = curvature;
        elbowK = results[i].k;
      }
    }

    return elbowK;
  }

  static calculateEuclideanDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
      sum += Math.pow(point1[i] - point2[i], 2);
    }
    return Math.sqrt(sum);
  }
}

/**
 * 계층적 클러스터링
 */
export class HierarchicalClusterer {
  constructor(linkage = 'ward', metric = DISTANCE_METRICS.EUCLIDEAN) {
    this.linkage = linkage; // 'single', 'complete', 'average', 'ward'
    this.metric = metric;
    this.dendrogram = [];
    this.clusterHistory = [];
  }

  // 클러스터링 실행
  fit(data, numClusters = null) {
    const n = data.length;
    
    // 거리 행렬 계산
    const distanceMatrix = this.calculateDistanceMatrix(data);
    
    // 초기 클러스터 설정 (각 점이 하나의 클러스터)
    let clusters = data.map((point, index) => ({
      id: index,
      points: [index],
      centroid: [...point],
      size: 1
    }));

    this.clusterHistory = [clusters.map(c => ({ ...c }))];

    // 병합 과정
    while (clusters.length > 1) {
      const { cluster1Index, cluster2Index, distance } = this.findClosestClusters(clusters, distanceMatrix);
      
      // 두 클러스터 병합
      const newCluster = this.mergeClusters(
        clusters[cluster1Index], 
        clusters[cluster2Index], 
        data
      );

      // 덴드로그램 정보 저장
      this.dendrogram.push({
        cluster1: clusters[cluster1Index].id,
        cluster2: clusters[cluster2Index].id,
        distance: distance,
        newClusterId: newCluster.id,
        step: this.dendrogram.length
      });

      // 클러스터 리스트 업데이트
      clusters = clusters.filter((_, i) => i !== cluster1Index && i !== cluster2Index);
      clusters.push(newCluster);
      
      this.clusterHistory.push(clusters.map(c => ({ ...c })));

      // 지정된 클러스터 수에 도달하면 중단
      if (numClusters && clusters.length === numClusters) {
        break;
      }
    }

    return {
      finalClusters: clusters,
      dendrogram: this.dendrogram,
      clusterHistory: this.clusterHistory,
      labels: this.generateLabels(clusters, n)
    };
  }

  // 거리 행렬 계산
  calculateDistanceMatrix(data) {
    const n = data.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = this.calculateDistance(data[i], data[j]);
        matrix[i][j] = distance;
        matrix[j][i] = distance;
      }
    }

    return matrix;
  }

  // 가장 가까운 클러스터 쌍 찾기
  findClosestClusters(clusters, distanceMatrix) {
    let minDistance = Infinity;
    let closestPair = { cluster1Index: 0, cluster2Index: 1 };

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = this.calculateClusterDistance(
          clusters[i], clusters[j], distanceMatrix
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPair = { 
            cluster1Index: i, 
            cluster2Index: j, 
            distance: distance 
          };
        }
      }
    }

    return closestPair;
  }

  // 클러스터 간 거리 계산
  calculateClusterDistance(cluster1, cluster2, distanceMatrix) {
    const points1 = cluster1.points;
    const points2 = cluster2.points;

    switch (this.linkage) {
      case 'single': // 최소 거리
        let minDist = Infinity;
        points1.forEach(p1 => {
          points2.forEach(p2 => {
            minDist = Math.min(minDist, distanceMatrix[p1][p2]);
          });
        });
        return minDist;

      case 'complete': // 최대 거리
        let maxDist = 0;
        points1.forEach(p1 => {
          points2.forEach(p2 => {
            maxDist = Math.max(maxDist, distanceMatrix[p1][p2]);
          });
        });
        return maxDist;

      case 'average': // 평균 거리
        let totalDist = 0;
        let count = 0;
        points1.forEach(p1 => {
          points2.forEach(p2 => {
            totalDist += distanceMatrix[p1][p2];
            count++;
          });
        });
        return totalDist / count;

      case 'ward': // Ward's method
        return this.calculateWardDistance(cluster1, cluster2);

      default:
        return this.calculateCentroidDistance(cluster1, cluster2);
    }
  }

  // Ward 거리 계산
  calculateWardDistance(cluster1, cluster2) {
    const n1 = cluster1.size;
    const n2 = cluster2.size;
    const centroidDist = this.calculateDistance(cluster1.centroid, cluster2.centroid);
    
    return Math.sqrt((n1 * n2) / (n1 + n2)) * centroidDist;
  }

  // 중심점 거리 계산
  calculateCentroidDistance(cluster1, cluster2) {
    return this.calculateDistance(cluster1.centroid, cluster2.centroid);
  }

  // 두 클러스터 병합
  mergeClusters(cluster1, cluster2, data) {
    const mergedPoints = [...cluster1.points, ...cluster2.points];
    const mergedSize = cluster1.size + cluster2.size;
    
    // 새로운 중심점 계산
    const newCentroid = new Array(data[0].length).fill(0);
    mergedPoints.forEach(pointIndex => {
      data[pointIndex].forEach((value, dim) => {
        newCentroid[dim] += value;
      });
    });
    newCentroid.forEach((sum, dim) => {
      newCentroid[dim] = sum / mergedSize;
    });

    return {
      id: Math.max(cluster1.id, cluster2.id) + data.length, // 고유 ID 생성
      points: mergedPoints,
      centroid: newCentroid,
      size: mergedSize,
      children: [cluster1.id, cluster2.id]
    };
  }

  // 라벨 생성
  generateLabels(clusters, n) {
    const labels = new Array(n);
    clusters.forEach((cluster, clusterIndex) => {
      cluster.points.forEach(pointIndex => {
        labels[pointIndex] = clusterIndex;
      });
    });
    return labels;
  }

  // 거리 계산
  calculateDistance(point1, point2) {
    switch (this.metric) {
      case DISTANCE_METRICS.EUCLIDEAN:
        return Math.sqrt(point1.reduce((sum, val, i) => 
          sum + Math.pow(val - point2[i], 2), 0));
      
      case DISTANCE_METRICS.MANHATTAN:
        return point1.reduce((sum, val, i) => 
          sum + Math.abs(val - point2[i]), 0);
      
      case DISTANCE_METRICS.COSINE:
        const dotProduct = point1.reduce((sum, val, i) => sum + val * point2[i], 0);
        const norm1 = Math.sqrt(point1.reduce((sum, val) => sum + val * val, 0));
        const norm2 = Math.sqrt(point2.reduce((sum, val) => sum + val * val, 0));
        return 1 - (dotProduct / (norm1 * norm2));
      
      default:
        return 0;
    }
  }
}

/**
 * 토픽 모델링 (간단한 LDA 구현)
 */
export class TopicModeler {
  constructor(numTopics = 5, alpha = 0.1, beta = 0.01, iterations = 100) {
    this.numTopics = numTopics;
    this.alpha = alpha; // 문서-토픽 디리클레 파라미터
    this.beta = beta;   // 토픽-단어 디리클레 파라미터
    this.iterations = iterations;
    this.vocabulary = new Map();
    this.topicWordCounts = [];
    this.docTopicCounts = [];
    this.topicCounts = [];
    this.wordCounts = [];
  }

  // 문서 집합을 토픽 모델링
  fitTransform(documents) {
    // 1. 전처리 및 어휘 구축
    const processedDocs = this.preprocessDocuments(documents);
    this.buildVocabulary(processedDocs);

    // 2. 초기화
    this.initializeCountMatrices(processedDocs);

    // 3. 깁스 샘플링
    this.runGibbsSampling(processedDocs);

    // 4. 결과 생성
    return this.generateResults(processedDocs);
  }

  // 문서 전처리
  preprocessDocuments(documents) {
    return documents.map(doc => {
      if (typeof doc !== 'string') return [];
      
      // 기본적인 한국어/영어 전처리
      return doc
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1)
        .filter(word => !this.isStopWord(word));
    });
  }

  // 불용어 확인
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      '은', '는', '이', '가', '을', '를', '의', '에', '에서', '와', '과', '로', '으로', '만', '도', '부터', '까지'
    ]);
    return stopWords.has(word);
  }

  // 어휘 구축
  buildVocabulary(processedDocs) {
    const wordFreq = new Map();
    
    processedDocs.forEach(doc => {
      doc.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });
    });

    // 빈도가 낮은 단어 제거 (최소 2회 이상 등장)
    let vocabIndex = 0;
    wordFreq.forEach((freq, word) => {
      if (freq >= 2) {
        this.vocabulary.set(word, vocabIndex++);
      }
    });
  }

  // 카운트 행렬 초기화
  initializeCountMatrices(processedDocs) {
    const V = this.vocabulary.size; // 어휘 크기
    const D = processedDocs.length; // 문서 수
    
    // 행렬 초기화
    this.topicWordCounts = Array(this.numTopics).fill().map(() => Array(V).fill(0));
    this.docTopicCounts = Array(D).fill().map(() => Array(this.numTopics).fill(0));
    this.topicCounts = Array(this.numTopics).fill(0);
    this.wordCounts = Array(D).fill(0);

    // 토픽 할당 초기화
    this.topicAssignments = processedDocs.map(doc => 
      doc.map(() => Math.floor(Math.random() * this.numTopics))
    );

    // 초기 카운트 계산
    processedDocs.forEach((doc, docIndex) => {
      doc.forEach((word, wordIndex) => {
        const wordId = this.vocabulary.get(word);
        if (wordId !== undefined) {
          const topic = this.topicAssignments[docIndex][wordIndex];
          
          this.topicWordCounts[topic][wordId]++;
          this.docTopicCounts[docIndex][topic]++;
          this.topicCounts[topic]++;
          this.wordCounts[docIndex]++;
        }
      });
    });
  }

  // 깁스 샘플링 실행
  runGibbsSampling(processedDocs) {
    for (let iter = 0; iter < this.iterations; iter++) {
      processedDocs.forEach((doc, docIndex) => {
        doc.forEach((word, wordIndex) => {
          const wordId = this.vocabulary.get(word);
          if (wordId !== undefined) {
            this.sampleTopicForWord(docIndex, wordIndex, wordId);
          }
        });
      });
    }
  }

  // 단어에 대한 토픽 샘플링
  sampleTopicForWord(docIndex, wordIndex, wordId) {
    const currentTopic = this.topicAssignments[docIndex][wordIndex];
    
    // 현재 할당 제거
    this.topicWordCounts[currentTopic][wordId]--;
    this.docTopicCounts[docIndex][currentTopic]--;
    this.topicCounts[currentTopic]--;

    // 각 토픽에 대한 확률 계산
    const probabilities = new Array(this.numTopics);
    for (let topic = 0; topic < this.numTopics; topic++) {
      const wordGivenTopic = (this.topicWordCounts[topic][wordId] + this.beta) / 
                            (this.topicCounts[topic] + this.vocabulary.size * this.beta);
      
      const topicGivenDoc = (this.docTopicCounts[docIndex][topic] + this.alpha) / 
                           (this.wordCounts[docIndex] + this.numTopics * this.alpha);
      
      probabilities[topic] = wordGivenTopic * topicGivenDoc;
    }

    // 확률 기반 토픽 선택
    const newTopic = this.sampleFromDistribution(probabilities);
    this.topicAssignments[docIndex][wordIndex] = newTopic;

    // 새로운 할당 추가
    this.topicWordCounts[newTopic][wordId]++;
    this.docTopicCounts[docIndex][newTopic]++;
    this.topicCounts[newTopic]++;
  }

  // 확률 분포에서 샘플링
  sampleFromDistribution(probabilities) {
    const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
    const normalizedProbs = probabilities.map(prob => prob / sum);
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < normalizedProbs.length; i++) {
      cumulative += normalizedProbs[i];
      if (rand <= cumulative) {
        return i;
      }
    }
    
    return normalizedProbs.length - 1;
  }

  // 결과 생성
  generateResults(processedDocs) {
    const vocabularyArray = Array.from(this.vocabulary.keys());
    
    // 토픽별 상위 단어
    const topicWords = this.topicWordCounts.map((wordCounts, topicIndex) => {
      const wordProbs = wordCounts.map((count, wordIndex) => ({
        word: vocabularyArray[wordIndex],
        probability: (count + this.beta) / (this.topicCounts[topicIndex] + this.vocabulary.size * this.beta),
        count: count
      }));
      
      return {
        topicId: topicIndex,
        words: wordProbs
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 10), // 상위 10개 단어
        totalWords: this.topicCounts[topicIndex]
      };
    });

    // 문서별 토픽 분포
    const documentTopics = this.docTopicCounts.map((topicCounts, docIndex) => ({
      documentId: docIndex,
      topicDistribution: topicCounts.map((count, topicIndex) => ({
        topicId: topicIndex,
        probability: (count + this.alpha) / (this.wordCounts[docIndex] + this.numTopics * this.alpha)
      })).sort((a, b) => b.probability - a.probability)
    }));

    return {
      topics: topicWords,
      documentTopics: documentTopics,
      vocabulary: vocabularyArray,
      topicAssignments: this.topicAssignments
    };
  }
}

/**
 * 테마 추출기
 */
export class ThemeExtractor {
  constructor() {
    this.themes = new Map();
    this.themeKeywords = new Map();
    this.extractionHistory = [];
  }

  // 키워드 기반 테마 추출
  extractThemesFromKeywords(documents, predefinedThemes = null) {
    const themes = predefinedThemes || this.getDefaultThemes();
    const results = new Map();

    documents.forEach((doc, docIndex) => {
      const docThemes = {};
      const text = typeof doc === 'string' ? doc : doc.content || '';
      const lowercaseText = text.toLowerCase();

      themes.forEach((keywords, themeName) => {
        let score = 0;
        let matchedKeywords = [];

        keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          const matches = (lowercaseText.match(new RegExp(keywordLower, 'g')) || []).length;
          if (matches > 0) {
            score += matches;
            matchedKeywords.push({ keyword, count: matches });
          }
        });

        if (score > 0) {
          docThemes[themeName] = {
            score: score,
            normalizedScore: score / text.length * 1000, // 정규화
            matchedKeywords: matchedKeywords,
            confidence: Math.min(score / 10, 1) // 0-1 사이로 정규화
          };
        }
      });

      results.set(docIndex, {
        documentId: docIndex,
        themes: docThemes,
        primaryTheme: this.getPrimaryTheme(docThemes),
        themeCount: Object.keys(docThemes).length
      });
    });

    return {
      documentThemes: results,
      themeStatistics: this.calculateThemeStatistics(results),
      themeClusters: this.clusterDocumentsByTheme(results)
    };
  }

  // 기본 테마 정의
  getDefaultThemes() {
    return new Map([
      ['기술혁신', ['AI', '인공지능', '머신러닝', '딥러닝', '빅데이터', '클라우드', '5G', '사물인터넷', 'IoT', '블록체인', '디지털전환']],
      ['바이오헬스', ['바이오', '제약', '의료', '백신', '신약', '임상시험', '헬스케어', '진단', '치료제', '의료기기']],
      ['친환경에너지', ['ESG', '친환경', '재생에너지', '태양광', '풍력', '전기차', '수소', '배터리', '탄소중립', '그린뉴딜']],
      ['금융서비스', ['핀테크', '디지털금융', '암호화폐', '비트코인', '블록체인', '모바일페이', '온라인뱅킹', '보험테크']],
      ['엔터테인먼트', ['게임', '메타버스', 'VR', 'AR', '콘텐츠', '미디어', '스트리밍', 'OTT', 'K-컨텐츠', '한류']],
      ['반도체', ['반도체', '메모리', '시스템반도체', '팹리스', '파운드리', '웨이퍼', '칩셋', '프로세서']],
      ['자동차', ['전기차', '자율주행', '모빌리티', '카셰어링', '배터리', '충전인프라', '스마트카']],
      ['부동산', ['부동산', '리츠', 'REITs', '건설', '개발', '분양', '임대', '상업용부동산']],
      ['소비재', ['소비', '리테일', '이커머스', '온라인쇼핑', '배송', '물류', '브랜드', '식품', '화장품']],
      ['정책테마', ['정부정책', '규제완화', '세제혜택', '지원사업', '인센티브', '공공투자', '국책사업']]
    ]);
  }

  // 주요 테마 결정
  getPrimaryTheme(docThemes) {
    if (Object.keys(docThemes).length === 0) return null;

    const sortedThemes = Object.entries(docThemes)
      .sort(([,a], [,b]) => b.normalizedScore - a.normalizedScore);

    return {
      theme: sortedThemes[0][0],
      score: sortedThemes[0][1].normalizedScore,
      confidence: sortedThemes[0][1].confidence
    };
  }

  // 테마 통계 계산
  calculateThemeStatistics(results) {
    const themeFreq = new Map();
    const themeScores = new Map();
    let totalDocs = 0;

    results.forEach(result => {
      totalDocs++;
      Object.entries(result.themes).forEach(([theme, data]) => {
        themeFreq.set(theme, (themeFreq.get(theme) || 0) + 1);
        
        if (!themeScores.has(theme)) {
          themeScores.set(theme, []);
        }
        themeScores.get(theme).push(data.normalizedScore);
      });
    });

    const statistics = {};
    themeFreq.forEach((freq, theme) => {
      const scores = themeScores.get(theme);
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      statistics[theme] = {
        frequency: freq,
        coverage: (freq / totalDocs) * 100,
        averageScore: avgScore,
        maxScore: Math.max(...scores),
        minScore: Math.min(...scores),
        totalMentions: scores.length
      };
    });

    return statistics;
  }

  // 테마별 문서 클러스터링
  clusterDocumentsByTheme(results) {
    const themeClusters = new Map();

    results.forEach((result, docIndex) => {
      if (result.primaryTheme) {
        const theme = result.primaryTheme.theme;
        
        if (!themeClusters.has(theme)) {
          themeClusters.set(theme, []);
        }
        
        themeClusters.get(theme).push({
          documentId: docIndex,
          score: result.primaryTheme.score,
          confidence: result.primaryTheme.confidence,
          allThemes: Object.keys(result.themes)
        });
      }
    });

    // 각 클러스터 내에서 점수순 정렬
    themeClusters.forEach((docs, theme) => {
      docs.sort((a, b) => b.score - a.score);
    });

    return Object.fromEntries(themeClusters);
  }

  // 동적 테마 발견
  discoverEmergingThemes(documents, windowSize = 7) {
    const timeWindows = this.createTimeWindows(documents, windowSize);
    const emergingThemes = [];

    timeWindows.forEach((window, index) => {
      if (index === 0) return; // 첫 번째 윈도우는 기준점

      const currentKeywords = this.extractKeywords(window.documents);
      const previousKeywords = this.extractKeywords(timeWindows[index - 1].documents);

      // 새로운 키워드 또는 급증한 키워드 찾기
      const emerging = this.findEmergingKeywords(currentKeywords, previousKeywords);
      
      if (emerging.length > 0) {
        emergingThemes.push({
          timeWindow: window.timeRange,
          emergingKeywords: emerging,
          potentialTheme: this.suggestThemeName(emerging)
        });
      }
    });

    return emergingThemes;
  }

  // 시간 윈도우 생성
  createTimeWindows(documents, windowSize) {
    const sortedDocs = documents
      .filter(doc => doc.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const windows = [];
    for (let i = 0; i < sortedDocs.length; i += windowSize) {
      const windowDocs = sortedDocs.slice(i, i + windowSize);
      if (windowDocs.length > 0) {
        windows.push({
          timeRange: {
            start: windowDocs[0].date,
            end: windowDocs[windowDocs.length - 1].date
          },
          documents: windowDocs
        });
      }
    }

    return windows;
  }

  // 키워드 추출
  extractKeywords(documents) {
    const keywordFreq = new Map();
    
    documents.forEach(doc => {
      const text = doc.content || doc.title || '';
      const words = text
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !this.isCommonWord(word));

      words.forEach(word => {
        keywordFreq.set(word, (keywordFreq.get(word) || 0) + 1);
      });
    });

    return keywordFreq;
  }

  // 일반적인 단어 확인
  isCommonWord(word) {
    const commonWords = new Set([
      '있다', '없다', '하다', '되다', '이다', '그리고', '그러나', '하지만', '또한', '때문에',
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one'
    ]);
    return commonWords.has(word);
  }

  // 새로운 키워드 찾기
  findEmergingKeywords(currentKeywords, previousKeywords) {
    const emerging = [];
    
    currentKeywords.forEach((currentFreq, keyword) => {
      const previousFreq = previousKeywords.get(keyword) || 0;
      
      // 새로운 키워드이거나 빈도가 크게 증가한 경우
      if (previousFreq === 0 || (currentFreq / Math.max(previousFreq, 1)) > 2) {
        emerging.push({
          keyword: keyword,
          currentFrequency: currentFreq,
          previousFrequency: previousFreq,
          growthRatio: previousFreq === 0 ? Infinity : currentFreq / previousFreq
        });
      }
    });

    return emerging
      .sort((a, b) => b.currentFrequency - a.currentFrequency)
      .slice(0, 10); // 상위 10개
  }

  // 테마명 제안
  suggestThemeName(emergingKeywords) {
    if (emergingKeywords.length === 0) return 'Unknown Theme';
    
    // 가장 빈도가 높은 키워드들을 조합하여 테마명 생성
    const topKeywords = emergingKeywords
      .slice(0, 3)
      .map(item => item.keyword);
    
    return topKeywords.join(' + ') + ' 테마';
  }
}

/**
 * 통합 클러스터 분석 매니저
 */
export class ClusterAnalysisManager {
  constructor() {
    this.kmeansClusterer = null;
    this.hierarchicalClusterer = new HierarchicalClusterer();
    this.topicModeler = new TopicModeler();
    this.themeExtractor = new ThemeExtractor();
    this.analysisResults = new Map();
  }

  // 종합 클러스터 분석
  async performComprehensiveAnalysis(data, options = {}) {
    const {
      includeKMeans = true,
      includeHierarchical = true,
      includeTopicModeling = false,
      includeThemeExtraction = true,
      textData = null,
      maxClusters = 10
    } = options;

    const results = {
      timestamp: new Date().toISOString(),
      numerical: {},
      textual: {},
      insights: []
    };

    try {
      console.log('🔍 클러스터 분석 시작...');

      // 1. 수치 데이터 클러스터링
      if (includeKMeans && data.length > 0) {
        console.log('📊 K-means 클러스터링...');
        const optimalK = KMeansClusterer.findOptimalK(data, maxClusters);
        this.kmeansClusterer = new KMeansClusterer(optimalK.optimalK);
        results.numerical.kmeans = {
          ...this.kmeansClusterer.fit(data),
          optimalK: optimalK
        };
      }

      if (includeHierarchical && data.length > 0) {
        console.log('🌳 계층적 클러스터링...');
        results.numerical.hierarchical = this.hierarchicalClusterer.fit(data);
      }

      // 2. 텍스트 데이터 분석
      if (textData && textData.length > 0) {
        if (includeTopicModeling) {
          console.log('📝 토픽 모델링...');
          results.textual.topics = this.topicModeler.fitTransform(textData);
        }

        if (includeThemeExtraction) {
          console.log('🎯 테마 추출...');
          results.textual.themes = this.themeExtractor.extractThemesFromKeywords(textData);
          results.textual.emergingThemes = this.themeExtractor.discoverEmergingThemes(textData);
        }
      }

      // 3. 인사이트 생성
      results.insights = this.generateClusterInsights(results);

      this.analysisResults.set('latest', results);
      console.log('✅ 클러스터 분석 완료');

      return results;

    } catch (error) {
      console.error('❌ 클러스터 분석 실패:', error);
      throw error;
    }
  }

  // 클러스터 인사이트 생성
  generateClusterInsights(results) {
    const insights = [];

    // K-means 결과 분석
    if (results.numerical.kmeans) {
      const kmeans = results.numerical.kmeans;
      const optimalK = kmeans.optimalK.optimalK;
      
      insights.push({
        type: 'optimal_clusters',
        message: `데이터에 대한 최적 클러스터 수는 ${optimalK}개로 분석되었습니다.`,
        importance: 'high',
        metric: optimalK,
        details: kmeans.optimalK.results
      });

      if (kmeans.inertia) {
        insights.push({
          type: 'cluster_quality',
          message: `클러스터 응집도(inertia): ${kmeans.inertia.toFixed(2)}`,
          importance: 'medium',
          metric: kmeans.inertia
        });
      }
    }

    // 토픽 모델링 결과 분석
    if (results.textual.topics) {
      const topics = results.textual.topics.topics;
      const dominantTopic = topics.reduce((max, topic) => 
        topic.totalWords > max.totalWords ? topic : max
      );

      insights.push({
        type: 'dominant_topic',
        message: `가장 주요한 토픽은 "${dominantTopic.words[0].word}" 관련 주제입니다.`,
        importance: 'high',
        metric: dominantTopic.totalWords,
        details: dominantTopic.words.slice(0, 5)
      });
    }

    // 테마 분석 결과
    if (results.textual.themes) {
      const themeStats = results.textual.themes.themeStatistics;
      const mostPopularTheme = Object.entries(themeStats)
        .sort(([,a], [,b]) => b.coverage - a.coverage)[0];

      if (mostPopularTheme) {
        insights.push({
          type: 'popular_theme',
          message: `가장 인기 있는 테마는 "${mostPopularTheme[0]}"로 ${mostPopularTheme[1].coverage.toFixed(1)}%의 문서에서 다뤄졌습니다.`,
          importance: 'high',
          metric: mostPopularTheme[1].coverage,
          theme: mostPopularTheme[0]
        });
      }
    }

    // 신흥 테마 분석
    if (results.textual.emergingThemes && results.textual.emergingThemes.length > 0) {
      const latestEmerging = results.textual.emergingThemes[results.textual.emergingThemes.length - 1];
      
      insights.push({
        type: 'emerging_theme',
        message: `새로운 테마 "${latestEmerging.potentialTheme}"가 감지되었습니다.`,
        importance: 'medium',
        details: latestEmerging.emergingKeywords.slice(0, 3)
      });
    }

    return insights.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  }

  // 클러스터 시각화 데이터 생성
  generateVisualizationData(analysisKey = 'latest') {
    const results = this.analysisResults.get(analysisKey);
    if (!results) return null;

    const visualizationData = {
      clusters: [],
      topics: [],
      themes: []
    };

    // K-means 클러스터 시각화
    if (results.numerical.kmeans) {
      const kmeans = results.numerical.kmeans;
      visualizationData.clusters = kmeans.centroids.map((centroid, index) => ({
        id: index,
        centroid: centroid,
        size: kmeans.labels.filter(label => label === index).length,
        color: this.getClusterColor(index)
      }));
    }

    // 토픽 시각화
    if (results.textual.topics) {
      visualizationData.topics = results.textual.topics.topics.map(topic => ({
        id: topic.topicId,
        words: topic.words.slice(0, 5),
        size: topic.totalWords,
        color: this.getTopicColor(topic.topicId)
      }));
    }

    // 테마 시각화
    if (results.textual.themes) {
      visualizationData.themes = Object.entries(results.textual.themes.themeStatistics)
        .map(([theme, stats]) => ({
          name: theme,
          coverage: stats.coverage,
          frequency: stats.frequency,
          score: stats.averageScore,
          color: this.getThemeColor(theme)
        }));
    }

    return visualizationData;
  }

  // 클러스터 색상 생성
  getClusterColor(index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    return colors[index % colors.length];
  }

  // 토픽 색상 생성
  getTopicColor(index) {
    const colors = ['#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'];
    return colors[index % colors.length];
  }

  // 테마 색상 생성
  getThemeColor(theme) {
    const colors = {
      '기술혁신': '#3498DB',
      '바이오헬스': '#27AE60',
      '친환경에너지': '#2ECC71',
      '금융서비스': '#F39C12',
      '엔터테인먼트': '#E74C3C',
      '반도체': '#9B59B6',
      '자동차': '#1ABC9C',
      '부동산': '#E67E22',
      '소비재': '#F1C40F',
      '정책테마': '#34495E'
    };
    return colors[theme] || '#95A5A6';
  }

  // 분석 결과 조회
  getAnalysisResults(key = 'latest') {
    return this.analysisResults.get(key);
  }

  // 모든 분석 결과 조회
  getAllResults() {
    return Array.from(this.analysisResults.entries());
  }
} 