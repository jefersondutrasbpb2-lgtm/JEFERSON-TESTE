import { setLocale } from "@/i18n/server";
import View, { metadataFor } from "@/views/Contribua";

export const metadata = metadataFor("pt");

export default function Page() {
  setLocale("pt");
  return <View />;
}
