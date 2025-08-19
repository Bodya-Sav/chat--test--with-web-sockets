import { type User } from "../../service/api";
import styles from "../styles/MainPage.module.css";
import UserCell from "./UserCell";

interface ListOfUsersProps {
  users: User[];
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function ListOfUsers({ users, onClose, onSelectUser }: ListOfUsersProps) {
  return (
    <div className={styles.addusersection}>
      <h4 className={styles.sectionTitle}>Выберите пользователя</h4>
      <section className={styles.userList}>
        {users.map((u) => (
          <UserCell key={u.id || u.email} user={u} onClick={() => onSelectUser(u)} />
        ))}
      </section>
      <button className={styles.backBtn} onClick={onClose}>
        Назад
      </button>
    </div>
  );
}