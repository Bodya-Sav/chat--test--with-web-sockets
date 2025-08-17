import { BASE_URL } from "../src/consts/config";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface User {
  email: string;
  username?: string;
}

export class Api {
  static async login(payload: LoginPayload): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Ошибка авторизации");
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    return data;
  }

  static async register(payload: RegisterPayload): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Ошибка регистрации");
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    return data;
  }

  static getToken(): string | null {
    return localStorage.getItem("token");
  }

  static getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  static logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  static async getMe(): Promise<User> {
    const token = Api.getToken();
    const res = await fetch(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Ошибка получения данных пользователя");
    return await res.json();
  }

  static async getUsers(): Promise<User[]> {
    const token = Api.getToken();
    const res = await fetch(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Ошибка получения списка пользователей");
    return await res.json();
  }
}
