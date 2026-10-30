import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Missoes";

export const metadata = metadataFor("pt");

export default function Page() {
  setLocale("pt");
  return <View />;
}
