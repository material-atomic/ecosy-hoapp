import { useMemo } from 'react';
import { CopyButton } from '../copy-button';
import styles from './markdown-viewer.module.scss';

export interface MarkdownViewerProps {
  content?: string;
  className?: string;
}

function parseMarkdown(md: string): string {
  if (!md) return '';

  // 1. Escape HTML to prevent injection, but allow specific swagger tags if needed
  // For basic safety, we escape < and > 
  let html = md.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 2. Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // 3. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 4. Bold and Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 5. Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 6. Headers
  html = html.replace(/^(#{1,6})\s+(.*)$/gm, (_, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content}</h${level}>`;
  });

  // 7. Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>');

  // 8. Lists
  html = html.replace(/^[-*]\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul>$1</ul>');

  // 9. Paragraph split
  // We split by multiple newlines to identify blocks.
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(block => {
    // If it's already a block element we created, leave it
    if (block.match(/^(<h|<ul|<ol|<pre|<blockquote|<li>)/)) {
      return block;
    }
    // Otherwise wrap in p, converting single newlines to <br/>
    return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return html;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  const htmlContent = useMemo(() => parseMarkdown(content || ''), [content]);

  if (!content) {
    return <p className={`${styles.root} ${className}`} style={{ opacity: 0.5 }}>No description provided.</p>;
  }

  return (
    <div style={{ position: 'relative', height: '100%' }} className={className}>
      <div 
        className={styles.root} 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
      <CopyButton value={content} />
    </div>
  );
}
