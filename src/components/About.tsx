import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function About() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Our Story
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Our Story</DialogTitle>
          <DialogDescription>
            Discover the journey behind MyFuze
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Pure Refreshments</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At MyFuze, we believe hydration should be pure, simple, and accessible to everyone. 
              Our premium water bottles are designed with both quality and sustainability in mind.
            </p>
            
            <h4 className="font-medium">What We Offer:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
              <li>Premium quality water bottles</li>
              <li>Custom label design services</li>
              <li>Bulk orders for businesses</li>
              <li>Sustainable packaging options</li>
            </ul>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whether you're looking for personal hydration solutions or bulk orders for your business, 
              MyFuze provides pure refreshments that you can trust.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default About;