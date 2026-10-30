import { RootLayout, rootMetadata, rootViewport } from "@/components/layout/RootLayout";
import { PageTemplate } from "@/components/layout/PageTemplate";
import NotFound from "@/views/NotFound";

export const metadata = { ...rootMetadata("pt"), title: "Página não encontrada · IEC Pombal" };
export const viewport = rootViewport;

/** Página 404 única (há um layout raiz por idioma); oferece os três idiomas. */
export default function GlobalNotFound() {
  return (
    <RootLayout locale="pt">
      <PageTemplate>
        <NotFound />
      </PageTemplate>
    </RootLayout>
  );
}
