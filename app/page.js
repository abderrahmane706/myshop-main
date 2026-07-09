import { HeroSection } from '@/components/sections/HeroSection';
import { LogoStrip } from '@/components/sections/LogoStrip';
import { CategoriesSection } from '@/components/sections/CategoriesSection';
import { FeaturedSection } from '@/components/sections/FeaturedSection';
import { PromoBanner } from '@/components/sections/PromoBanner';
import { BestsellersSection } from '@/components/sections/BestsellersSection';
import { NewArrivalsSection } from '@/components/sections/NewArrivalsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { NewsletterSection } from '@/components/sections/NewsletterSection';

function App() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <LogoStrip />
      <CategoriesSection />
      <FeaturedSection />
      <PromoBanner />
      <BestsellersSection />
      <NewArrivalsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}

export default App;
