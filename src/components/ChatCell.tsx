import { type Chat } from "../../service/api";
import styles from "../styles/MainPage.module.css";

interface ChatCellProps {
  chat: Chat;
  onClick?: () => void;
}

export default function ChatCell({ chat, onClick }: ChatCellProps) {
  return (
    <div className={styles.chatcell} onClick={onClick}>
      <div className={styles.avatar}>
        {chat.name?.[0]?.toUpperCase()}
      </div>
      {chat.name}
    </div>
  );
}