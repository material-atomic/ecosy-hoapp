import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/collapsible";
import { IconChevronDown } from "@/icons/chevron-down";
import type { EndpointItem } from "@/hooks/openapi";
import { EndpointRow } from "./endpoint-row";
import styles from "./sidebar.module.scss";

export interface EndpointGroupProps {
  tag: string;
  endpoints: EndpointItem[];
}

export function EndpointGroup(props: EndpointGroupProps) {
  const { tag, endpoints } = props;

  return (
    <Collapsible defaultOpen className={styles.group}>
      <CollapsibleTrigger className={styles.groupTrigger}>
        <IconChevronDown size={14} />
        <span>{tag}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={styles.groupContent}>
          {endpoints.map((ep, i) => (
            <EndpointRow key={`${ep.method}-${ep.path}-${i}`} ep={ep} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}