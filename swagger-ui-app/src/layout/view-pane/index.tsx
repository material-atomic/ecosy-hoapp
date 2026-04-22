import { useSelector } from "@/store";
import { useUrls } from "@/hooks/schema";
import { EditorTabs } from "./editor-tabs";
import { RequestContent } from "./request-content";
import styles from "./view-pane.module.scss";

export function ViewPane() {
  const { selectedUrl } = useUrls();
  const activeItems = useSelector(state => state.ui.activeItems);
  const openingItems = useSelector(state => state.ui.openingItems);
  
  if (!selectedUrl) return null;

  const currentItems = openingItems[selectedUrl] || [];
  const activeItem = activeItems[selectedUrl];
  
  if (currentItems.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.emptyPane}>
          Select an endpoint from the sidebar to open a tab
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.root}>
      <EditorTabs items={currentItems} activeItem={activeItem} selectedUrl={selectedUrl} />
      <RequestContent activeItem={activeItem} selectedUrl={selectedUrl} />
    </div>
  );
}
