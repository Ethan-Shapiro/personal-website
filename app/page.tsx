import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SkillsSection } from "@/components/SkillsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ProjectGrid />
      <SkillsSection />
    </>
  );
}
