import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Contribua";

export const metadata = metadataFor("es");

export default function Page() {
  setLocale("es");
  return <View />;
}
