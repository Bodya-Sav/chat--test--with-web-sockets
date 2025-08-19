import { useEffect, useRef, useState } from "react";
import { Api, type Chat } from "../../service/api";
import { BASE_URL } from "../consts/config";
import styles from "../styles/MainPage.module.css";

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
  const wsRef = useRef<WebSocket | null>(null);

  // Загружаем историю сообщений + подключаем WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;

    const loadMessages = async () => {
      try {
        const data = await Api.getChatMessages(chat.id);
        setMessages(data || []);
      } catch (err) {
        console.error("Ошибка загрузки сообщений", err);
        setMessages([]);
      }
    };

    loadMessages();

    // Подключение WS
    const token = Api.getToken();
    ws = new WebSocket(
      `${BASE_URL.replace("http", "ws")}/ws?token=${token}&chat_id=${chat.id}`
    );

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        console.error("Ошибка парсинга WS сообщения:", e);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket closed");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsRef.current = ws;

    return () => {
      ws?.close();
    };
  }, [chat.id]);

  const handleSend = () => {
    if (!input.trim() || !wsRef.current) return;
    const newMsg = {
      text: input,
    };

    wsRef.current.send(JSON.stringify(newMsg));
    setInput("");
  };

  return (
    <div className={styles.chatWindow}>
      <h3 className={styles.chatTitle}>Чат с {chat.name}</h3>
      <div className={styles.messages}>
        {messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className={styles.message}>
              <strong>{m.sender}: </strong>
              {m.text}
            </div>
          ))
        ) : (
          <p className={styles.emptyMessages}>Сообщений пока нет</p>
        )}
      </div>
      <div className={styles.inputArea}>
        <input
          className={styles.messageInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напишите сообщение..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className={styles.sendBtn} onClick={handleSend}>
          Отправить
        </button>
      </div>
    </div>
  );
}