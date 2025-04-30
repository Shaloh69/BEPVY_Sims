import { FC } from "react";
import { title, subtitle } from "@/components/primitives";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  LightbulbIcon,
  Laptop,
  Layout,
} from "lucide-react";

const Home: FC = () => {
  return (
    <section className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6">
      {/* Hero Section */}
      <div className="w-full py-12 md:py-24 lg:py-32 text-center">
        <h1
          className={`${title({ color: "violet" })} mb-4 text-5xl font-extrabold tracking-tight`}
        >
          BEPVY
        </h1>
        <p
          className={`${subtitle()} max-w-3xl mx-auto text-xl md:text-2xl mb-8 text-gray-400`}
        >
          Web-based Platform for Luminance and Lamp Quantity Simulation for
          Electrical Systems and Illumination Engineering Design
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/simulator"
            className="bg-violet-600/80 backdrop-blur-sm hover:bg-violet-700/90 transition-all px-8 py-3 rounded-full text-white font-medium flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/about"
            className="bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/60 transition-all border border-gray-700 px-8 py-3 rounded-full text-white font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full py-12 md:py-24">
        <h2 className={`${title()} text-center mb-12`}>Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="flex flex-col items-center p-6 rounded-xl bg-gray-900/30 backdrop-blur-md border border-gray-800/50 hover:bg-gray-800/40 transition-all">
            <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Accurate Calculations</h3>
            <p className="text-gray-400 text-center">
              Precise luminance and lamp quantity calculations based on industry
              standards and best practices.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center p-6 rounded-xl bg-gray-900/30 backdrop-blur-md border border-gray-800/50 hover:bg-gray-800/40 transition-all">
            <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
              <LightbulbIcon className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Optimization</h3>
            <p className="text-gray-400 text-center">
              Optimize lamp placement and quantity for energy efficiency and
              cost effectiveness.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center p-6 rounded-xl bg-gray-900/30 backdrop-blur-md border border-gray-800/50 hover:bg-gray-800/40 transition-all">
            <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
              <Layout className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">User-Friendly Interface</h3>
            <p className="text-gray-400 text-center">
              Intuitive design that makes complex illumination calculations
              accessible to everyone.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full py-12 md:py-24">
        <div className="rounded-2xl bg-gradient-to-r from-violet-900/30 to-purple-900/30 backdrop-blur-md p-8 md:p-12 border border-violet-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to design your lighting system?
              </h2>
              <p className="text-gray-300 max-w-lg">
                Start using our platform to create energy-efficient and
                standard-compliant lighting designs with ease.
              </p>
            </div>
            <Link
              href="/calculator"
              className="bg-violet-600/80 backdrop-blur-sm hover:bg-violet-700/90 transition-all px-8 py-3 rounded-full text-white font-medium whitespace-nowrap flex items-center gap-2"
            >
              Try It Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
