import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Visite";

export const metadata = metadataFor("es");

export default function Page() {
  setLocale("es");
  return <View />;
}
