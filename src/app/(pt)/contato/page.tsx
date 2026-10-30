import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Contato";

export const metadata = metadataFor("pt");

export default function Page() {
  setLocale("pt");
  return <View />;
}
