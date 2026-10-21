import { Hero } from "@/components/home/Hero";
import { Destaque } from "@/components/home/Destaque";
import { Essencia } from "@/components/home/Essencia";
import { Historia1970 } from "@/components/home/Historia1970";
import { Caminhada } from "@/components/home/Caminhada";
import { Missao } from "@/components/home/Missao";
import { Servico } from "@/components/home/Servico";
import { Mensagens } from "@/components/home/Mensagens";
import { Comunidade } from "@/components/home/Comunidade";
import { Cultos } from "@/components/home/Cultos";
import { Visite } from "@/components/home/Visite";

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
      <Mensagens />
      <Comunidade />
      <Cultos />
      <Visite />
    </>
  );
}
