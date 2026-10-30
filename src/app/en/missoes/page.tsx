import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Missoes";

export const metadata = metadataFor("en");

export default function Page() {
  setLocale("en");
  return <View />;
}
