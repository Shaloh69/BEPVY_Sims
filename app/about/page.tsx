import { FC } from "react";
import { title, subtitle } from "@/components/primitives";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Code,
  BookOpen,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const AboutPage: FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "James D. Barzo",
      role: "Project Lead",
      image: "/team/james.jpg",
    },
    {
      name: "Nif Rafael E. Elemino",
      role: "Developer",
      image: "/team/rafael.jpg",
    },
    {
      name: "Yamato S. Potot",
      role: "Developer",
      image: "/team/yamato.jpg",
    },
    {
      name: "Thaddeus Villarta",
      role: "Developer",
      image: "/team/thaddeus.jpg",
    },
    {
      name: "Kimberly Yorong",
      role: "Developer",
      image: "/team/kimberly.jpg",
    },
  ];

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6">
      {/* Hero Section */}
      <div className="w-full py-12 md:py-16 text-center">
        <h1 className={`${title({ color: "violet" })} mb-4`}>About BEPVY</h1>
        <p
          className={`${subtitle()} max-w-3xl mx-auto text-xl mb-8 text-gray-400`}
        >
          Learn more about our platform and the team behind it
        </p>
      </div>

      {/* Project Description */}
      <div className="w-full mb-16">
        <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/50 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 text-violet-400">
            Our Project
          </h2>
          <p className="text-gray-300 mb-4">
            BEPVY (Web-Based Platform for Luminance and Lamp Quantity Simulation
            for Electrical Systems and Illumination Engineering Design) is a
            thesis project developed by Electrical Engineering students from the
            University of Cebu Lapu-Lapu and Mandaue Campus.
          </p>
          <p className="text-gray-300 mb-4">
            Our platform addresses the challenge of complex lighting
            calculations by providing an intuitive, accessible web-based tool
            for determining optimal luminance levels and lamp quantities for
            various spaces.
          </p>
          <p className="text-gray-300">
            The project combines principles from illumination engineering,
            simulation theory, and web-based technologies to create a solution
            that benefits students, professionals, and educators in the field of
            electrical engineering and lighting design.
          </p>
        </div>
      </div>

      {/* Project Goals */}
      <div className="w-full mb-16">
        <h2 className={`${title({ size: "sm" })} mb-8 text-center`}>
          Project Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/50 rounded-xl p-6 flex items-start">
            <div className="mr-4 mt-1">
              <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Educational Tool</h3>
              <p className="text-gray-400">
                Provide students with a practical tool to understand and apply
                theoretical concepts in illumination engineering.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/50 rounded-xl p-6 flex items-start">
            <div className="mr-4 mt-1">
              <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Code className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
              <p className="text-gray-400">
                Create a user-friendly platform that makes complex calculations
                accessible to users regardless of technical expertise.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/50 rounded-xl p-6 flex items-start">
            <div className="mr-4 mt-1">
              <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Time Efficiency</h3>
              <p className="text-gray-400">
                Reduce the time and effort required for designing lighting
                systems through automation and optimization.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/50 rounded-xl p-6 flex items-start">
            <div className="mr-4 mt-1">
              <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Research Contribution
              </h3>
              <p className="text-gray-400">
                Contribute to the field of illumination engineering by providing
                a platform for further research and innovation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Team */}
      <div className="w-full mb-16">
        <h2 className={`${title({ size: "sm" })} mb-8 text-center`}>
          Meet the Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-gray-900/30 backdrop-blur-md border border-gray-800/50 rounded-xl p-6 flex flex-col items-center"
            >
              <div className="h-24 w-24 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
              <p className="text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advisor */}
      <div className="w-full mb-16">
        <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 backdrop-blur-md rounded-xl p-6 md:p-8 border border-violet-800/30">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-violet-500/20 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                ENGR. DIEGO V. ABAD JR.
              </h3>
              <p className="text-gray-300 mb-4">Thesis Adviser</p>
              <p className="text-gray-400">
                We would like to express our sincerest appreciation and
                gratitude to our Thesis Adviser, who helped us every step of the
                way. Throughout the research, he provided us patience and
                guidance that greatly helped us with the progress of our
                research.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full py-6 mb-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-4">Experience BEPVY Today</h2>
          <p className="text-gray-300 max-w-2xl mb-6">
            Try our platform and see how it can transform your approach to
            illumination engineering design.
          </p>
          <Link
            href="/simulator"
            className="bg-violet-600/80 backdrop-blur-sm hover:bg-violet-700/90 transition-all px-8 py-3 rounded-full text-white font-medium flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
