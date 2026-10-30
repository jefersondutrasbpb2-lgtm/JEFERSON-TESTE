import { RootLayout, rootMetadata, rootViewport } from "@/components/layout/RootLayout";

export const metadata = rootMetadata("pt");
export const viewport = rootViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout locale="pt">{children}</RootLayout>;
}
