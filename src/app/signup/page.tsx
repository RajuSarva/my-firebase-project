
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Feather } from "lucide-react"

export default function SignUpForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // In a real application, you would handle the sign-up logic here (e.g., API call).
    // For now, we'll simulate a successful sign-up and redirect.
    setTimeout(() => {
      console.log("Simulating successful sign-up...");
      // Redirect to the login page after a short delay
      router.push("/login");
    }, 1000); // Simulate network request
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="w-full max-w-md">
        <Card className="bg-secondary border-primary/20 shadow-lg shadow-primary/10">
           <CardHeader className="text-center">
             <div className="flex items-center justify-center mb-4">
               <div className="p-3 bg-primary/10 rounded-full border-2 border-primary/30">
                 <Feather className="h-8 w-8 text-primary" />
               </div>
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">GT-DOC AI</CardTitle>
            <CardDescription>
              Create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Max" required className="bg-background" disabled={isSubmitting}/>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Robinson" required className="bg-background" disabled={isSubmitting}/>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-background"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required className="bg-background" disabled={isSubmitting}/>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create an account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline text-primary">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <footer className="text-center text-sm text-muted-foreground mt-8">
          Created by Geega Technologies
      </footer>
    </div>
  )
}
