import { useState, useEffect, useRef } from "react";
import { type Chat, Api, type Message as ApiMessage } from "../../../service/api";
import styles from "../../styles/MainPage.module.css";
import { SendHorizontal, ChevronDown } from "lucide-react";
import { BASE_URL } from "../../consts/config";

interface ChatWithUserProps {
  chat: Chat;
}

export default function ChatWithUser({ chat }: ChatWithUserProps) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isTyping, setIsTyping] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const offsetRef = useRef(0);
  const limit = 50;
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isUnmountingRef = useRef(false);
  const stickToBottomRef = useRef(true);
  const typingTimeoutRef = useRef<number | null>(null);

  const localUser = localStorage.getItem("user");
  const parsedUser = localUser ? JSON.parse(localUser) : null;
  const localUserId = parsedUser?.user_id as string | undefined;
  const token = parsedUser?.token as string | undefined;

  const BOTTOM_GAP = 12;

  const isAtBottom = (el: HTMLElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_GAP;

  const scheduleScrollToBottom = (instant = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: instant ? "auto" : "smooth",
        });
      });
    });
  };

  const scrollToBottom = (instant = false) => {
    stickToBottomRef.current = true;
    scheduleScrollToBottom(instant);
    setNewMessagesCount(0);
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        try { wsRef.current.send(JSON.stringify({ type: 'disconnect' })); } catch { /* empty */ }
      }
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setWsStatus('disconnected');
  };

  const createWebSocket = () => {
    if (!chat.id || !token || isUnmountingRef.current) return;
    closeWebSocket();
    setWsStatus('connecting');

    const ws = new WebSocket(`${BASE_URL}/ws?token=${token}&chat_id=${chat.id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isUnmountingRef.current) { ws.close(1000, 'Component unmounting'); return; }
      setWsStatus('connected');
    };

    ws.onclose = (event) => {
      setWsStatus('disconnected');
      if (!isUnmountingRef.current && event.code !== 1000 && event.code !== 1001) {
        reconnectTimeoutRef.current = setTimeout(() => { if (!isUnmountingRef.current) createWebSocket(); }, 3000) as unknown as number;
      }
    };

    ws.onerror = () => { setWsStatus('disconnected'); };

    ws.onmessage = (event) => {
      if (isUnmountingRef.current) return;
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'message') {
          const container = messagesContainerRef.current;
          const wasAtBottom = container ? isAtBottom(container) : true;
          const isMine = localUserId ? msg.user_id === localUserId : false;

          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);

          if (wasAtBottom || isMine || stickToBottomRef.current) {
            stickToBottomRef.current = true;
            scheduleScrollToBottom();
          } else {
            setNewMessagesCount((c) => c + 1);
          }

          setIsTyping(false);
        }

        if (msg.type === 'typing' && msg.user_id !== localUserId) {
          setIsTyping(msg.isTyping);
        }

      } catch (error) { console.error("WS parse error:", error); }
    };
  };

  /** Фокус на input при печати */
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

  /** Подгрузка старых сообщений */
  const loadMessages = async () => {
    if (!hasMore || loading || !messagesContainerRef.current) return;
    setLoading(true);
    try {
      const container = messagesContainerRef.current!;
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  /** Первичная загрузка + WebSocket */
  useEffect(() => {
    if (!chat.id || !token) return;
    isUnmountingRef.current = false;
    setMessages([]); setNewMessagesCount(0); offsetRef.current = 0; setHasMore(true); stickToBottomRef.current = true;
    (async () => { await loadMessages(); scrollToBottom(true); })();
    createWebSocket();
    return () => { isUnmountingRef.current = true; closeWebSocket(); };
  }, [chat.id, token]);

  useEffect(() => {
    if (stickToBottomRef.current) scheduleScrollToBottom();
  }, [messages.length]);

  /** Отправка сообщений через WebSocket */
  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    stickToBottomRef.current = true;
    wsRef.current.send(JSON.stringify({ type: 'message', content: input }));
    setInput("");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', isTyping: false }));
    }
  };

  /** Отправка события "печатает" с автоотключением через 1 секунду */
  const handleInputChange = (value: string) => {
    setInput(value);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', isTyping: value.length > 0 }));
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (value.length > 0) {
      typingTimeoutRef.current = window.setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'typing', isTyping: false }));
        }
      }, 1000);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 50) loadMessages();
    const atBottom = isAtBottom(container);
    stickToBottomRef.current = atBottom;
    setShowScrollDown(!atBottom);
    if (atBottom) setNewMessagesCount(0);
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatbar}>
        <div className={styles.avatar}>{chat.name?.[0]?.toUpperCase()}</div>
        <p className={styles.chatTitle}>
          <strong>{chat.name}</strong>
          {isTyping && (
            <span className={styles.typingIndicator}>
              печатает
              <span className={styles.dot}>.</span>
              <span className={styles.dot}>.</span>
              <span className={styles.dot}>.</span>
            </span>
          )}
          {wsStatus === 'connecting' && <span style={{ color: '#ffa500', fontSize: '12px', marginLeft: '8px' }}>подключение...</span>}
          {wsStatus === 'disconnected' && <span style={{ color: '#ff4444', fontSize: '12px', marginLeft: '8px' }}>нет связи</span>}
        </p>
      </div>

      <div
        ref={messagesContainerRef}
        className={styles.messages}
        style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", overflowY: "auto" }}
        onScroll={handleScroll}
      >
        {loading && <div className={styles.loader}>Загрузка...</div>}

        {messages.length > 0 ? (
          messages
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((m) => {
              const isMine = localUserId ? m.user_id === localUserId : false;
              return (
                <div key={m.id} className={`${styles.message} ${isMine ? styles.myMessage : styles.otherMessage}`}>
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

      {newMessagesCount > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#007bff",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 10,
            userSelect: "none",
          }}
          onClick={() => scrollToBottom()}
          title="Показать новые сообщения"
        >
          Новые сообщения ({newMessagesCount})
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "65%",
          transform: "translateX(-50%)",
          cursor: "pointer",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 10,
          opacity: showScrollDown ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        onClick={() => scrollToBottom()}
        title="Вниз"
      >
        <ChevronDown size={24} />
      </div>

      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          className={styles.messageInput}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={wsStatus === 'connected' ? "Сообщение" : "Подключение..."}
          disabled={wsStatus !== 'connected'}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={wsStatus !== 'connected' || !input.trim()}
        >
          <SendHorizontal size={24} />
        </button>
      </div>
    </div>
  );
}