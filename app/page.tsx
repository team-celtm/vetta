
import CustomerStories from "./Components/CustomerStories";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import Numbers from "./Components/Numbers";
import PlatformFeatures from "./Components/PlatformFeatures";
import ReadySection from "./Components/ReadySection";
import TalentIntelligence from "./Components/TalentIntelligence";
import Working from "./Components/Working";

export default function Home() {
  return (
  <div>
    <Navbar/>
    <TalentIntelligence/>

    <Numbers/>
    <PlatformFeatures/>

    <Working/>
    <CustomerStories/>
    <ReadySection/>
    <Footer/>
  </div>
  );
}
