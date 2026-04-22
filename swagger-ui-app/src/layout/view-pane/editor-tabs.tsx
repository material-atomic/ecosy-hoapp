import { useEffect, useRef } from "react";
import { dispatch } from "@/store";
import { uiAction, type BaseURL } from "@/store/ui";
import { IconX } from "@/icons/x";
import styles from "./view-pane.module.scss";

export interface EditorTabsProps {
  items: string[];
  activeItem?: string;
  selectedUrl: BaseURL;
}

export function EditorTabs({ items, activeItem, selectedUrl }: EditorTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItem && containerRef.current) {
      const activeTab = containerRef.current.querySelector('[data-active="true"]');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [activeItem]);

  if (!items || items.length === 0) return null;

  const handleSelect = (id: string) => {
    dispatch(uiAction.setActiveItem(id, selectedUrl));
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(uiAction.removeOpeningItem(id, selectedUrl));
  };

  return (
    <div ref={containerRef} className={styles.tabsContainer}>
      {items.map((id) => {
        const [method, path] = id.split("|");
        const isActive = id === activeItem;

        return (
          <div
            key={id}
            className={styles.tab}
            data-active={isActive}
            onClick={() => handleSelect(id)}
          >
            <span className={styles.tabMethod} data-method={method}>
              {method}
            </span>
            <span className={styles.tabPath}>{path}</span>
            <span
              className={styles.tabClose}
              onClick={(e) => handleClose(e, id)}
            >
              <IconX size={14} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
