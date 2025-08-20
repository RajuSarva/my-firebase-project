import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, GitFork, LayoutTemplate } from "lucide-react";
import Link from "next/link";

const services = [
  {
    href: "/document-generator",
    icon: FileText,
    title: "Document Generator",
    description: "Create BRDs, FRS, and SRS documents from your project descriptions.",
  },
  {
    href: "/flowchart-generator",
    icon: GitFork,
    title: "Flowchart Generator",
    description: "Visualize processes and workflows by generating Mermaid syntax diagrams.",
  },
  {
    href: "/wireframe-generator",
    icon: LayoutTemplate,
    title: "Wireframe Generator",
    description: "Generate initial design mockups for your application's key screens.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background text-foreground">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary via-blue-400 to-blue-500 text-transparent bg-clip-text">
          Welcome to GT-DOC AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered assistant for creating essential project artifacts.
          Select a service below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {services.map((service) => (
          <Link href={service.href} key={service.title} className="block group">
            <Card className="h-full bg-secondary border-border hover:border-primary/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <service.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-headline text-primary/90">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
