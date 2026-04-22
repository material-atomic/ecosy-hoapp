/* eslint-disable react-refresh/only-export-components */
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/tooltip";
import { IconLogin } from "@/icons/login";
import { IconLock } from "@/icons/lock";
import { IconGlobe } from "@/icons/globe";
import { Badge, type BadgeColor } from "@/components/badge";
import { useUrls } from "@/hooks/schema";
import { dispatch } from "@/store";
import { uiAction } from "@/store/ui";
import type { EndpointItem, AuthType } from "@/hooks/openapi";
import styles from "./sidebar.module.scss";

export const METHOD_COLORS: Record<string, BadgeColor> = {
  get: "blue",
  post: "green",
  put: "orange",
  delete: "red",
  patch: "purple"
};

export const AuthIcon = ({ type }: { type: AuthType }) => {
  let IconComponent = IconGlobe;
  let text = "Public Access";

  if (type === "basic") {
    IconComponent = IconLogin;
    text = "Basic Auth Required";
  } else if (type === "bearer") {
    IconComponent = IconLock ;
    text = "Bearer Token Required";
  }

  return (
    <Tooltip delay={300}>
      <TooltipTrigger asChild>
        <span className={styles.authIconWrapper}>
          <IconComponent size={14} className={styles.authIcon} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

export interface EndpointRowProps {
  ep: EndpointItem;
  label?: string; // Optional custom label to replace ep.path
  methodStyle?: "badge" | "text";
}

export function EndpointRow({ ep, label, methodStyle = "badge" }: EndpointRowProps) {
  const { selectedUrl } = useUrls();

  const handleItemClick = () => {
    if (!selectedUrl) return;
    const id = `${ep.method.toUpperCase()}|${ep.path}`;
    dispatch(uiAction.addOpeningItem(id, selectedUrl));
  };

  return (
    <div onClick={handleItemClick} data-method={ep.method} className={`${styles.apiItem} ${methodStyle === 'text' ? styles.apiItemFlat : ''}`}>
      <div className={styles.apiTarget}>
        {methodStyle === "text" && <AuthIcon type={ep.authType} />}
        {methodStyle === "text" ? (
          <span className={styles.methodText} data-method={ep.method.toLowerCase()}>
            {ep.method}
          </span>
        ) : (
          <Badge color={METHOD_COLORS[ep.method.toLowerCase()] || "gray"} className={styles.badge}>
            {ep.method}
          </Badge>
        )}
        {methodStyle !== "text" && <AuthIcon type={ep.authType} />}
        <span className={styles.apiPath} title={ep.path}>
          {label !== undefined ? label : ep.path}
        </span>
      </div>
      {ep.summary && label === undefined && (
        <span className={styles.apiSummary} title={ep.summary}>
          {ep.summary}
        </span>
      )}
    </div>
  );
}
