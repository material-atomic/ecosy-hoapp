import { dispatch, useSelector } from "../store";
import { uiAction } from "../store/ui";

export function useUrls() {
  const urls = useSelector((state) => state.schema.urls ?? []);
  const selectedUrl = useSelector((state) => state.ui.selectedUrl);

  const setSelectedUrl = (url: string) => dispatch(uiAction.setSelectedUrl(url));

  return { urls, selectedUrl, setSelectedUrl };
}