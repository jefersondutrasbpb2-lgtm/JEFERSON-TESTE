import type { Metadata } from "next";
import { channelUrl, messages } from "@/content/data";
import { site } from "@/content/site";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";
import { MessagesLibrary } from "@/components/ui/MessagesLibrary";

export const metadata: Metadata = {
  title: "Mensagens",
  description: "Pregações e estudos bíblicos da Igreja Evangélica Congregacional de Pombal, organizados por série, referência bíblica e pregador.",
  alternates: { canonical: "/mensagens/" },
};

export default function MensagensPage() {
  const youtube = site.social.find((s) => s.id === "youtube");
  return (
    <>
      <PageHero
        tone="paper"
        title={
          <>
            Ouvir, estudar <em>e guardar a Palavra.</em>
          </>
        }
        lead="Uma biblioteca de pregações e estudos bíblicos para ouvir novamente, aprofundar o estudo das Escrituras e compartilhar."
        aside={
          channelUrl ? (
            <Button href={channelUrl} icon="arrow-up-right" external>
              Canal no YouTube
            </Button>
          ) : (
            <p className="small muted">
              Canal oficial no YouTube: {youtube?.handle} <Pending />
            </p>
          )
        }
      />
      <Section tone="paper" className="section--tight">
        <div className="container">
          <MessagesLibrary items={messages} />
        </div>
      </Section>
    </>
  );
}
