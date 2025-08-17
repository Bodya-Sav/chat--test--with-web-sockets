import { useState } from "react";
import { motion } from "framer-motion";
import { Api } from "../../service/api";
import { useUser } from "../context/useUser";
import { useNavigate } from "react-router-dom";
import styles from "../styles/MainPage.module.css";

// Пример локальных пользователей и чатов
const users = [
  { id: 1, name: "Иван Иванов" },
  { id: 2, name: "Мария Петрова" },
  { id: 3, name: "Алексей Смирнов" },
];

const initialChats: { id: number; userId: number; messages: string[] }[] = [];

export default function MainPage() {
  const [chats, setChats] = useState(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const handleLogout = () => {
    Api.logout();       // очищаем токен и user из localStorage
    setUser(null);      // сбрасываем контекст
    navigate("/auth", { replace: true });
  };

  const handleCreateChat = (userId: number) => {
    const newChat = {
      id: Date.now(),
      userId,
      messages: [],
    };
    setChats([...chats, newChat]);
    setSelectedChatId(newChat.id);
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const selectedUser =
    selectedChat && users.find((u) => u.id === selectedChat.userId);

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={styles.container}>
        {/* Левая секция: список чатов и создание */}
        <div className={styles.sidebar}>
          <p>
            Вы вошли как: <strong>{user?.username || "unknown"}</strong>
          </p>
          <h3>Чаты</h3>
          {chats.length === 0 ? (
            <div className={styles.empty}>
              <div>Нет чатов</div>
              <div className={styles.createBlock}>
                <span>Создать чат с:</span>
                {users.map((user) => (
                  <button
                    key={user.id}
                    className={styles.createBtn}
                    onClick={() => handleCreateChat(user.id)}
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className={styles.chatList}>
              {chats.map((chat) => {
                const user = users.find((u) => u.id === chat.userId);
                return (
                  <li
                    key={chat.id}
                    className={
                      chat.id === selectedChatId
                        ? styles.chatItemActive
                        : styles.chatItem
                    }
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    {user?.name || "Пользователь"}
                  </li>
                );
              })}
            </ul>
          )}
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
        {/* Правая секция: чат */}
        <div className={styles.chatSection}>
          {!selectedChat ? (
            <div className={styles.placeholder}>
              Выберите чат слева или создайте новый
            </div>
          ) : (
            <div>
              <h3>Чат с {selectedUser?.name}</h3>
              <div className={styles.messages}>
                {selectedChat.messages.length === 0 ? (
                  <div className={styles.placeholder}>Нет сообщений</div>
                ) : (
                  selectedChat.messages.map((msg, idx) => (
                    <div key={idx} className={styles.message}>
                      {msg}
                    </div>
                  ))
                )}
              </div>
              {/* Форма отправки сообщения */}
              <ChatInput
                onSend={(text) => {
                  setChats((prev) =>
                    prev.map((chat) =>
                      chat.id === selectedChat.id
                        ? {
                          ...chat,
                          messages: [...chat.messages, text],
                        }
                        : chat
                    )
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Компонент ввода сообщения
function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className={styles.inputForm}
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) {
          onSend(text);
          setText("");
        }
      }}
    >
      <input
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите сообщение..."
      />
      <button className={styles.button} type="submit">
        Отправить
      </button>
    </form>
  );
}