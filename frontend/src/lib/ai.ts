import type { JSONContent } from '@tiptap/react';

export type ProposalAction = 'replace' | 'insert';

export interface ParsedReply {
  proposal: { action: ProposalAction; content: string } | null;
  text: string; // proposal değilse normal mesaj
}

/** AI yanıtındaki [ÖNERI:*] etiketini ayrıştırır. */
export function parseProposal(raw: string): ParsedReply {
  const stripped = stripOuterFence(raw);
  const replace = '[ÖNERI:DEĞİŞTİR]';
  const insert = '[ÖNERI:EKLE]';

  if (stripped.startsWith(replace)) {
    return { proposal: { action: 'replace', content: stripped.slice(replace.length).trim() }, text: '' };
  }
  if (stripped.startsWith(insert)) {
    return { proposal: { action: 'insert', content: stripped.slice(insert.length).trim() }, text: '' };
  }
  return { proposal: null, text: stripped };
}

/** AI bazen tüm yanıtı ``` ile sarıyor — dış fence'i soyar. */
export function stripOuterFence(text: string): string {
  const t = text.trim();
  if (t.startsWith('```') && t.endsWith('```') && t.length > 6) {
    const lines = t.split('\n');
    lines.shift();
    lines.pop();
    return lines.join('\n').trim();
  }
  return t;
}

/** TipTap JSON dokümanını düz metne çevirir (özyinelemeli). */
export function jsonToText(json: JSONContent | null | undefined): string {
  if (!json) return '';
  const blockTypes = new Set(['paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem', 'horizontalRule']);
  let out = '';
  const walk = (n: JSONContent) => {
    if (n.text) out += n.text;
    if (n.content) n.content.forEach(walk);
    if (n.type && blockTypes.has(n.type)) out += '\n';
  };
  walk(json);
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface NoteContext {
  title: string;
  text: string;
}

interface ChatOptions {
  context: NoteContext;
  history: ChatTurn[];
  message: string;
  model?: string;
  signal?: AbortSignal;
}

/** OpenAI Chat Completions çağrısı — not içeriğini system prompt olarak yedirir. */
export async function chatWithNoteContext({
  context,
  history,
  message,
  model = 'gpt-4o-mini',
  signal,
}: ChatOptions): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_OPENAI_API_KEY tanımlı değil. .env.local dosyasını kontrol et.');

  const systemPrompt = `Sen yardımcı, Türkçe konuşan bir not asistanısın. Kullanıcının üzerinde çalıştığı notu bağlam olarak alıyorsun. Cevaplarını bu nota göre ver, gerektiğinde Markdown kullan, kısa ve net ol.

ÖNEMLİ — Yanıt formatı kuralları:
1. Kullanıcı NOT İÇERİĞİNİ değiştirmeni isterse (örn: yeniden yaz, iyileştir, özetle, vs.), yanıtının İLK SATIRINA "[ÖNERI:DEĞİŞTİR]" etiketini koy, sonraki satırlarda SADECE yeni içeriği Markdown olarak ver. Başka açıklama EKLEME.
2. Kullanıcı NOTA YENİ BİR PARAGRAF/BÖLÜM EKLEMENİ isterse, yanıtının ilk satırına "[ÖNERI:EKLE]" etiketini koy, sonra eklenecek içeriği Markdown olarak ver.
3. Yanıtı ASLA \`\`\` üçlü backtick ile sarma; doğrudan ham Markdown yaz.
4. Soru-cevap, açıklama, sohbet ise etiket KULLANMA — normal cevap ver.

═══ NOT BAŞLIĞI ═══
${context.title || '(başlıksız)'}

═══ NOT İÇERİĞİ ═══
${context.text || '(içerik henüz yazılmamış)'}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ],
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
