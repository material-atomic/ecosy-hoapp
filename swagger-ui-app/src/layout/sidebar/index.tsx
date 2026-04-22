import { SidebarHeader } from "./header";
import { EndpointList } from "./endpoint-list";
import { EndpointTree } from "./endpoint-tree";
import { useSelector } from "@/store";
import styles from "./sidebar.module.scss";

export function Sidebar() {
  const sidebarViewType = useSelector((state) => state.ui.sidebarViewType);

  return (
    <div className={styles.root}>
      <SidebarHeader />
      {sidebarViewType === "tree" ? <EndpointTree /> : <EndpointList />}
    </div>
  );
}