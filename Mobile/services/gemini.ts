import axios from 'axios';
import { supabase } from './supabase';
import { AIRecommendation, Problem } from '../types/problem';

interface RecommendationContext {
  userId: string;
  userRating: number;
  solvedProblemIds: string[];
  solvedTagsCount: Record<string, number>;
  weakTopics: string[];
  candidateProblems: Problem[];
}

export const GeminiService = {
  async generateRecommendations(context: RecommendationContext): Promise<AIRecommendation[]> {
    const {
      userId,
      userRating,
      solvedProblemIds,
      solvedTagsCount,
      weakTopics,
      candidateProblems,
    } = context;

    const solvedSet = new Set(solvedProblemIds);
    const availableProblems = candidateProblems.filter((p) => !solvedSet.has(p.id) && p.rating);

    const targetMin = Math.max(800, userRating - 100);
    const targetMax = userRating + 250;
    const prioritizedCandidates = availableProblems
      .filter((p) => p.rating && p.rating >= targetMin && p.rating <= targetMax)
      .slice(0, 15);

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (apiKey && apiKey.length > 10 && apiKey !== 'your-gemini-api-key') {
      try {
        const prompt = `You are an elite competitive programming mentor for Nexora.
User profile:
- Codeforces Rating: ${userRating}
- Solved tags distribution: ${JSON.stringify(solvedTagsCount)}
- Identified weak areas: ${weakTopics.join(', ') || 'Needs balanced practice'}

Candidate problems available:
${prioritizedCandidates.map((p, idx) => `[${idx}] ID: ${p.id}, Title: "${p.name}", Rating: ${p.rating}, Tags: ${p.tags.join(', ')}`).join('\n')}

Select the best 4-5 problems in a pedagogical practice sequence to help this user climb ratings.
Respond ONLY with a valid JSON array of objects with the exact schema:
[
  {
    "candidateIndex": number,
    "suggested_difficulty": string,
    "topic": string,
    "reason": string,
    "practice_sequence": number
  }
]
Do not wrap in markdown quotes if possible, output pure JSON.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await axios.post(
          geminiUrl,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          },
          { timeout: 15000 }
        );

        const candidates = response.data?.candidates;
        if (candidates && candidates.length > 0) {
          const rawText = candidates[0].content?.parts[0]?.text;
          const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const recommendations: AIRecommendation[] = [];

            for (const item of parsed) {
              const problem = prioritizedCandidates[item.candidateIndex];
              if (!problem) continue;

              const rec: AIRecommendation = {
                id: `rec-${Date.now()}-${problem.id}`,
                user_id: userId,
                problem_id: problem.id,
                problem_title: problem.name,
                platform: problem.platform,
                suggested_difficulty: item.suggested_difficulty || 'Recommended Practice',
                suggested_rating: problem.rating || userRating,
                topic: item.topic || (problem.tags[0] ?? 'General'),
                reason: item.reason || 'Strategic rating progression problem.',
                practice_sequence: item.practice_sequence || 1,
                is_completed: false,
                created_at: new Date().toISOString(),
              };

              recommendations.push(rec);

              await supabase.from('recommendations').insert({
                user_id: userId,
                problem_id: rec.problem_id,
                problem_title: rec.problem_title,
                platform: rec.platform,
                suggested_difficulty: rec.suggested_difficulty,
                suggested_rating: rec.suggested_rating,
                topic: rec.topic,
                reason: rec.reason,
                practice_sequence: rec.practice_sequence,
              });
            }

            if (recommendations.length > 0) {
              return recommendations;
            }
          }
        }
      } catch (err: any) {
        console.warn('[GeminiService] Gemini API call failed, falling back to algorithmic mentor:', err.message);
      }
    }

    const fallbackRecs: AIRecommendation[] = prioritizedCandidates.slice(0, 5).map((p, index) => {
      const isWeakTopic = p.tags.some((t) => weakTopics.includes(t));
      const reason = isWeakTopic
        ? `Targeted practice: Strengthens your understanding of ${p.tags.join('/')}, an area needing improvement.`
        : `Ladder progression: Rating ${p.rating} matches your target rating threshold (+${(p.rating || 0) - userRating}).`;

      return {
        id: `rec-rule-${index}-${p.id}`,
        user_id: userId,
        problem_id: p.id,
        problem_title: p.name,
        platform: p.platform,
        suggested_difficulty: (p.rating || 0) > userRating ? 'Challenging' : 'Reinforcement',
        suggested_rating: p.rating || userRating,
        topic: p.tags[0] || 'Implementation',
        reason,
        practice_sequence: index + 1,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
    });

    if (userId) {
      for (const rec of fallbackRecs) {
        try {
          await supabase.from('recommendations').insert({
            user_id: userId,
            problem_id: rec.problem_id,
            problem_title: rec.problem_title,
            platform: rec.platform,
            suggested_difficulty: rec.suggested_difficulty,
            suggested_rating: rec.suggested_rating,
            topic: rec.topic,
            reason: rec.reason,
            practice_sequence: rec.practice_sequence,
          });
        } catch {
        }
      }
    }

    return fallbackRecs;
  },

  async getStoredRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data) return [];
      return data as AIRecommendation[];
    } catch {
      return [];
    }
  },
};
