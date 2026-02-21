import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Shield, Music } from "lucide-react";

export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center justify-center text-center py-12">
        <Music className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl mb-4">Welcome to The Electric Dreams</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Rock band creating unforgettable music experiences since 2015
        </p>
        <Link to="/admin">
          <Button className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Go to Admin Panel
          </Button>
        </Link>
      </div>
    </div>
  );
}
