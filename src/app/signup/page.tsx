
"use client"

import Link from "next/link"

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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="w-full max-w-md">
        <Card className="bg-secondary border-primary/20 shadow-lg shadow-primary/10">
           <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
               <Feather className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">GT-DOC AI</CardTitle>
            <CardDescription>
              Create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Max" required className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Robinson" required className="bg-background"/>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required className="bg-background"/>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Create an account
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
