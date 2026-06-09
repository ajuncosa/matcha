import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Check, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter",  test: (p: string) => /[a-z]/.test(p) },
    { label: "One number",            test: (p: string) => /[0-9]/.test(p) },
];

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const isValid = passwordRules.every(r => r.test(password));

    async function submit(e: React.MouseEvent) {
        e.preventDefault();
        setError("");
        if (!isValid) { setError("Password does not meet the requirements"); return; }
        if (password !== confirm) { setError("Passwords do not match"); return; }

        const resp = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });

        if (resp.ok) {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } else {
            const text = await resp.text();
            setError(text || "Invalid or expired reset link.");
        }
    }

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Invalid link</CardTitle>
                        <CardDescription>This password reset link is invalid or has expired.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full"><Link to="/forgot-password">Request a new link</Link></Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" /> Password updated!
                        </CardTitle>
                        <CardDescription>Redirecting you to login…</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reset your password</CardTitle>
                    <CardDescription>Enter a new password for your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="password">New password</FieldLabel>
                                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                                {password.length > 0 && (
                                    <ul className="mt-1 space-y-0.5">
                                        {passwordRules.map(rule => {
                                            const met = rule.test(password);
                                            return (
                                                <li key={rule.label} className={`flex items-center gap-1 text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}>
                                                    {met ? <Check size={12} /> : <X size={12} />}
                                                    {rule.label}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
                                <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                            </Field>
                            <Field>
                                {error && <span className="text-red-500 text-sm">{error}</span>}
                                <Button type="submit" className="w-full" onClick={submit}>Reset password</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
