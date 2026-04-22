import { IconApp } from "@/icons/app";
import { Dropdown, DropdownTrigger, DropdownMenu } from "@/components/dropdown";
import { SelectedURL } from "./selected-url";
import { SpanIcon } from "@/components/button-icon";
import { Button } from "@/components/button";
import styles from "./appbar.module.scss";
import { MenuURL } from "./menu-url";
import { ThemeToggle } from "./theme-toggle";
import { useUrls } from "@/hooks/schema";
import { useOpenApi } from "@/hooks/openapi";
import { IconChevronDown } from "@/icons/chevron-down";
import { MarkdownViewer } from "@/components/markdown-viewer";

export function AppBar() {
  const { selectedUrl } = useUrls();
  const openApiData = useOpenApi(selectedUrl);
  
  return (
    <div className={`glassmorphism ${styles.container}`}>
      <div className={styles.appbarLeft}>
        <Dropdown>
          <DropdownTrigger asChild>
            <Button className={styles.anchor}>
              <SpanIcon variant="solid">
                <IconApp size={16} />
              </SpanIcon>
              <SelectedURL />
            </Button>
          </DropdownTrigger>
          <MenuURL />
        </Dropdown>
        {openApiData?.openapi && (
          <span className={styles.versionBadge}>OAS {openApiData.openapi}</span>
        )}
      </div>
      <div className={styles.appbarRight}>
        {openApiData?.info?.title && (
          <Dropdown>
            <DropdownTrigger asChild>
              <button className={styles.projectTitleDropdown}>
                <span className={styles.projectTitle}>{openApiData.info.title}</span>
                <IconChevronDown size={14} className={styles.titleChevron} />
              </button>
            </DropdownTrigger>
            <DropdownMenu align="right" className={styles.titleDropdownMenu}>
              <div className={styles.titleDropdownContent}>
                <h4 className={styles.descTitle}>About the API</h4>
                {openApiData.info.description ? (
                  <MarkdownViewer content={openApiData.info.description} />
                ) : (
                  <p className={styles.mutedText}>No description provided.</p>
                )}
              </div>
            </DropdownMenu>
          </Dropdown>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}