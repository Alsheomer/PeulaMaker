import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, FileText, Download, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Hero Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Peula Planning</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight">
            Create Expert-Level Peulot in Minutes
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Plan high-quality educational activities for Tzofim with AI assistance. 
            Based on elite scout methodology and best practices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create">
              <Button 
                size="lg" 
                className="text-base px-8 py-6 h-auto"
                data-testid="button-start-planning"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Planning a Peula
              </Button>
            </Link>
            <Link href="/library">
              <Button 
                variant="outline" 
                size="lg"
                className="text-base px-8 py-6 h-auto"
                data-testid="button-view-library"
              >
                <FileText className="w-5 h-5 mr-2" />
                View My Peulot
              </Button>
            </Link>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">AI-Generated Plans</h3>
              <p className="text-sm text-muted-foreground">
                Answer a few questions and let AI create comprehensive peulot based on Tzofim best practices
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">Save & Manage</h3>
              <p className="text-sm text-muted-foreground">
                Keep all your peulot organized in one place. Edit, review, and reuse successful activities
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-card-border hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">Export to Google Docs</h3>
              <p className="text-sm text-muted-foreground">
                Export your peula with proper formatting and table structure ready to share with your team
              </p>
            </div>
          </div>
          
          {/* Tzofim Badge */}
          <div className="mt-16 p-6 rounded-lg bg-accent/30 border border-accent-border max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Users className="w-5 h-5 text-accent-foreground" />
              <h4 className="text-base font-medium text-accent-foreground">Built for Tzofim Madrichim</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Follows the complete 9-component framework: Topic & Goals, Audience, Methods, Structure, 
              Time Management, Materials, Safety, Delivery, and Reflection & Debrief
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
