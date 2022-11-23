import { API_URL } from "./config";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL}/files`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  return response.json();
}
