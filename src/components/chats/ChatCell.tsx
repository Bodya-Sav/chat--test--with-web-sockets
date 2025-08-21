import { type Chat } from "../../../service/api";
import styles from "../../styles/MainPage.module.css";

interface ChatCellProps {
  chat: Chat;
  active?: boolean;
  onClick?: () => void;
}

export default function ChatCell({ chat, active, onClick }: ChatCellProps) {
  return (
    <div
      className={`${styles.chatcell} ${active ? styles.activeChat : ""}`}
      onClick={onClick}
    >
      <div className={styles.avatar}>
        {chat.name?.[0]?.toUpperCase()}
      </div>
      {chat.name}
    </div>
  );
}