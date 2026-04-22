import { ButtonIcon } from "@/components/button-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { IconDownload } from "@/icons/download";
import { useUrls } from "@/hooks/schema";
import { useOpenApi } from "@/hooks/openapi";

export function DownloadOpenApi() {
  const { selectedUrl } = useUrls();
  const openApi = useOpenApi(selectedUrl);

  const handleDownload = () => {
    if (!openApi) return;
    
    const jsonString = JSON.stringify(openApi, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    const fileName = openApi.info?.title 
      ? `${openApi.info.title.toLowerCase().replace(/\\s+/g, '-')}-openapi.json`
      : "openapi.json";
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ButtonIcon onClick={handleDownload} disabled={!openApi}>
          <IconDownload />
        </ButtonIcon>
      </TooltipTrigger>
      <TooltipContent>
        <span style={{ fontSize: "var(--fs-sm)" }}>
          Download openapi.json
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
