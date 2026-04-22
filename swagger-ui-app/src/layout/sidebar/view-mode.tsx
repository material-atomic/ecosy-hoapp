import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { IconTag } from "@/icons/tag";
import { IconTreeView } from "@/icons/tree-view";
import { dispatch, useSelector } from "@/store";
import { uiAction } from "@/store/ui";
import styles from "./sidebar.module.scss";

export function ViewMode() {
  const viewType = useSelector((state) => state.ui.sidebarViewType);

  return (
    <div className={styles.segmentControl}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={`${styles.segmentBtn} ${viewType === "tags" ? styles.segmentBtnActive : ""}`}
            onClick={() => dispatch(uiAction.setSidebarViewType("tags"))}
          >
            <IconTag size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span style={{ fontSize: "var(--fs-sm)" }}>Tags View</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={`${styles.segmentBtn} ${viewType === "tree" ? styles.segmentBtnActive : ""}`}
            onClick={() => dispatch(uiAction.setSidebarViewType("tree"))}
          >
            <IconTreeView size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span style={{ fontSize: "var(--fs-sm)" }}>Tree View</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
