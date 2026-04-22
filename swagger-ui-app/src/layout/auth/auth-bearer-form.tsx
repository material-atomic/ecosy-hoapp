import styles from "./auth.module.scss";

export interface AuthBearerFormProps {
  token: string;
  onChange: (token: string) => void;
}

export function AuthBearerForm({ token, onChange }: AuthBearerFormProps) {
  return (
    <div className={styles.authForm}>
      <h5 className={styles.authTitle}>Bearer Token</h5>
      <div className={styles.authFieldGroup}>
        <div className={styles.authField}>
          <div className={styles.authLabel}>Token</div>
          <input 
            type="text" 
            className={styles.authInput} 
            placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6..." 
            value={token}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
