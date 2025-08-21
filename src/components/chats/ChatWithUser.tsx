import { useState, useEffect, useRef } from "react";
import { type Chat } from "../../../service/api";
import styles from "../../styles/MainPage.module.css";
import { SendHorizontal } from "lucide-react";

interface ChatWithUserProps {
  chat: Chat;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  created_at: string;
}

export default function ChatWithUser({ chat }: ChatWithUserProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "Вы",
      text: input,
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

  // Скролл к последнему сообщению при изменении messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatbar}>
        <div className={styles.avatar}>{chat.name?.[0]?.toUpperCase()}</div>
        <p className={styles.chatTitle}><strong>{chat.name}</strong></p>
      </div>

      <div className={styles.messages}>
        {messages.length > 0 ? (
          messages.map((m) => {
            const isMine = m.sender === "Вы";
            return (
              <div
                key={m.id}
                className={`${styles.message} ${isMine ? styles.myMessage : styles.otherMessage}`}
              >
                {!isMine && <div className={styles.senderName}>{m.sender}</div>}
                <div className={styles.bubble}>
                  {m.text}
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
        {/* Пустой div для скролла к концу */}
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