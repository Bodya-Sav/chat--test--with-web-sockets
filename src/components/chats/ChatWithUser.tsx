import { useState, useEffect, useRef } from "react";
import { type Chat, Api, type Message as ApiMessage } from "../../../service/api";
import styles from "../../styles/MainPage.module.css";
import { SendHorizontal, ChevronDown } from "lucide-react";

interface ChatWithUserProps {
  chat: Chat;
}

export default function ChatWithUser({ chat }: ChatWithUserProps) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const limit = 250;
  const offsetRef = useRef(0);

  const localUser = localStorage.getItem("user");
  const parsedUser = localUser ? JSON.parse(localUser) : null;
  const localUserId = parsedUser?.user_id;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.length === 1 && inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        setInput((prev) => prev + e.key);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setMessages([]);
    offsetRef.current = 0;
    setHasMore(true);
    loadMessages();
  }, [chat.id]);

  const loadMessages = async () => {
    if (!hasMore || loading || !messagesContainerRef.current) return;

    setLoading(true);
    try {
      const container = messagesContainerRef.current;
      const scrollHeightBefore = container.scrollHeight;
      const scrollTopBefore = container.scrollTop;

      const data = await Api.getChatMessages(chat.id, limit, offsetRef.current);
      if (data.length < limit) setHasMore(false);
      offsetRef.current += data.length;

      setMessages((prev) => [...data, ...prev]);

      setTimeout(() => {
        const scrollHeightAfter = container.scrollHeight;
        container.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
      }, 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

    scrollToBottom();
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop < 50) loadMessages();

    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setShowScrollDown(!atBottom);
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatbar}>
        <div className={styles.avatar}>{chat.name?.[0]?.toUpperCase()}</div>
        <p className={styles.chatTitle}><strong>{chat.name}</strong></p>
      </div>

      <div
        ref={messagesContainerRef}
        className={styles.messages}
        style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", overflowY: "auto" }}
        onScroll={handleScroll}
      >
        {loading && <div className={styles.loader}>Загрузка...</div>}

        {messages.length > 0 ? (
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


      </div>

      {/** Кнопка скролла вниз */}
      <div
        style={{
          position: "absolute", // фиксируем относительно контейнера
          bottom: "10%",
          left: "60%",

          cursor: "pointer",
          background: "#fff",

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
          borderRadius: "50%",

          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 10,
          opacity: showScrollDown ? 1 : 0,
          transition: "opacity 0.3s ease", // анимация появления/исчезновения
        }}
        onClick={scrollToBottom}
      >
        <ChevronDown size={24} />
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