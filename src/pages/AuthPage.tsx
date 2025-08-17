import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from '../styles/AuthPage.module.css'
import { Api } from '../../service/api'
import { useUser } from "../context/useUser";
import { useNavigate } from "react-router-dom";

interface AuthFormState {
  email: string;
  password: string;
}

export default function AuthPage() {
  const [form, setForm] = useState<AuthFormState>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const { fetchUser } = useUser();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await Api.login(form);
      await fetchUser(); // подтягиваем данные из /me
      navigate("/chats", { replace: true }); // вместо window.location.href
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Ошибка авторизации");
      } else {
        setError("Ошибка авторизации");
      }
    }
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={styles.container}>
        <h2 style={{ textAlign: 'center', margin: 'auto' }}>Авторизация</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button className={styles.button} type="submit">Войти</button>
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <a href="/reg" style={{ color: '#7b7e84ff', textDecoration: 'underline', cursor: 'pointer' }}>
              Зарегистрироваться
            </a>
          </div>
        </form>
      </div>
    </motion.div>
  );
}