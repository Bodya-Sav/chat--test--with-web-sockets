import { motion } from "framer-motion";
import { Api, type User, type Chat } from "../../service/api";
import { useUser } from "../context/useUser";
import { useNavigate } from "react-router-dom";
import styles from "../styles/MainPage.module.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ListOfUsers from "../components/ListOfUsers";
import ChatWithUser from "../components/ChatWithUser";
import ListOfChats from "../components/ListOfChats";

export default function MainPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  const [hovered, setHovered] = useState(false);
  const [showList, setShowList] = useState(false);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Загружаем пользователей и чаты при монтировании страницы
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await Api.getUsers();
        setUsers(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Не удалось загрузить пользователей");
      }
    };

    const loadChats = async () => {
      try {
        const data = await Api.getChats();
        setChats(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Не удалось загрузить чаты");
      }
    };

    loadUsers();
    loadChats();
  }, []);

  const handleSelectUser = async (u: User) => {
    try {
      const newChat = await Api.createNewChatWithUser(u.name!, u.id!);
      toast.success(`Чат с ${u.name || u.email} создан`);
      setChats((prev) => [...prev, newChat]);
      setShowList(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Не удалось создать чат");
    }
  };

  const handleCreateChat = () => {
    setShowList(true);
  }

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
        {/* Левая секция: список чатов и создание */}
        <div
          className={styles.sidebar}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}>
          <p className={styles.username}>
            <strong>{user?.username || "unknown"}</strong>
          </p>

          {showList ? (
            <ListOfUsers
              users={users}
              onClose={() => setShowList(false)}
              onSelectUser={handleSelectUser}
            />
          ) : (
            <div className={styles.chatscontainer}>
              {chats.length > 0 ? (
                <>
                  <ListOfChats
                    chats={chats}
                    onSelectUser={(chat) => setSelectedChat(chat)}
                  />

                  <motion.button
                    className={styles.addchat}
                    onClick={handleCreateChat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    ➕</motion.button>
                </>
              ) : (
                <>
                  <p>чатов еще нет</p>
                  <motion.button
                    className={styles.addchat}
                    onClick={handleCreateChat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                      hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    ➕
                  </motion.button>
                </>
              )}
            </div>
          )}

          <div className={styles.sidebarBottom}>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </div>
        {/* Правая секция: чат */}
        <div className={styles.chatSection}>
          {selectedChat ? (
            <ChatWithUser chat={selectedChat} />
          ) : (
            <p>Выберите чат слева</p>
          )}
        </div>
      </div >
    </motion.div >
  );
}