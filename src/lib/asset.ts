/** Prefixa caminhos de /public com o basePath (hospedagem em subdiretório). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
