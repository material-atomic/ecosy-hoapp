import { useUrls } from "@/hooks/schema";
import { IconHandFingerLeft } from "@/icons/hand-finger-left";
import styles from "./appbar.module.scss";
import { IconGlobe } from "@/icons/globe";

export function SelectedURL() {
  const { selectedUrl } = useUrls();

  const Icon = selectedUrl ? IconGlobe : IconHandFingerLeft;
  const text = selectedUrl || "Select URL";

  return (
    <span className={styles.selectedURL}>
      <Icon size={14} />
      {text}
    </span>
  );
}