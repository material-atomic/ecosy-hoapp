import { useOpenApi } from "@/hooks/openapi";
import { useUrls } from "@/hooks/schema";
import { AuthBasicDialog } from "../auth/auth-basic-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { DialogTrigger } from "@/components/dialog";
import { ButtonIcon } from "@/components/button-icon";
import { IconLogin } from "@/icons/login";

export function Basic() {
  const { selectedUrl } = useUrls();
  const openApi = useOpenApi(selectedUrl);

  const securitySchemes = openApi?.components?.securitySchemes;
  
  const hasBasicAuth = securitySchemes 
    ? Object.values(securitySchemes).some((s) => s.type === "http" && s.scheme === "basic")
    : false;

  if (!hasBasicAuth) {
    return null;
  }

  return (
    <AuthBasicDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <ButtonIcon>
              <IconLogin />
            </ButtonIcon>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span style={{ fontSize: "var(--fs-sm)" }}>Basic authorize setup</span>
        </TooltipContent>
      </Tooltip>
    </AuthBasicDialog>
  );
}
