import styles from "./auth.module.scss";

export interface AuthBasicFormProps {
  username?: string;
  password?: string;
  onChange: (data: { username?: string; password?: string }) => void;
}

export function AuthBasicForm({ username = "", password = "", onChange }: AuthBasicFormProps) {
  return (
    <div className={styles.authForm}>
      <h5 className={styles.authTitle}>Basic Auth</h5>
      <div className={styles.authFieldGroup}>
        <div className={styles.authField}>
          <div className={styles.authLabel}>Username</div>
          <input 
            type="text" 
            className={styles.authInput} 
            placeholder="Enter username" 
            value={username}
            onChange={(e) => onChange({ username: e.target.value, password })}
          />
        </div>
        <div className={styles.authField}>
          <div className={styles.authLabel}>Password</div>
          <input 
            type="password" 
            className={styles.authInput} 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => onChange({ username, password: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
