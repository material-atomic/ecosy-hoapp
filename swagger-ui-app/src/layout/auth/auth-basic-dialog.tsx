/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, type PropsWithChildren } from "react";
import { Dialog, DialogContent, useDialog } from "@/components/dialog";
import { useDispatch, useSelector } from "@/store";
import { authActions } from "@/store/auth";
import { AuthBasicForm } from "./auth-basic-form";
import { Button } from "@/components/button";

function DialogInner() {
  const dispatch = useDispatch();
  const savedAuth = useSelector((state) => state.auth.basic);
  const { actions: dialogActions } = useDialog();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setUsername(savedAuth.username || "");
    setPassword(savedAuth.password || "");
  }, [savedAuth]);

  const handleSave = () => {
    dispatch(authActions.setBasicAuth({ username, password }));
    dialogActions.close();
  };

  return (
    <DialogContent style={{ width: 400, padding: 24 }}>
      <AuthBasicForm 
        username={username} 
        password={password} 
        onChange={({ username, password }) => {
          setUsername(username || "");
          setPassword(password || "");
        }} 
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--spacing-2)" }}>
        <Button variant="solid" onClick={handleSave}>Save</Button>
      </div>
    </DialogContent>
  );
}

export function AuthBasicDialog({ children }: PropsWithChildren) {
  return (
    <Dialog>
      {children}
      <DialogInner />
    </Dialog>
  );
}
