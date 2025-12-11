import { AddAnimalForm } from "@/components/livestock/add-animal-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddAnimalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/livestock">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Ajouter un porc
          </h1>
          <p className="text-muted-foreground">
            Enregistrez un nouvel animal dans votre élevage
          </p>
        </div>
      </div>

      <AddAnimalForm />
    </div>
  );
}
