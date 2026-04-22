import { useGroupedEndpoints } from "@/hooks/openapi";
import { EndpointGroup } from "./endpoint-group";
import styles from "./sidebar.module.scss";

export function EndpointList() {
  const groupedEndpoints = useGroupedEndpoints();

  return (
    <div className={styles.content}>
      {groupedEndpoints.map((group) => (
        <EndpointGroup key={group.tag} {...group} />
      ))}
    </div>
  );
}