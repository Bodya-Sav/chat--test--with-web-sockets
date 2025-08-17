import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from '../styles/RegPage.module.css'
import { Api } from '../../service/api'

interface RegisterFormState {
  email: string;
  name: string;
  password: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormState>({
    email: "",
    name: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await Api.register(form);
      window.location.href = "/auth";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Ошибка регистрации");
      } else {
        setError("Ошибка регистрации");
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
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Регистрация</h2>
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
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
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
          <button className={styles.button} type="submit">Зарегистрироваться</button>
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <a href="/auth" style={{ color: '#7b7e84ff', textDecoration: 'underline', cursor: 'pointer' }}>
              Авторизоваться
            </a>
          </div>
        </form>
      </div>
    </motion.div>
  );
}