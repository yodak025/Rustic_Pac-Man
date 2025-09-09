export const generateCells = async (rows: number = 9, cols: number = 5, maxFigureSize: number = 5) => {
  try {
    console.log("Generating cells...");

    const response = await fetch(
      "/generation-endpoint/generate-cells",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows,
          cols,
          "max-figure-size": maxFigureSize,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate cells");
    }

    const data = await response.json();
    console.log("Cells generated:", data);
    return data;
  } catch (error) {
    console.error("Error generating cells:", error);
    throw error;
  }
};

export const getCells = async () => {
  try {
    console.log("Fetching cells...");

    const response = await fetch("/generation-endpoint/get-cells");

    if (!response.ok) {
      throw new Error("Failed to fetch cells");
    }

    const data = await response.json();
    console.log("Received cells:", data);
    return data;
  } catch (error) {
    console.error("Error fetching cells:", error);
    throw error;
  }
};

export const generateTiles = async () => {
  try {
    console.log("Generating tiles...");

    const response = await fetch(
      "/generation-endpoint/generate-tiles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate tiles");
    }

    const data = await response.json();
    console.log("Tiles generated:", data);
    return data;
  } catch (error) {
    console.error("Error generating tiles:", error);
    throw error;
  }
};

export const getTiles = async () => {
  try {
    console.log("Fetching tiles...");

    const response = await fetch("/generation-endpoint/get-tiles");

    if (!response.ok) {
      throw new Error("Failed to fetch tiles");
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
      console.log("Received tiles:", data);
      return data;
    } else {
      throw new Error("Invalid tiles format received");
    }
  } catch (error) {
    console.error("Error fetching tiles:", error);
    throw error;
  }
};

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
      cols: 5,
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
