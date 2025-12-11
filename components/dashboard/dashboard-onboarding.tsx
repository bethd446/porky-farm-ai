"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Stethoscope, Baby, BookOpen, Sparkles } from "lucide-react";

export function DashboardOnboarding() {
  const quickActions = [
    {
      title: "Ajouter un porc",
      description: "Enregistrez vos animaux pour commencer le suivi",
      icon: Plus,
      href: "/dashboard/livestock/add",
      primary: true,
    },
    {
      title: "Signaler un problème de santé",
      description: "Un animal est malade ou a besoin de soins",
      icon: Stethoscope,
      href: "/dashboard/health",
      primary: false,
    },
    {
      title: "Enregistrer une saillie",
      description: "Une truie a été saillie, suivez la gestation",
      icon: Baby,
      href: "/dashboard/reproduction",
      primary: false,
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Bienvenue sur PorkyFarm !</CardTitle>
            <CardDescription className="mt-1">
              Commencez par ajouter vos premiers porcs. Ensuite, vous pourrez
              suivre leur santé et leurs gestations.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant={action.primary ? "default" : "outline"}
                  className={`w-full h-auto flex-col items-start gap-3 p-4 ${
                    action.primary
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        action.primary ? "bg-white/20" : "bg-primary/10"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${action.primary ? "text-white" : "text-primary"}`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm">
                        {action.title}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          action.primary
                            ? "text-white/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <Link href="/guide">
            <Button variant="ghost" className="w-full gap-2">
              <BookOpen className="h-4 w-4" />
              Découvrir le guide de démarrage
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
