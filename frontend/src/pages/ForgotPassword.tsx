import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function submit(e: React.MouseEvent) {
        e.preventDefault();
        setError("");
        if (!email) { setError("Please enter your email"); return; }

        const resp = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (resp.ok) {
            setSubmitted(true);
        } else {
            setError("Something went wrong. Please try again.");
        }
    }

    if (submitted) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" /> Check your email
                        </CardTitle>
                        <CardDescription>
                            If an account with that email exists, we've sent a password reset link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full"><Link to="/login">Back to login</Link></Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Forgot your password?</CardTitle>
                    <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </Field>
                            <Field>
                                {error && <span className="text-red-500 text-sm">{error}</span>}
                                <Button type="submit" className="w-full" onClick={submit}>Send reset link</Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    <Link to="/login" className="underline-offset-4 hover:underline">Back to login</Link>
                                </p>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
