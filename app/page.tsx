import { CertificatesSection } from '@/components/CertificatesSection/CertificatesSection';
import { ContactSection } from '@/components/ContactSection/ContactSection';
import { DifferenceSection } from '@/components/DifferenceSection/DifferenceSection';
import { FabricSection } from '@/components/FabricSection/FabricSection';
import { FaqSection } from '@/components/FaqSection/FaqSection';
import { HeroSection } from '@/components/HeroSection/HeroSection';
import { InsectScreensSection } from '@/components/InsectScreensSection/InsectScreensSection';
import { IntroSection } from '@/components/IntroSection/IntroSection';
import { ProjectsSection } from '@/components/ProjectsSection/ProjectsSection';
import { SiteFooter } from '@/components/SiteFooter/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader/SiteHeader';
import { TechnologySection } from '@/components/TechnologySection/TechnologySection';
import {
  aboutMedia,
  certificates,
  contactDetails,
  differenceBullets,
  featureImages,
  insectScreenContent,
  introPillars,
  navigation,
  socialLinks,
  technologyItems,
} from '@/data/siteContent';
import { getCalcTiers } from '@/lib/calc';
import { getFaqItems } from '@/lib/faqs';
import { getFabricOptions } from '@/lib/fabric-options';
import { getHeroSlideUrls } from '@/lib/hero-slides';
import { getProjects } from '@/lib/projects';

export default async function HomePage() {
  const [heroSlides, fabricOptions, projects, faqItems, calcTiers] = await Promise.all([
    getHeroSlideUrls(),
    getFabricOptions(),
    getProjects(),
    getFaqItems(),
    getCalcTiers(),
  ]);

  return (
    <>
      <SiteHeader
        email={contactDetails.email}
        navigation={navigation}
        phone={contactDetails.phone}
        socialLinks={socialLinks}
      />
      <main>
        <HeroSection slides={heroSlides} />
        <IntroSection
          image={aboutMedia.image}
          pillars={introPillars}
          video={aboutMedia.video}
          videoPoster={aboutMedia.videoPoster}
          years={aboutMedia.experience}
        />
        <DifferenceSection backgroundImage={featureImages.allSeasons} bullets={differenceBullets} />
        <TechnologySection items={technologyItems} />
        <FabricSection fabricOptions={fabricOptions} highlightImage={featureImages.fabrics} />
        <InsectScreensSection
          applications={insectScreenContent.applications}
          body={insectScreenContent.body}
          features={insectScreenContent.features}
          heading={insectScreenContent.heading}
          image={insectScreenContent.image}
          kicker={insectScreenContent.kicker}
          lead={insectScreenContent.lead}
          video={insectScreenContent.video}
          videoPoster={insectScreenContent.videoPoster}
        />
        <CertificatesSection items={certificates} />
        <ProjectsSection items={projects} />
        <FaqSection image={featureImages.faq} items={faqItems} />
        <ContactSection calcTiers={calcTiers} details={contactDetails} />
      </main>
      <SiteFooter details={contactDetails} socialLinks={socialLinks} />
    </>
  );
}
