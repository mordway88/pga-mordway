export async function fetchPoolEntries() {
  const response = await fetch("/api/entries", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Entry sheet request failed: ${response.status}`);
  }

  return response.json();
}
