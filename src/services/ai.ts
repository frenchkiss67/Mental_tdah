import type { Subtask } from '../types';
import { uid } from '../utils';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const SYSTEM = `Tu es un assistant pour personnes TDAH. Tu reçois une tâche et tu la décomposes en 3 à 5 micro-étapes très concrètes, courtes (≤ 8 mots chacune), formulées à l'impératif. Pas d'introduction, pas de conclusion. Réponds UNIQUEMENT en JSON valide au format {"steps": ["étape 1", "étape 2", ...]}.`;

const stripFences = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  }
  return trimmed;
};

export const decomposeWithAI = async (
  title: string,
  note: string | undefined,
  apiKey: string,
): Promise<Subtask[]> => {
  if (!apiKey) throw new Error('Clé API manquante');

  const userMessage = note ? `Tâche: ${title}\nDétails: ${note}` : `Tâche: ${title}`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errBody.slice(0, 200) || res.statusText}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const cleaned = stripFences(text);

  let parsed: { steps?: unknown };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Réponse IA non parseable');
  }

  const steps = Array.isArray(parsed.steps)
    ? parsed.steps.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : [];

  if (steps.length === 0) throw new Error('Aucune étape renvoyée');

  return steps.slice(0, 6).map((title) => ({
    id: uid(),
    title: title.trim(),
    done: false,
  }));
};
