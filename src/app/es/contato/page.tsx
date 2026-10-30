import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Contato";

export const metadata = metadataFor("es");

export default function Page() {
  setLocale("es");
  return <View />;
}
