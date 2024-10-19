import Image from "next/image";
import Link from "next/link";
import { Code } from "./Code";
import { Section } from "./Section";
import { LinkedInIcon } from "./icons/LinkedInIcon";

export const Hero = () => {
  return (
    <Section className="flex flex-col md:flex-row items-start gap-6">
      <div className="flex-1 w-full flex flex-col gap-4">
        <h2 className="font-caption text-5xl text-primary">Fernand Soualo</h2>
        <h3 className="font-caption font-bold text-3xl">Software Engineer</h3>
        <p className="text-base leading-relaxed">
          I am passionate about creating impactful software. As a software
          engineer, I strive to build solutions that are both functional and
          aesthetically pleasing. I believe in the transformative power of
          software. <br />
          My preferred technologies include <Code>NodeJS</Code>,{" "}
          <Code>NestJS</Code>, <Code>React</Code>, <Code>NextJS</Code>, and{" "}
          <Code>TypeScript</Code>. Connect with me on{" "}
          <Link
            href="https://www.linkedin.com/in/fernandsoualo"
            target="_blank"
            className="text-link"
          >
            <Code className="inline-flex items-center gap-1">
              <LinkedInIcon size={16} className="mr-1" />
              LinkedIn
            </Code>
          </Link>
          . Currently, I am working at{" "}
          <Link
            href="https://www.linkedin.com/company/allianz-technology/"
            target="_blank"
            className="text-link"
          >
            <Code className="inline-flex items-center gap-1">
              <Image
                src="https://media.licdn.com/dms/image/v2/D4D0BAQHFm07UkgElyg/company-logo_200_200/company-logo_200_200/0/1719827406274/allianz_technology_logo?e=1736985600&v=beta&t=maWuQQGFCwsaZ_9zY10y7mgj4PqYHVav-6fEmQBON3E"
                alt="Allianz Technology"
                width={16}
                height={16}
                className="mr-1"
              />
              Allianz Technology
            </Code>
          </Link>
          . Based in{" "}
          <Link
            href="https://fr.wikipedia.org/wiki/France"
            target="_blank"
            className="text-link"
          >
            <Code className="inline-flex items-center gap-1">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_France_%281794%E2%80%931815%2C_1830%E2%80%931974%2C_2020%E2%80%93present%29.svg/110px-Flag_of_France_%281794%E2%80%931815%2C_1830%E2%80%931974%2C_2020%E2%80%93present%29.svg.png"
                alt="France"
                width={16}
                height={16}
                className="mr-1"
                style={{ width: "16px", height: "16px" }}
              />
              Paris, France
            </Code>
          </Link>
        </p>
      </div>
      <div className="flex-1 flex justify-center md:justify-end">
        <Image
          src="https://media.licdn.com/dms/image/v2/D4E03AQEG-_pYx_Zp9A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701116288245?e=1734566400&v=beta&t=Hzfz8Ks5P2UYOjn5CEtnhmTCkElmC6qJEl8_73GF5fI"
          alt="Fernand Soualo"
          width={200}
          height={200}
          className="w-full h-auto rounded-full max-w-xs md:w-56"
        />
      </div>
    </Section>
  );
};
