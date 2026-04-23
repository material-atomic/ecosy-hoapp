import { useMemo, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import styles from './json-editor.module.scss';

export interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function JsonEditor({ value, onChange, className = '', style, placeholder }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlighted = useMemo(() => {
    if (!value) return '';
    try {
      // Decode user text securely logic - actually we just tokenize it as is, 
      // but we HTML escape it first so injections in PRE don't break HTML structure
      let html = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Tokenize assuming valid JSON structure
      html = html.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
        let cls = styles.number;
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = styles.key;
            const m = match.substring(0, match.length - 1);
            return `<span class="${cls}">${m}</span>:`;
          } else {
            cls = styles.string;
          }
        } else if (/true|false/.test(match)) {
          cls = styles.boolean;
        } else if (/null/.test(match)) {
          cls = styles.null;
        }
        return `<span class="${cls}">${match}</span>`;
      });
      return html;
    } catch {
      // Fallback
      return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      
      // Restore cursor position after state updates
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Add trailing space to pre if last character is line break so height calculates properly
  const renderedHtml = highlighted + (value.endsWith('\n') ? '<br/>' : '');

  // Determine line counts
  const lineCount = value.split('\n').length || 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div className={`${styles.outer} ${className}`} style={style}>
      <div className={styles.lineNumbers} aria-hidden="true">
        {lineNumbers}
      </div>
      <div className={styles.container}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder={placeholder}
        />
        <pre 
          className={styles.pre} 
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
}
