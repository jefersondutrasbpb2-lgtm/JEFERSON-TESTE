import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Home";

export const metadata = metadataFor("en");

export default function Page() {
  setLocale("en");
  return <View />;
}
