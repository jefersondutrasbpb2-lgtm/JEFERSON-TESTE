import type { NextConfig } from "next";

// Permite hospedar o site em subdiretório (ex.: GitHub Pages) via NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  // Nome fixo para a pasta _next/static/<id>: a publicação por FTP só troca os arquivos, sem
  // apagar a pasta da versão anterior a cada envio.
  generateBuildId: async () => "iec-pombal",
};

export default nextConfig;
