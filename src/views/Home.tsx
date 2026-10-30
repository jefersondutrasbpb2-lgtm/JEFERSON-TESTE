import { Hero } from "@/components/home/Hero";
import { Destaque } from "@/components/home/Destaque";
import { Essencia } from "@/components/home/Essencia";
import { Historia1970 } from "@/components/home/Historia1970";
import { Caminhada } from "@/components/home/Caminhada";
import { Missao } from "@/components/home/Missao";
import { Servico } from "@/components/home/Servico";
import { Comunidade } from "@/components/home/Comunidade";
import { Cultos } from "@/components/home/Cultos";
import { Visite } from "@/components/home/Visite";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";

export const metadataFor = (locale: Locale) => pageMetadata(locale, { path: "/" });

export default function HomePage() {
  return (
    <>
      <Hero />
      <Destaque />
      <Essencia />
      <Historia1970 />
      <Caminhada />
      <Missao />
      <Servico />
      <Comunidade />
      <Cultos />
      <Visite />
    </>
  );
}
