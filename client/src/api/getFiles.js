import { API_URL } from "./config";

export async function getFiles() {
  const response = await fetch(`${API_URL}/files`, { credentials: "include" });
  if (response.status === 401) {
    throw new Error("unauthenticated");
  } else {
    return response.json();
  }
}
