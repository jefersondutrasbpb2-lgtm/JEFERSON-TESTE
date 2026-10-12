/**
 * Prefixa caminhos de /public com o basePath (hospedagem em subdiretório)
 * ou, na prévia estática, com um caminho relativo.
 */
const base =
  process.env.NEXT_PUBLIC_PREVIEW_STATIC === "1" ? "." : process.env.NEXT_PUBLIC_BASE_PATH || "";

export const asset = (path: string) => `${base}${path}`;
