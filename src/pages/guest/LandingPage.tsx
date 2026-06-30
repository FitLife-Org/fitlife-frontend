import HeroSection from "./sections/HeroSection";
import StatsSection from "./sections/StatsSection";
import FeaturesGridSection from "./sections/FeaturesGridSection";
import StoryAndValuesSection from "./sections/StoryAndValuesSection";
import BMICalculatorSection from "./sections/BMICalculatorSection";
import PricingSection from "./sections/PricingSection";
import BottomCTASection from "./sections/BottomCTASection";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <HeroSection />
      <StatsSection />
      <FeaturesGridSection />
      <StoryAndValuesSection />
      <BMICalculatorSection />
      <PricingSection />
      <BottomCTASection />
    </div>
  );
}
