/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, type PropsWithChildren } from "react";
import { Dialog, DialogContent, useDialog } from "@/components/dialog";
import { useDispatch, useSelector } from "@/store";
import { authActions } from "@/store/auth";
import { AuthBearerForm } from "./auth-bearer-form";
import { Button } from "@/components/button";

function DialogInner() {
  const dispatch = useDispatch();
  const savedAuth = useSelector((state) => state.auth.bearer);
  const { actions: dialogActions } = useDialog();

  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(savedAuth.token || "");
  }, [savedAuth]);

  const handleSave = () => {
    dispatch(authActions.setBearerAuth({ token }));
    dialogActions.close();
  };

  return (
    <DialogContent style={{ width: 400, padding: 24 }}>
      <AuthBearerForm token={token} onChange={setToken} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--spacing-2)" }}>
        <Button variant="solid" onClick={handleSave}>Save</Button>
      </div>
    </DialogContent>
  );
}

export function AuthBearerDialog({ children }: PropsWithChildren) {
  return (
    <Dialog>
      {children}
      <DialogInner />
    </Dialog>
  );
}
