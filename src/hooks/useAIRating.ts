import { useState } from 'react';
import { DesignMockup } from '@/types';

export interface AIRatingResult {
  rating: number | null;
  critique: string;
  suggestions: string[];
  loading: boolean;
  error: string | null;
}

export function useAIRating(design: DesignMockup | null) {
  const [result, setResult] = useState<AIRatingResult>({
    rating: null,
    critique: '',
    suggestions: [],
    loading: false,
    error: null,
  });

  async function fetchRating() {
    if (!design) return;
    setResult(r => ({ ...r, loading: true, error: null }));
    try {
      const res = await fetch('/api/ai-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design),
      });
      if (!res.ok) throw new Error('Failed to fetch AI rating');
      const data = await res.json();
      setResult({
        rating: data.rating,
        critique: data.critique,
        suggestions: data.suggestions,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      setResult(r => ({ ...r, loading: false, error: e.message || 'Unknown error' }));
    }
  }

  return { ...result, fetchRating };
}
