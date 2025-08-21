import { toast } from "sonner";
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
  id: string;
  name: string;
}

export interface Chat {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  members: User[];
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export class Api {
  static async login(payload: LoginPayload): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Ошибка авторизации");
      throw new Error("Ошибка авторизации");
    }
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
    if (!res.ok) {
      toast.error("Ошибка регистрации");
      throw new Error("Ошибка регистрации");
    }
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
    if (!res.ok) {
      toast.error("Ошибка получения списка пользователей");
      throw new Error("Ошибка получения списка пользователей");
    }
    return await res.json();
  }

  static async getChats(): Promise<Chat[]> {
    const token = Api.getToken();
    const res = await fetch(`${BASE_URL}/chats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      toast.error("Ошибка получения списка чатов");
      throw new Error("Ошибка получения списка чатов");
    }
    return await res.json();
  }

  static async getChatDetails(id: number): Promise<Chat> {
    const token = Api.getToken();
    const res = await fetch(`${BASE_URL}/chats/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      toast.error("Ошибка получения деталей чата");
      throw new Error("Ошибка получения деталей чата");
    }
    return await res.json();
  }

  static async createNewChatWithUser(
    chat_name: string,
    user_id: string
  ): Promise<Chat> {
    const token = Api.getToken();
    const res = await fetch(`${BASE_URL}/chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_name, user_id }), // <- бек ожидает id собеседника
    });

    if (!res.ok) {
      toast.error("Ошибка создания чата");
      throw new Error("Ошибка создания чата");
    }
    return await res.json();
  }

  static async addMemberToChat(
    id: string,
    payload: RegisterPayload
  ): Promise<string> {
    const res = await fetch(`${BASE_URL}/chats/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Ошибка добавления пользователя в чат");
      throw new Error("Ошибка добавления пользователя в чат");
    }
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    return data;
  }

  static async getChatMessages(
    id: string,
    limit = 20,
    offset = 0
  ): Promise<Message[]> {
    const token = Api.getToken();
    const res = await fetch(
      `${BASE_URL}/chats/${id}/messages?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      toast.error("Ошибка получения сообщений чата");
      throw new Error("Ошибка получения сообщений чата");
    }
    const data = await res.json();

    // всегда возвращаем массив
    if (!Array.isArray(data)) return [];
    return data;
  }
}
