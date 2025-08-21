import { type Chat } from "../../../service/api";
import styles from "../../styles/MainPage.module.css";
import ChatCell from "./ChatCell";


interface ListOfChatsProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectUser: (chat: Chat) => void;
}

export default function ListOfChats({ chats, selectedChatId, onSelectUser }: ListOfChatsProps) {
  return (
    <div style={{ width: '100%' }}>
      <section className={styles.userList}>
        {chats.map((chat) => (
          <ChatCell
            key={chat.id}
            chat={chat}
            active={chat.id === selectedChatId} // передаем активность
            onClick={() => onSelectUser(chat)}
          />
        ))}
      </section>
    </div>
  );
}