import { useMemo } from 'react';
import { CopyButton } from '../copy-button';
import styles from './json-viewer.module.scss';

export interface JsonViewerProps {
  data: unknown;
  className?: string;
}

export function JsonViewer({ data, className = '' }: JsonViewerProps) {
  const highlighted = useMemo(() => {
    let json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    if (!json) return '';
    
    // Encode HTML entities to prevent XSS
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Regex logic to match JSON lexical tokens
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = styles.number;
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = styles.key;
          // Exclude the colon for precise styling of the key itself
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
  }, [data]);

  const jsonString = useMemo(() => typeof data === 'string' ? data : JSON.stringify(data, null, 2), [data]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <pre 
        className={styles.container}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      <CopyButton value={jsonString || ''} />
    </div>
  );
}
