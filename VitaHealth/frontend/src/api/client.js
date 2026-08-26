const API_BASE_URL = "http://localhost:8000/api/v1";

export async function checkBackendHealth() {
  const response = await fetch("http://localhost:8000/health");
  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}`);
  }
  return response.json();
}

export { API_BASE_URL };
