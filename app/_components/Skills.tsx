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
      <Badge
        variant="outline"
        className="text-xl text-muted-foreground font-semibold"
      >
        Skills
      </Badge>
      <h2 className="pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        I excel in ...
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
            My go-to library for building dynamic and responsive web
            applications. I leverage <Code>React</Code> to create seamless user
            experiences and efficient component-based architectures.
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
            I utilize <Code>React Query</Code> for advanced data fetching and
            state management in React applications. It simplifies complex data
            synchronization tasks and enhances application performance.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <NextJSIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">Next.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            My preferred framework for building fullstack applications. With{" "}
            <Code>Next.js</Code>, I create highly optimized and scalable web
            solutions, leveraging its powerful features like server-side
            rendering and static site generation.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <TailwindIcon
            size={42}
            className="animate-spin"
            style={{ animationDuration: "10s" }}
          />
          <h3 className="text-2xl font-semibold tracking-tight">
            Tailwind CSS
          </h3>
          <p className="text-sm text-muted-foreground text-justify">
            I craft visually appealing and responsive designs using{" "}
            <Code>Tailwind CSS</Code>. Its utility-first approach allows for
            rapid development and consistent styling across projects.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <NodeJSIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">Node.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I build scalable and high-performance backend services with{" "}
            <Code>Node.js</Code>. Its event-driven architecture and extensive
            ecosystem make it ideal for developing efficient server-side
            applications.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <HonoJSIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">Hono.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I appreciate the simplicity and performance of <Code>Hono.js</Code>{" "}
            for building web applications. Its lightweight nature and fast
            routing capabilities make it a great choice for efficient and
            scalable projects.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <OpenAIIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">
            AI Integration
          </h3>
          <p className="text-sm text-muted-foreground text-justify">
            I integrate advanced <Code>AI</Code> models into applications,
            unlocking new possibilities for automation, natural language
            processing, and intelligent decision-making.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <NestJSIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">Nest.js</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I develop robust and maintainable backend applications with{" "}
            <Code>Nest.js</Code>. Its modular architecture and TypeScript
            support enable the creation of scalable and efficient server-side
            solutions.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AWSLambdaIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">AWS Lambda</h3>
          <p className="text-sm text-muted-foreground text-justify">
            I leverage <Code>AWS Lambda</Code> for building serverless
            applications, allowing for efficient scaling and cost-effective
            solutions. Its event-driven architecture is perfect for
            microservices and automated processing tasks.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <AWSDynamoIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">
            AWS DynamoDB
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
          <AWSCloudwatchIcon size={42} />
          <h3 className="text-2xl font-semibold tracking-tight">
            AWS CloudWatch
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
          <AWSSQSIcon size={42} />
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
