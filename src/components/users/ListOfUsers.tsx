import { ArrowLeft } from "lucide-react";
import { type User } from "../../../service/api";
import styles from "../../styles/MainPage.module.css";
import UserCell from "./UserCell";

interface ListOfUsersProps {
  users: User[];
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function ListOfUsers({ users, onClose, onSelectUser }: ListOfUsersProps) {
  return (
    <div className={styles.addusersection}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button className={styles.backBtn} onClick={onClose}>
          <ArrowLeft size={18} />
        </button>
        <p className={styles.sectionTitle}>Новое сообщение с</p>
      </div>

      <section className={styles.userList}>
        {users.map((u) => (
          <UserCell key={u.id || u.email} user={u} onClick={() => onSelectUser(u)} />
        ))}
      </section>
    </div>
  );
}