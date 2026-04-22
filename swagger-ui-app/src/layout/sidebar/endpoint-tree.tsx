import { useTreeEndpoints, type TreeNode } from "@/hooks/openapi";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/collapsible";
import { IconChevronDown } from "@/icons/chevron-down";
import { IconFolder } from "@/icons/folder";
import { IconFile } from "@/icons/file";
import { EndpointRow } from "./endpoint-row";
import styles from "./sidebar.module.scss";

interface TreeNodeItemProps {
  node: TreeNode;
  level?: number;
}

function TreeNodeItem({ node, level = 0 }: TreeNodeItemProps) {
  const hasChildren = node.children.length > 0;
  const hasEndpoints = node.endpoints.length > 0;
  
  if (!hasChildren && !hasEndpoints) return null;

  const isDeepestLevel = node.children.length === 0;

  return (
    <Collapsible defaultOpen={level < 1} className={styles.treeNode}>
      <CollapsibleTrigger className={styles.treeTrigger} style={{ paddingLeft: `calc(var(--spacing-2) + ${level * 16}px)` }}>
        <IconChevronDown size={14} className={styles.treeChevron} />
        {isDeepestLevel ? (
          <IconFile size={14} style={{ color: "#3b82f6" }} />
        ) : (
          <IconFolder size={14} style={{ color: "#eab308" }} />
        )}
        <span className={styles.treeNodeName}>{node.name}</span>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className={styles.treeContent}>
          <div 
            className={styles.treeGuideLine} 
            style={{ left: `calc(var(--spacing-2) + 7px + ${level * 16}px)` }} 
          />
          {node.endpoints.map((ep, i) => (
            <div key={`${ep.method}-${ep.path}-${i}`} style={{ paddingLeft: `calc(var(--spacing-4) + ${(level + 2) * 16}px)` }}>
              <EndpointRow ep={ep} label={ep.summary || "..."} methodStyle="text" />
            </div>
          ))}
          {node.children.map((childNode) => (
            <TreeNodeItem key={childNode.fullPath} node={childNode} level={level + 1} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function EndpointTree() {
  const tree = useTreeEndpoints();

  return (
    <div className={styles.content}>
      {tree.map(node => (
        <TreeNodeItem key={node.fullPath} node={node} />
      ))}
    </div>
  );
}
