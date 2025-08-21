import { useState, useEffect, useRef } from "react";
import { type Chat, Api, type Message as ApiMessage } from "../../../service/api";
import styles from "../../styles/MainPage.module.css";
import { SendHorizontal } from "lucide-react";

interface ChatWithUserProps {
  chat: Chat;
}

export default function ChatWithUser({ chat }: ChatWithUserProps) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Получаем user из localStorage и парсим
  const localUser = localStorage.getItem("user");
  const parsedUser = localUser ? JSON.parse(localUser) : null;
  const localUserId = parsedUser?.user_id;

  // Загрузка сообщений с сервера при смене чата
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await Api.getChatMessages(chat.id);
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };
    loadMessages();
  }, [chat.id]);

  const handleSend = () => {
    if (!input.trim() || !localUserId) return;

    const newMsg: ApiMessage = {
      id: Date.now().toString(),
      chat_id: chat.id,
      user_id: localUserId,
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  // Фокус на input при любой печати
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.length === 1 && inputRef.current) {
        if (document.activeElement !== inputRef.current) {
          inputRef.current.focus();
          setInput((prev) => prev + e.key);
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatbar}>
        <div className={styles.avatar}>{chat.name?.[0]?.toUpperCase()}</div>
        <p className={styles.chatTitle}><strong>{chat.name}</strong></p>
      </div>

      <div className={styles.messages} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages && messages.length > 0 ? (
          [...messages]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((m) => {
              const isMine = localUserId ? m.user_id === localUserId : false;
              return (
                <div
                  key={m.id}
                  className={`${styles.message} ${isMine ? styles.myMessage : styles.otherMessage}`}
                >
                  <div className={styles.bubble}>
                    {m.content}
                    <span className={styles.time}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
        ) : (
          <p className={styles.emptyMessages}>Сообщений пока нет</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          className={styles.messageInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Сообщение"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className={styles.sendBtn} onClick={handleSend}>
          <SendHorizontal size={24} />
        </button>
      </div>
    </div>
  );
}