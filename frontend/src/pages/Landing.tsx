import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            {/* Nav */}
            <header className="flex items-center justify-between px-8 py-5">
                <span className="text-xl font-semibold tracking-tight">matcha</span>
                <div className="flex gap-3">
                    <Button variant="ghost" asChild>
                        <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/register">Sign up</Link>
                    </Button>
                </div>
            </header>

            <Separator />

            {/* Hero */}
            <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24 gap-6">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    Find your match
                </Badge>

                <h1 className="text-5xl font-bold tracking-tight max-w-xl leading-tight">
                    Meet people who actually get you.
                </h1>

                <p className="text-muted-foreground text-lg max-w-sm">
                    Matcha connects you with people based on what matters — interests, values, and real conversation.
                </p>

                <div className="flex gap-3 mt-2">
                    <Button size="lg" asChild>
                        <Link to="/register">Get started</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link to="/login">I have an account</Link>
                    </Button>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-muted-foreground text-sm py-6">
                &copy; {new Date().getFullYear()} matcha
            </footer>
        </div>
    );
}
