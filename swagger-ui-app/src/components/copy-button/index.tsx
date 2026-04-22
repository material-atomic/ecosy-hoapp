import { useState } from "react";
import { IconCopy } from "@/icons/copy";
import { IconCheck } from "@/icons/check";
import styles from "./copy-button.module.scss";

export interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      className={`${styles.copyButton} ${className}`} 
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? <IconCheck size={14} className={styles.successIcon} /> : <IconCopy size={14} />}
    </button>
  );
}
