import axios, { AxiosError } from "axios";
import { AuthResponse, User, Post, Comment, ReactionResponse } from "./types";

const BASE_URL = "https://social-api.pyaesone.com";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const message = error.response?.data?.message || error.message || "An error occurred";
    throw new ApiError(error.response?.status || 500, message);
  }
);

export const api = {
  // Auth
  async register(name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>("/api/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>("/api/login", {
      email,
      password,
    });
    return data;
  },

  async logout(): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>("/api/logout");
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await axiosInstance.get<User>("/api/profile");
    return data;
  },

  // Posts
  async getPosts(page = 1, limit = 10): Promise<Post[]> {
    const { data } = await axiosInstance.get<Post[]>("/api/posts", {
      params: { page, limit, include: 'comments' },
    });
    return data;
  },

  async getMyPosts(page = 1, limit = 10): Promise<Post[]> {
    const { data } = await axiosInstance.get<Post[]>("/api/posts/my-posts", {
      params: { page, limit },
    });
    return data;
  },

  async createPost(title: string, content: string, image?: File): Promise<Post> {
    if (image) {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("file", image);

      const { data } = await axiosInstance.post<Post>("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } else {
      // Send as JSON when no image
      const { data } = await axiosInstance.post<Post>("/api/posts", {
        title,
        content,
      });
      return data;
    }
  },

  async updatePost(postId: number, title: string, content: string, image?: File): Promise<Post> {
    const { data } = await axiosInstance.put<Post>(
      `/api/posts/${postId}`,
      image
        ? { title, content, file: image }
        : { title, content },
      {
        headers: image ? { "Content-Type": "multipart/form-data" } : undefined,
      }
    );
    return data;
  },

  async deletePost(postId: number): Promise<void> {
    await axiosInstance.delete(`/api/posts/${postId}`);
  },

  async createComment(postId: number, content: string): Promise<Comment> {
    const { data } = await axiosInstance.post<Comment>(
      `/api/posts/${postId}/comments`,
      { content }
    );
    return data;
  },

  // Reactions
  async toggleReaction(postId: number): Promise<ReactionResponse> {
    const { data } = await axiosInstance.post<ReactionResponse>(
      `/api/posts/${postId}/reaction`,
      { type: "like" }
    );
    return data;
  },
};
