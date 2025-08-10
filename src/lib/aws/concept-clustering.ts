import { generateDesignMockups } from './bedrock';

export interface MockupScore {
  id: string;
  styleScore: number;
  contrastScore: number;
  accessibilityScore: number;
  overallScore: number;
  cluster: string;
}

export interface ClusteredMockups {
  cluster: string;
  mockups: any[];
  topMockup: any;
  averageScore: number;
}

export async function clusterAndScoreMockups(mockups: any[]): Promise<{
  clusters: ClusteredMockups[];
  topThree: any[];
  scores: MockupScore[];
}> {
  const scores = mockups.map(mockup => ({
    id: mockup.id,
    styleScore: calculateStyleScore(mockup),
    contrastScore: calculateContrastScore(mockup),
    accessibilityScore: calculateAccessibilityScore(mockup),
    overallScore: 0,
    cluster: determineCluster(mockup)
  }));

  scores.forEach(score => {
    score.overallScore = (score.styleScore + score.contrastScore + score.accessibilityScore) / 3;
  });

  const clusters = groupByClusters(mockups, scores);
  const topThree = scores
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 3)
    .map(score => mockups.find(m => m.id === score.id));

  return { clusters, topThree, scores };
}

function calculateStyleScore(mockup: any): number {
  let score = 0;
  if (mockup.colors?.length > 2) score += 20;
  if (mockup.typography?.fontPairs > 1) score += 20;
  if (mockup.layout?.type === 'grid') score += 30;
  if (mockup.elements?.length > 3) score += 30;
  return Math.min(score, 100);
}

function calculateContrastScore(mockup: any): number {
  const colors = mockup.colors || [];
  if (colors.length < 2) return 50;
  
  let contrastSum = 0;
  for (let i = 0; i < colors.length - 1; i++) {
    contrastSum += calculateColorContrast(colors[i], colors[i + 1]);
  }
  return Math.min((contrastSum / (colors.length - 1)) * 20, 100);
}

function calculateAccessibilityScore(mockup: any): number {
  let score = 0;
  if (mockup.typography?.fontSize >= 16) score += 25;
  if (mockup.colors?.some((c: string) => isHighContrast(c))) score += 25;
  if (mockup.elements?.some((e: any) => e.alt || e.ariaLabel)) score += 25;
  if (mockup.layout?.responsive) score += 25;
  return score;
}

function determineCluster(mockup: any): string {
  const style = mockup.style || '';
  if (style.includes('modern') || style.includes('clean')) return 'modern';
  if (style.includes('vintage') || style.includes('retro')) return 'vintage';
  if (style.includes('playful') || style.includes('colorful')) return 'playful';
  if (style.includes('professional') || style.includes('corporate')) return 'professional';
  if (style.includes('artistic') || style.includes('creative')) return 'artistic';
  return 'minimalist';
}

function groupByClusters(mockups: any[], scores: MockupScore[]): ClusteredMockups[] {
  const clusterMap = new Map<string, any[]>();
  
  mockups.forEach(mockup => {
    const score = scores.find(s => s.id === mockup.id);
    const cluster = score?.cluster || 'other';
    if (!clusterMap.has(cluster)) clusterMap.set(cluster, []);
    clusterMap.get(cluster)!.push({ ...mockup, score: score?.overallScore || 0 });
  });

  return Array.from(clusterMap.entries()).map(([cluster, mockups]) => {
    const sortedMockups = mockups.sort((a, b) => b.score - a.score);
    return {
      cluster,
      mockups: sortedMockups,
      topMockup: sortedMockups[0],
      averageScore: mockups.reduce((sum, m) => sum + m.score, 0) / mockups.length
    };
  });
}

function calculateColorContrast(color1: string, color2: string): number {
  // Simplified contrast calculation
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const r2 = parseInt(hex2.substr(0, 2), 16);
  return Math.abs(r1 - r2) / 255 * 5;
}

function isHighContrast(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 || brightness > 200;
}