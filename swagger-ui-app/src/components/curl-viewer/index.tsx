import { useMemo } from 'react';
import { CopyButton } from '../copy-button';
import styles from './curl-viewer.module.scss';

export interface CurlViewerProps {
  data: string;
  className?: string;
}

export function CurlViewer({ data, className = '' }: CurlViewerProps) {
  const highlighted = useMemo(() => {
    if (!data) return '';
    
    // Html Encode
    const curlStr = data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Pattern to match curl syntax safely
    const curlRegex = /(^\s*curl\b|\s+curl\b)|(\b(?:GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b)|(\s-[a-zA-Z]|\s--[a-zA-Z-]+)|("[^"\\]*(?:\\.[^"\\]*)*")|('[\s\S]*?')/g;

    return curlStr.replace(curlRegex, (match, cmd, method, flag, dString, sString) => {
        if (cmd) {
            return cmd.replace("curl", `<span class="${styles.command}">curl</span>`);
        }
        if (method) return `<span class="${styles.method}">${method}</span>`;
        if (flag) return `<span class="${styles.flag}">${flag}</span>`;
        if (dString) return `<span class="${styles.string}">${dString}</span>`;
        if (sString) return `<span class="${styles.string}">${sString}</span>`;
        return match;
    });
  }, [data]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <pre 
        className={styles.container}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      <CopyButton value={data} />
    </div>
  );
}
