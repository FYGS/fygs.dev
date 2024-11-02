import { Section } from "@/app/_components/Section";
import { Timeline } from "@/app/_components/Timeline";
import { AvailabilityIndicator } from "@/components/ui/availability-indicator";
import { Badge } from "@/components/ui/badge";
import { BookingCalendar } from "@/components/ui/booking-calendar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Code2,
  Cpu,
  Download,
  ExternalLink,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Laptop,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Target,
  Train,
  Users,
  Workflow,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const EXPERIENCE_ITEMS = [
  {
    date: "2023 - Present",
    title: "Backend Developer | Node.js, NestJS, TypeScript, AWS Cloud",
    company: "Allianz Technology",
    location: "Paris, France",
    type: "Full-time",
    description: [
      "Design and development of high-performance REST APIs, facilitating seamless integration between Allianz's various systems",
      "Implementation of a microservices architecture, enhancing the scalability and resilience of applications",
      "Deployment of serverless solutions, optimizing infrastructure costs and flexibility",
      "Automation of deployment processes through Gitlab CI/CD, accelerating development cycles",
      "Utilization of Terraform for Infrastructure as Code, ensuring consistency and reproducibility of environments",
      "Leveraging AWS services (Lambda, S3, DynamoDB, SQS, CloudWatch) to build robust cloud-native solutions",
    ],
    achievements: [
      "Reduced client request processing time by 30%",
      "Improved system stability by 25% during peak loads",
      "Decreased infrastructure costs by 20% through cloud optimization",
      "Enhanced system security and compliance by implementing cloud-based NFRs",
    ],
    technologies: [
      "NodeJS",
      "TypeScript",
      "Python Scripting",
      "AWS Lambda",
      "DynamoDB",
      "NestJS",
      "REST API",
      "Microservices",
      "Serverless",
      "Terraform",
      "Gitlab CI/CD",
      "Testing",
    ],
    current: true,
    context: `Allianz Technology, the technology subsidiary of the Allianz Group, is at the forefront of innovation in the insurance and financial services sector. The company develops cutting-edge digital solutions to enhance customer experience and optimize the group's internal processes. With a presence in over 70 countries and serving millions of customers, Allianz Technology plays a crucial role in the digital transformation of the insurance giant.

    I joined Allianz Technology in 2023 as a Backend Developer, contributing to the development and improvement of the core systems that power the group's insurance services. My role is essential in creating a robust and scalable infrastructure capable of meeting the growing needs of a global clientele.`,
  },
  {
    date: "2019 - Present",
    title: "Full Stack Software Engineer | React, NextJS, TypeScript, Node.js",
    company: "Ouestech SARL (co-founded company)",
    location: "Paris, France",
    type: "Entrepreneurship",
    description: [
      "Developing and maintaining scalable web applications for various clients",
      "Leading technical architecture decisions and implementation strategies",
      "Collaborating with clients to define project requirements and timelines",
      "Ensuring high code quality and performance optimization",
      "Managing entire development lifecycle from conception to deployment",
      "Implementing responsive and accessible user interfaces",
    ],
    achievements: [
      "Successfully delivered 15+ projects for diverse clients",
      "Achieved 98% client satisfaction rate",
      "Reduced average page load time by 60%",
      "Implemented automated testing increasing code coverage to 90%",
    ],
    technologies: ["React", "NextJS", "TypeScript", "TailwindCSS", "Node.js"],
    current: true,
    context: `As co-founder and lead developer of Ouestech, I have the opportunity to work on a variety of exciting projects across different sectors. This experience has allowed me to develop strong adaptability and deep expertise in modern web technologies.

    My partner and I handle the entire development lifecycle, from design to production, including development and deployment. This position has enabled me to develop not only my technical skills but also my project management and client communication abilities.`,
  },
  {
    date: "2019 - 2023",
    title: "Front-end Developer | TypeScript, Node.js Developer",
    company: "GE Healthcare",
    location: "Paris, France",
    type: "Full-time",
    description: [
      "Development of a Web SDK for medical imaging, enabling advanced visualization capabilities for healthcare professionals",
      "Design and implementation of Micro Front-End components, enhancing the platform's modularity and scalability",
      "Close collaboration with software architects and UX/UI teams to ensure optimal design and seamless user experience",
      "Writing comprehensive software specifications, ensuring clear communication of technical requirements",
      "Establishment of rigorous testing strategies, including unit tests, component tests, and End-to-End (E2E) tests, to maintain high software quality",
      "Orchestration of continuous integration processes via GitLab and Jenkins, streamlining development workflows",
      "Utilization of Sonar for code quality assurance, maintaining high standards of code cleanliness and efficiency",
    ],
    achievements: [
      "Contributed to the development of the SDK",
      "Implemented new front-end components for domain-specific applications sold to hospitals",
      "Maintained and stabilized tests",
    ],
    technologies: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "GitLab",
      "Jenkins",
      "Sonar",
      "Cucumber",
      "PlayWright",
      "Jest",
      "Sinon.js",
    ],
    current: false,
    context: `GE Healthcare, a global leader in medical technology and digital solutions, is at the forefront of innovation in medical imaging and diagnosis. The company develops cutting-edge solutions that enable healthcare professionals to provide faster and more accurate diagnoses, thereby improving patient outcomes. With a presence in over 160 countries and serving millions of patients each year, GE Healthcare plays a vital role in advancing medical imaging technology globally.

    I joined GE Healthcare in 2019 as a Software Developer, contributing to the development of Web Front-end and the improvement of the Imaging Fabric (IF) project - a Web SDK for advanced medical imaging visualization. My role was crucial in creating a robust and evolving platform capable of meeting the changing needs of healthcare professionals worldwide.`,
  },
  {
    date: "2019 - 2020",
    title: "Full Stack Developer",
    company: "GE Healthcare",
    location: "Paris, France",
    type: "Full-time",
    description: [
      "Contributed to the development of a 3D medical image viewer, enhancing clinical workflow applications for healthcare professionals.",
      "Worked in a multi-platform environment (Linux - CentOS, Windows) to ensure compatibility and performance.",
      "Collaborated within an Agile/Scrum framework to deliver high-quality software solutions efficiently.",
      "Interacted with software architects to design system interactions optimizing user experience.",
      "Wrote comprehensive software specifications to ensure clear communication of technical requirements.",
      "Implemented rigorous testing strategies, including unit tests and integration tests, to maintain high software quality.",
      "Contributed to continuous integration processes, ensuring streamlined development workflows.",
    ],
    achievements: [
      "Contributed to the Technical Design Reviews",
      "Developed an advanced GSA material management component",
      "Maintained and fixed bugs",
    ],
    technologies: [
      "C++ 11/14/17",
      "Java SE (Swing)",
      "Testing (JUnit, Mockito)",
      "Linux (CentOS)",
      "Windows",
      "Agile/Scrum",
    ],
    current: false,
    context: `I joined GE Healthcare in 2019 as a Full-stack Software Developer, contributing to the development and improvement of the Advantage Workstation (AW) project — a 3D medical image viewer designed for advanced clinical workflows. My role was crucial in the team for a robust and evolving platform.`,
  },
  {
    date: "2019 - 2019",
    title: "Full Stack Developer",
    company: "Schneider Electric",
    location: "Grenoble, France",
    type: "Internship",
    description: [
      "Designed and implemented an evolving backend system interacting with hardware components, including a TCP/IP gateway (Harmony Hub) and Zigbee wireless sensors.",
      "Developed an intuitive frontend interface with reactive user interfaces for system configuration and real-time visualization of vibration data.",
      "Designed a modular software architecture, ensuring scalability and ease of maintenance.",
      "Wrote detailed software specifications and closely collaborated with HW/SW architecture teams.",
      "Utilized WebSocket technology to establish bidirectional communication between the software backend and user interfaces, enabling real-time data exchange.",
      "Conducted thorough testing, adhering to Schneider Electric's high quality standards.",
      "Produced comprehensive technical documentation, facilitating knowledge transfer and future system maintenance.",
    ],
    achievements: [
      "Designed and developed a machine failure monitoring system leveraging sensor technology",
      "Developed an intuitive real-time data monitoring interface for enhanced system visibility",
      "Delivered comprehensive project documentation and deliverables",
    ],
    technologies: [
      "Node.js",
      "JavaScript",
      "TypeScript",
      "Node-RED",
      "C++",
      "HTML/CSS",
      "Bootstrap",
      "jQuery",
      "Git",
      "Méthodologie Agile",
      "Wireless Sensors (Zigbee Green Power, BLE, UWB)",
      "Modbus TCP/IP Gateway",
      "Rotating Machine",
    ],
    current: false,
    context: `As part of my final year project (BAC+5), I joined Schneider Electric's R&D team to develop an innovative solution for managing wireless vibration sensors. This project was crucial in Schneider's efforts to expand its offerings in the Industrial Internet of Things (IIoT) and improve predictive maintenance capabilities for its industrial clients.
    
    Project: Wireless Vibration Sensor Management System
    
    I led the software development of a complete solution to manage and monitor wireless vibration sensors, integrating hardware and software components to create a robust real-time monitoring system.`,
  },
  {
    date: "2017 - 2017",
    title: "Software Engineer",
    company: "ATLAN Space",
    location: "Temara, Morocco",
    type: "Internship",
    description: [
      "Conducted mechanical, aerodynamic, telecom, and energy studies to optimize the drone's performance and efficiency.",
      "Designed and fabricated custom electronic circuits and mechanical components, ensuring seamless integration of all subsystems.",
      "Implemented the drone's vision capabilities using the OpenCV library in C++ on Raspberry Pi 3, enhancing autonomous navigation and object recognition.",
      "Developed an intuitive interface for the ground control station using Qt4, facilitating operator interaction and mission management.",
      "Programmed embedded systems in C++ and Python on Raspberry Pi, optimizing processing and control algorithms.",
      "Assembled and conducted rigorous testing of the fixed-wing drone prototype, validating design concepts and system performance.",
      "Collaborated closely with aeronautics researchers to integrate advanced technologies into the drone platform",
    ],
    achievements: [
      "Developed a fixed-wing drone with advanced aerodynamic capabilities",
      "Implemented computer vision for the drone using OpenCV in Python, enabling real-time object detection and tracking",
      "Designed and developed a robust monitoring and orchestration interface in C++/Qt, facilitating seamless control and navigation",
    ],
    technologies: [
      "Python Programming",
      "C++",
      "OpenCV",
      "Git",
      "Ubuntu",
      "Raspberry Pi",
      "PixHawk/Navio2",
      "Qt4",
      "CAO software",
    ],
    current: false,
    context: `As part of my final year project in engineering school, I collaborated with Atlan Space and an aeronautical research laboratory to design and develop an innovative system for fixed-wing unmanned aerial vehicles (UAVs). This project was crucial for strengthening Atlan Space's capabilities in autonomous aerial systems for various applications.

    Project: Design, Development, Assembly, and Testing of Unmanned Aerial Vehicles

    I led the complete development of a fixed-wing drone prototype, from conceptual design to flight testing, integrating advanced computer vision capabilities.`,
  },
];

const EDUCATION_ITEMS = [
  {
    date: "2018 - 2019",
    title: "Master's Degree in Computer Science",
    institution: "Sorbonne Université",
    location: "Paris, France",
    description: [
      "Specialization in Software Engineering and Electronic Engineering",
      "Advanced coursework in Distributed Systems and Network Architecture",
      "Master's program at the intersection of electronics and computer science, focusing on the study, design, and development of complex systems with multi-sector versatility and adaptability.",
      "Providing a solid foundation for various career paths, including embedded systems development and software development.",
    ],
    achievements: [
      "Graduated with a Master's Degree in Science",
      "Object-oriented c++ programming - Object modeling of a data structure",
      "Successfully defended my final year project",
    ],
    // gpa: "3.8/4.0",
  },
  {
    date: "2017 - 2018",
    title: "Master's Degree in Computer Science",
    institution: "Université Pierre et Marie Curie",
    location: "Paris, France",
    description: [
      "Study of Electronic Systems and Computer Systems.",
      "Embedded systems",
      "Computer Engineering: Web languages, C, C++, Python, ...",
      "Electronic Engineering: VHDL, C, C++, assembler on FPGA and DSP",
    ],
    achievements: [
      "Admitted to Master's program second year",
      "Programming of digital systems - Implementation of a dcc central unit on fpga",
      "Development on dsp target - Image processing, contour detection by convolution mask applications",
      "Peripheral programming - Wireless communication raspberry/arduino by NRF",
    ],
  },
  {
    date: "2012 - 2017",
    title: "Engineering Degree in Computer Science",
    institution: "École Nationale des Sciences Appliquées",
    location: "Oujda, Morocco",
    description: [
      "Engineering school with 2 years of integrated preparatory classes and a 3-year specialization.",
      "During the two years of prep, we studied: Mathematics: numerical analysis, algebra, ..., Physics: material point mechanics, electrostatics, thermodynamics, solid mechanics, ..., Engineering Sciences",
      "During the three years of specialization, we studied concepts covering: Electronic fundamentals: digital & analog electronics, power electronics, ..., System administration under Linux, Computer programming: Web languages, C, OOP in Java, ..., Computer networks: routing and security, ...",
    ],
    achievements: [
      "Graduated with an Engineering Degree",
      "Successfully completed multiple student projects",
      "Final year project successfully defended",
    ],
  },
  {
    date: "2011 - 2012",
    title: "High School Diploma in Science",
    institution: "Lycée d'excellence professeur Alpha CONDÉ",
    location: "Conakry, Guinea",
    description: [
      "Courses in Mathematics · Physics · Chemistry · English · French",
    ],
    achievements: [
      "Admitted with distinction",
      "Received an excellence scholarship from the Guinean government",
    ],
    gpa: "3.8/4.0",
  },
];

const CERTIFICATIONS = [
  {
    title: "Amazon Web Services for Developers",
    issuer: "LinkedIn Learning",
    date: "2022",
    validUntil: "Life",
    credentialId: "AWS-ASA-123456",
    link: "https://www.linkedin.com/learning/certificates/3f148b84221a1b53f1395cc52bf9dab8bd504480067d7d5698e7d45def613038?u=2108001",
  },
  {
    title: "Microservices with Node.js",
    issuer: "LinkedIn Learning",
    date: "2022",
    validUntil: "Life",
    credentialId: "AWS-ASA-123455",
    link: "https://www.linkedin.com/learning/certificates/64eb044b9073330c373b354809040b959ad68290538c0d543dbaf8677019c6fe?u=2108001",
  },
  {
    title: "Advanced Node.js",
    issuer: "LinkedIn Learning",
    date: "2022",
    validUntil: "Life",
    credentialId: "AWS-ASA-123454",
    link: "https://www.linkedin.com/learning/certificates/cc72b67bc2758dfbf36786d34f33929dd2eabdb00280b09882b9620377254467?u=2108001",
  },
];

const SKILLS = {
  technical: [
    {
      category: "Backend Development",
      skills: [
        "Node.js",
        "NestJS",
        "Express",
        "TypeScript",
        "Python",
        "RESTful APIs",
        "GraphQL",
      ],
    },
    {
      category: "Frontend Development",
      skills: [
        "React",
        "Next.js",
        "TailwindCSS",
        "TypeScript",
        "Redux",
        "Material-UI",
        "Responsive Design",
      ],
    },
    {
      category: "Cloud & DevOps",
      skills: [
        "AWS",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "Terraform",
        "Serverless",
        "Microservices",
      ],
    },
    {
      category: "Databases & Storage",
      skills: [
        "PostgreSQL",
        "MongoDB",
        "DynamoDB",
        "Redis",
        "Elasticsearch",
        "S3",
      ],
    },
  ],
  languages: [
    { language: "French", level: "Native" },
    { language: "English", level: "Professional" },
  ],
  soft: [
    "Technical Leadership",
    "Problem Solving",
    "Team Collaboration",
    "Agile Methodologies",
    "Project Management",
    "Client Communication",
  ],
};

const DESCRIPTION = {
  intro: {
    title: "About Me",
    subtitle:
      "Specialized in TypeScript, Next.js, Node.js, NestJS, and React to bring your ambitious projects to life?",
    mainText:
      "I'm a Software Engineer | Expert in TypeScript, Next.js, Node.js, NestJS, and React",
    description:
      "With over 5 years of experience as a fullstack developer, I transform ambitious ideas into high-performance, scalable web solutions. My passion for technological innovation enables me to create robust applications that meet the complex needs of modern businesses.",
  },
  experience: {
    title: "Experience in Leading Companies",
    items: [
      {
        company: "Schneider Electric (Energy)",
        role: "Development of IoT solutions for RF geolocation",
        icon: Cpu,
      },
      {
        company: "GE Healthcare (Medical)",
        role: "Creation of user interfaces for medical applications",
        icon: HeartHandshake,
      },
      {
        company: "Allianz Technology (Finance & Insurance)",
        role: "Design of REST API management systems",
        icon: Workflow,
      },
    ],
  },
  expertise: {
    title: "Technical Expertise",
    items: [
      {
        title: "TypeScript",
        description: "Robust development with static typing",
        icon: Code2,
      },
      {
        title: "Next.js / React",
        description: "Reactive and performant user interfaces",
        icon: Laptop,
      },
      {
        title: "Node.js / NestJS",
        description: "RESTful APIs and microservices design",
        icon: Workflow,
      },
      {
        title: "Cloud Architecture",
        description: "Serverless development with AWS services",
        icon: Rocket,
      },
    ],
  },
  services: {
    title: "Services Offered",
    items: [
      "Custom web application development",
      "Technology stack modernization",
      "Development process optimization",
      "CI/CD pipeline implementation",
      "API design and development",
      "Technical training and mentoring",
      "Technical support and maintenance",
    ],
  },
  whyMe: {
    title: "Why Choose Me?",
    items: [
      {
        text: "Deep technical expertise in modern JavaScript technologies",
        icon: Target,
      },
      {
        text: "Ability to translate complex business needs into effective technical solutions",
        icon: Users,
      },
      {
        text: "Results-oriented approach with strong focus on quality",
        icon: Award,
      },
    ],
  },
};

const PREFERENCES = {
  title: "Work Preferences",
  sections: [
    {
      icon: Clock,
      title: "Work Schedule",
      options: ["5 days/week", "1-4 days/week"],
      current: "5 days/week",
      details: {
        "5 days/week":
          "Full-time availability for deep project involvement and team collaboration",
        "1-4 days/week":
          "Flexible part-time schedule for focused consulting and specialized tasks",
      },
    },
    {
      icon: Calendar,
      title: "Contract Duration",
      options: ["0-6 months", "6+ months"],
      current: "6+ months",
      details: {
        "0-6 months": "Short-term projects and quick implementations",
        "6+ months":
          "Long-term projects with comprehensive solutions and ongoing development",
      },
    },
    {
      icon: Building2,
      title: "Work Environment",
      options: ["On-site", "Hybrid", "Remote"],
      current: "Hybrid",
      details: {
        "On-site": "Available for in-office collaboration and team meetings",
        Hybrid:
          "Balanced mix of remote work and office presence for optimal productivity",
        Remote: "Fully equipped for efficient remote collaboration",
      },
    },
    {
      icon: Train,
      title: "Mobility",
      options: ["Île-de-France region"],
      current: "Île-de-France region",
      details: {
        "Île-de-France region":
          "Based in Paris with easy access to all Île-de-France locations",
      },
    },
    {
      icon: MapPin,
      title: "Location",
      options: ["Paris, France"],
      current: "Paris, France",
      details: {
        "Paris, France":
          "Centrally located in Paris for easy accessibility and local collaboration",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Fernand SOUALO - Professional Resume | Senior Software Engineer",
  description:
    "View my professional experience, skills, and achievements. Download my resume to learn more about my expertise in NodeJS, TypeScript, React, and AWS.",
};

export default function ResumePage() {
  return (
    <Section className="flex flex-col gap-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Fernand SOUALO</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Software Engineer
          </p>
        </div>
        <Link
          href="/Fernand_SOUALO_Resume.pdf"
          target="_blank"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <Download size={20} />
          Download Resume
        </Link>
      </div>

      {/* Description Section avec effets de survol */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary group-hover:scale-[1.02] transition-transform duration-300">
              {DESCRIPTION.intro.title}
            </h2>
            <p className="text-lg text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
              {DESCRIPTION.intro.subtitle}
            </p>
            <p className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
              {DESCRIPTION.intro.mainText}
            </p>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {DESCRIPTION.intro.description}
            </p>
          </div>

          {/* Industry Experience */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {DESCRIPTION.experience.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DESCRIPTION.experience.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-card hover:bg-accent/50"
                >
                  <item.icon className="h-5 w-5 text-primary mt-1 transition-transform duration-300 group-hover:scale-110" />
                  <div>
                    <p className="font-medium hover:text-primary transition-colors duration-300">
                      {item.company}
                    </p>
                    <p className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-300">
                      {item.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              {DESCRIPTION.services.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {DESCRIPTION.services.items.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-all duration-300 group cursor-default"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {service}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Me */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {DESCRIPTION.whyMe.title}
            </h3>
            <div className="space-y-2">
              {DESCRIPTION.whyMe.items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Expertise */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              {DESCRIPTION.expertise.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DESCRIPTION.expertise.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group cursor-default"
                >
                  <div className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-primary mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Professional Experience */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">
                Professional Experience
              </h2>
            </div>
            <Timeline items={EXPERIENCE_ITEMS} />
          </Card>

          {/* Education */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Education</h2>
            </div>
            <Timeline items={EDUCATION_ITEMS} variant="education" />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Technical Skills avec effets de survol */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold hover:text-primary transition-colors duration-300">
                  Technical Skills
                </h2>
              </div>

              <div className="space-y-6">
                {SKILLS.technical.map(({ category, skills }) => (
                  <div
                    key={category}
                    className="space-y-2 hover:translate-x-1 transition-transform duration-300"
                  >
                    <h3 className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-sm transition-all duration-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-300">
                  Continuously learning and exploring new technologies to stay
                  at the forefront of web development.
                </p>
              </div>
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Globe2 className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                Languages
              </h2>
            </div>
            <div className="space-y-3">
              {SKILLS.languages.map(({ language, level }) => (
                <div 
                  key={language} 
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/50 transition-all duration-300 group/item cursor-default"
                >
                  <span className="font-medium group-hover/item:text-primary transition-colors duration-300">
                    {language}
                  </span>
                  <span className="text-muted-foreground px-3 py-1 rounded-full border border-transparent group-hover/item:border-primary/30 group-hover/item:bg-primary/5 transition-all duration-300">
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                Certifications
              </h2>
            </div>
            <div className="space-y-4">
              {CERTIFICATIONS.map((cert) => (
                <Link 
                  key={cert.title} 
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg hover:bg-accent/50 transition-all duration-300 group/cert"
                >
                  <div className="space-y-2">
                    <div className="font-medium group-hover/cert:text-primary transition-colors duration-300 flex items-center justify-between">
                      {cert.title}
                      <ExternalLink className="h-4 w-4 opacity-0 group-hover/cert:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-muted-foreground flex items-center justify-between">
                        <span className="group-hover/cert:text-foreground transition-colors duration-300">
                          {cert.issuer}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs border border-transparent group-hover/cert:border-primary/30 group-hover/cert:bg-primary/5 transition-all duration-300">
                          {cert.date} - {cert.validUntil}
                        </span>
                      </div>
                      <div className="text-muted-foreground/80 group-hover/cert:text-muted-foreground transition-colors duration-300">
                        Credential ID: {cert.credentialId}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Preferences Section */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{PREFERENCES.title}</h2>
              </div>

              <div className="space-y-4">
                {PREFERENCES.sections.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <section.icon className="h-4 w-4" />
                      <h3 className="text-sm font-medium">{section.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((option: string) => (
                        <TooltipProvider key={option}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "text-sm px-3 py-1 rounded-full border transition-all duration-300",
                                  "hover:scale-105 hover:shadow-md cursor-pointer",
                                  "transform-gpu hover:-translate-y-0.5",
                                  option === section.current
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "border-border text-muted-foreground hover:border-primary/30"
                                )}
                              >
                                {option}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>
                                {
                                  section.details[
                                    option as keyof typeof section.details
                                  ]
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="pt-4 border-t opacity-0 translate-y-4 transition-all duration-500"
                style={{
                  animation: "fadeInSlideUp 0.5s ease-out 0.2s forwards",
                }}
              >
                <p className="text-sm text-muted-foreground">
                  Open to discussing flexible arrangements based on project
                  requirements
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Call to Action Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let&apos;s collaborate to transform your ideas into exceptional
              digital solutions. I&apos;m available for freelance projects and
              technical consulting.
            </p>

            {/* Indicateur de disponibilité */}
            <div className="flex justify-center">
              <AvailabilityIndicator />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="mailto:fygs.dev@gmail.com"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "group min-w-[200px] bg-primary/90 hover:bg-primary transition-all duration-300"
              )}
            >
              <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              Email Me
            </Link>

            {/* Calendrier de réservation */}
            <BookingCalendar />

            <Link
              href="https://www.linkedin.com/in/fernandsoualo"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "group min-w-[200px] hover:bg-primary/10 transition-all duration-300"
              )}
            >
              <Linkedin className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Connect on LinkedIn
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Mail className="h-4 w-4" />
              fygs.dev@gmail.com
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Phone className="h-4 w-4" />
              +33 6 44 80 85 30
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Linkedin className="h-4 w-4" />
              @fernandsoualo
            </div>
          </div>

          <div
            className="text-center pt-4 text-sm text-muted-foreground opacity-0 animate-fadeIn"
            style={{
              animation: "fadeIn 0.5s ease-in-out 0.5s forwards",
            }}
          >
            Available for projects worldwide • Quick response within 24 hours
          </div>
        </div>
      </Card>
    </Section>
  );
}
