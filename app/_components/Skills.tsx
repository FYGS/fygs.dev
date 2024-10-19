import { Badge } from "@/components/ui/badge";
import { Code } from "./Code";
import { Section } from "./Section";
import { AWSDynamoIcon } from "./icons/AWSDynamoIcon";
import { AWSLambdaIcon } from "./icons/AWSLambdaIcon";
import { NestJSIcon } from "./icons/NestJSIcon";
import { NextJSIcon } from "./icons/NextJSIcon";
import { NodeJSIcon } from "./icons/NodeJSIcon";
import { OpenAIIcon } from "./icons/OpenAIIcon";
import { ReactIcon } from "./icons/ReactIcon";
import { ReactQueryIcon } from "./icons/ReactQueryIcon";
import { TailwindIcon } from "./icons/TailwindIcon";
import { AWSCloudwatchIcon } from "./icons/AWSCloudwatchIcon";
import { AWSSQSIcon } from "./icons/AWSSQSIcon";
import { HonoJSIcon } from "./icons/HonoJSIcon";

export const Skills = () => {
  return (
    <Section className="flex flex-col items-start gap-4">
      <Badge variant="outline">Skills</Badge>
      <h2 className="pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        I love working on ...
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <ReactIcon
            size={42}
            className="animate-spin"
            style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">React</h3>
          <p className="text-sm text-muted-foreground text-justify">
            My favorite framework. I love building web apps with{" "}
            <Code>React</Code>. I also love building fullstack apps with{" "}
            <Code>Next.js</Code>.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ReactQueryIcon
            size={42}
            className="animate-spin"
            style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">React Query</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I love using <Code>React Query</Code> for efficient data fetching
            and state management in React applications. It simplifies complex
            data synchronization tasks and improves performance.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <NextJSIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">Next.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            My favorite framework. I love building web apps with{" "}
            <Code>React</Code>. I also love building fullstack apps with{" "}
            <Code>Next.js</Code>.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <TailwindIcon
            size={42}
            className="animate-spin"
            style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">Tailwind</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I love building <u>responsive</u> and <i>beautiful</i> websites with{" "}
            <Code>Tailwind</Code>.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <NodeJSIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">Node.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I enjoy building scalable backend services and APIs using{" "}
            <Code>Node.js</Code>. Its non-blocking I/O model and vast ecosystem
            make it perfect for high-performance applications.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <HonoJSIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">Hono.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I appreciate the simplicity and performance of <Code>Hono.js</Code>{" "}
            for building web applications. Its lightweight nature and fast
            routing capabilities make it a great choice for efficient and
            scalable projects.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <OpenAIIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">
            AI Integration
          </h3>
          <p className="text-sm text-muted-foreground text-justify">
            I&apos;m fascinated by the potential of AI and enjoy integrating{" "}
            <Code>AI</Code>&apos;s powerful language models into applications.
            From chatbots to content generation, the possibilities are endless.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <NestJSIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">Nest.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I&apos;m passionate about building robust and scalable backend
            applications with <Code>Nest.js</Code>. Its modular architecture and
            TypeScript support make it an excellent choice for creating
            maintainable and efficient server-side applications.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AWSLambdaIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">AWS Lambda</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I leverage <Code>AWS Lambda</Code> for building serverless
            applications, allowing for efficient scaling and cost-effective
            solutions. Its event-driven architecture is perfect for
            microservices and automated processing tasks.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AWSDynamoIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">
            AWS Dynamo DB
          </h3>
          <p className="text-sm text-muted-foreground text-justify">
            I utilize <Code>AWS DynamoDB</Code> for its fast and flexible NoSQL
            database capabilities. It&apos;s excellent for applications
            requiring low-latency data access at any scale. I appreciate its
            seamless integration with other AWS services and its ability to
            handle diverse workloads efficiently.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AWSCloudwatchIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">
            AWS Cloudwatch
          </h3>
          <p className="text-sm text-muted-foreground text-justify">
            I use <Code>AWS CloudWatch</Code> for comprehensive monitoring and
            observability of AWS resources and applications. It provides
            valuable insights through logs, metrics, and alarms, enabling
            proactive management and troubleshooting of cloud infrastructure.
            CloudWatch&apos;s real-time monitoring capabilities are crucial for
            maintaining high availability and performance of AWS-based systems.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AWSSQSIcon
            size={42}
            // className="animate-spin"
            // style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">AWS SQS</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I leverage <Code>AWS SQS</Code> (Simple Queue Service) for building
            decoupled and scalable microservices architectures. It provides a
            reliable, highly-scalable, and fully-managed message queuing service
            that enables asynchronous communication between distributed system
            components. SQS helps in managing workload spikes, reducing
            dependencies between services, and ensuring fault tolerance in
            distributed applications.
          </p>
        </div>
      </div>
    </Section>
  );
};
