import { useOpenApi } from "@/hooks/openapi";
import { useUrls } from "@/hooks/schema";
import { AuthBearerDialog } from "../auth/auth-bearer-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { DialogTrigger } from "@/components/dialog";
import { ButtonIcon } from "@/components/button-icon";
import { IconLock } from "@/icons/lock";

export function Bearer() {
  const { selectedUrl } = useUrls();
  const openApi = useOpenApi(selectedUrl);

  const securitySchemes = openApi?.components?.securitySchemes;

  const hasBearerAuth = securitySchemes
    ? Object.values(securitySchemes).some((s) => s.type === "http" && s.scheme === "bearer")
    : false;

  if (!hasBearerAuth) {
    return null;
  }

  return (
    <AuthBearerDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <ButtonIcon>
              <IconLock />
            </ButtonIcon>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span style={{ fontSize: "var(--fs-sm)" }}>Bearer authorize setup</span>
        </TooltipContent>
      </Tooltip>
    </AuthBearerDialog>
  );
}
