import { type User } from "../../service/api";
import styles from "../styles/MainPage.module.css";

interface UserCellProps {
  user: User;
  onClick?: () => void;
}

export default function UserCell({ user, onClick }: UserCellProps) {
  return (
    <div className={styles.chatcell} onClick={onClick}>
      <div className={styles.avatar}>
        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
      </div>
      {user.name || user.email}
    </div>
  );
}