import { useState, useEffect } from "react";
import { ContactReports } from "./ContactReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database } from "lucide-react";

export function ContactReportsWrapper() {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset error state when component mounts
  useEffect(() => {
    setHasError(false);
    setErrorMessage("");
  }, []);

  if (hasError) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              The contact submissions feature requires database setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Error Details:</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Go to your Supabase dashboard</li>
                    <li>Navigate to SQL Editor</li>
                    <li>Run the content from <code className="bg-blue-100 px-1 rounded">SETUP_CONTACT_SUBMISSIONS.sql</code></li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                setHasError(false);
                setErrorMessage("");
                window.location.reload();
              }}
              className="w-full"
            >
              Retry After Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <ContactReports />
    </div>
  );
}
