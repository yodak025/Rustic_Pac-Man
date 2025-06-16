export const loadMaze = async () => {
  try {
    console.log("Generating new maze...");

    const generateResponse = await fetch(
    "/generation-endpoint/create-maze",
    {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
      cols: 10,
      rows: 9,
      "max-figure-size": 5,
      }),
    }
    );

    if (!generateResponse.ok) {
    throw new Error("Failed to generate maze");
    }

    // Obtener el laberinto después de generarlo
    const response = await fetch("/generation-endpoint/get-tiles");

    if (!response.ok) {
    throw new Error("Failed to fetch maze");
    }

    const data = await response.json();

    // Verificar que la respuesta contiene un number[][]
    if (
    Array.isArray(data) &&
    data.every(
      (row) =>
      Array.isArray(row) && row.every((cell) => typeof cell === "number")
    )
    ) {
    console.log("Received maze:", data);
    return data
    } else {
    throw new Error("Invalid maze format received");
    }
  } catch (error) {
    console.error("Error loading maze:", error);
    // Fallback al mapa por defecto en caso de error
    console.log("Using fallback maze");
  } finally {
  }
  };
