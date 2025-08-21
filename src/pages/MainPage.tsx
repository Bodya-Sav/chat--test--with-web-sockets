import { motion } from "framer-motion";
import { Api, type User, type Chat } from "../../service/api";
import { useUser } from "../context/useUser";
import { useNavigate } from "react-router-dom";
import styles from "../styles/MainPage.module.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ListOfUsers from "../components/users/ListOfUsers";
import ChatWithUser from "../components/chats/ChatWithUser";
import ListOfChats from "../components/chats/ListOfChats";
import { MessageCirclePlus } from "lucide-react";
import CustomDropdownMenu from "../components/CustomDropdownMenu";

export default function MainPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [hovered, setHovered] = useState(false);
  const [showList, setShowList] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await Api.getUsers();
        setUsers(data);
      } catch {
        toast.error("Не удалось загрузить пользователей");
      }
    };

    const loadChats = async () => {
      try {
        const data = await Api.getChats();

        const normalized = (Array.isArray(data) ? data : []).map((chat) => {
          if (user) {
            if (chat.members?.length === 2) {
              const other = chat.members.find((m) => m.id !== user.id);
              return {
                ...chat,
                name: other?.name || "Неизвестный пользователь",
              };
            }
            // групповой чат → оставляем оригинальное название
            return chat;
          }
          return chat;
        });

        setChats(normalized);
      } catch {
        toast.error("Не удалось загрузить чаты");
        setChats([]);
      }
    };

    loadUsers();
    loadChats();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedChat(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSelectUser = async (u: User) => {
    try {
      // ищем чат с этим пользователем
      const existingChat = chats.find((chat) =>
        chat.members?.some((m) => m.id === u.id)
      );

      if (existingChat) {
        // если уже есть → просто открываем
        setSelectedChat(existingChat);
        toast.info(`Чат с ${u.name || u.email} уже существует`);
        setShowList(false);
        return;
      }

      // если чата нет → создаём
      const newChat = await Api.createNewChatWithUser(u.name!, u.id!);
      toast.success(`Чат с ${u.name || u.email} создан`);
      setChats((prev) => [...prev, newChat]);
      setSelectedChat(newChat); // сразу открываем новый
      setShowList(false);
    } catch {
      toast.error("Не удалось создать чат");
    }
  };

  const handleCreateChat = () => setShowList(true);

  const handleLogout = () => {
    Api.logout();
    setUser(null);
    navigate("/auth", { replace: true });
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={styles.container}>
        <div
          className={styles.sidebar}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className={styles.sidebartop}>
            <CustomDropdownMenu onLogout={handleLogout} />
            <p className={styles.username}>
              <strong>{user?.name}</strong>
            </p>
          </div>

          {showList ? (
            <ListOfUsers
              users={users}
              onClose={() => setShowList(false)}
              onSelectUser={handleSelectUser}
            />
          ) : (
            <div className={styles.chatscontainer}>
              {chats.length > 0 ? (
                <ListOfChats
                  chats={chats}
                  selectedChatId={selectedChat?.id} // передаем id выбранного чата
                  onSelectUser={(chat) => setSelectedChat(chat)}
                />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <p>чатов еще нет</p>
                </div>
              )}
            </div>
          )}

          {!showList && (
            <div className={styles.sidebarBottom}>
              <motion.button
                className={styles.addChatFab}
                onClick={handleCreateChat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  hovered
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={{ duration: 0.3 }}
              >
                <MessageCirclePlus />
              </motion.button>
            </div>
          )}

        </div>

        <div className={styles.chatSection}>
          {selectedChat ? (
            <ChatWithUser chat={selectedChat} />
          ) : (
            <p>Выберите чат слева</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}