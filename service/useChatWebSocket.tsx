import { useEffect, useRef } from "react";
import { BASE_URL } from "../src/consts/config";
import { type Message as ApiMessage } from "../service/api";

interface Options {
  reconnectInterval?: number; // через сколько мс пробовать переподключение
  maxReconnectAttempts?: number; // максимум попыток
}

export function useChatWebSocket(
  chatId: string,
  token: string,
  onMessage: (msg: ApiMessage) => void,
  { reconnectInterval = 3000, maxReconnectAttempts = 10 }: Options = {}
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!chatId || !token) return;

    function connect() {
      // если уже есть сокет — не пересоздаём
      if (wsRef.current) return;

      const ws = new WebSocket(
        `${BASE_URL.replace("http", "ws")}/ws?chat_id=${chatId}&token=${token}`
      );

      ws.onopen = () => {
        console.log("✅ WS OPEN", chatId);
        reconnectAttempts.current = 0; // сброс попыток
      };

      ws.onclose = () => {
        console.log("❌ WS CLOSED", chatId);
        wsRef.current = null;

        // автореконнект, если не превышен лимит
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          setTimeout(connect, reconnectInterval);
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("📩 WS MESSAGE", msg);
          onMessage(msg);
        } catch (e) {
          console.error("Ошибка парсинга WS", e);
        }
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      console.log("🔌 CLEANUP WS", chatId);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [chatId, token, onMessage, reconnectInterval, maxReconnectAttempts]);

  return wsRef;
}