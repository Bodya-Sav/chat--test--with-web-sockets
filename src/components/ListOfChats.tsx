import { type Chat } from "../../service/api";
import styles from "../styles/MainPage.module.css";
import ChatCell from "./ChatCell";

interface ListOfChatsProps {
  chats: Chat[];
  onSelectUser: (chat: Chat) => void;
}

export default function ListOfChats({ chats, onSelectUser }: ListOfChatsProps) {
  return (
    <div style={{ width: '100%' }}>
      <h4 className={styles.sectionTitle}>Выберите чат</h4>
      <section className={styles.userList}>
        {chats.map((chat) => (
          <ChatCell key={chat.id} chat={chat} onClick={() => onSelectUser(chat)} />
        ))}
      </section>
    </div>
  );
}