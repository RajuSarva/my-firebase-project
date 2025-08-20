
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Feather } from "lucide-react";

export default function LoginPage() {
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
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required  className="bg-background"/>
              </div>
              <Button asChild type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2">
                <Link href="/home">Login</Link>
              </Button>
               <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline text-primary">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
       <footer className="text-center text-sm text-muted-foreground mt-8">
          Created by Geega Technologies
      </footer>
    </div>
  );
}
