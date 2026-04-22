import { Bearer } from "./bearer";
import { Basic } from "./basic";
import { ViewMode } from "./view-mode";
import { DownloadOpenApi } from "./download-openapi";
import styles from "./sidebar.module.scss";

export function SidebarHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <ViewMode />
      </div>
      <div className={styles.headerRight}>
        <DownloadOpenApi />
        <Basic />
        <Bearer />
      </div>
    </div>
  );
}