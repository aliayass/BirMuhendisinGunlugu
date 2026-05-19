export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'code'
  | 'bullet'
  | 'numbered'
  | 'todo'
  | 'quote'
  | 'divider';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
}

export function createBlock(type: BlockType = 'paragraph'): Block {
  return { id: crypto.randomUUID(), type, content: '', checked: false, language: 'javascript' };
}

export function parseContent(raw: string): Block[] {
  if (!raw?.trim()) return [createBlock()];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  // Legacy markdown content → single paragraph block
  return [{ id: crypto.randomUUID(), type: 'paragraph', content: raw }];
}

export function serializeContent(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

export function blocksToText(blocks: Block[]): string {
  return blocks.map(b => b.content).filter(Boolean).join('\n');
}

export function getPreviewText(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((b: Block) => b.type !== 'divider' && b.content)
        .map((b: Block) => b.content)
        .join(' ')
        .slice(0, 200);
    }
  } catch {}
  return raw?.slice(0, 200) ?? '';
}
