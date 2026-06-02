import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, Check, X } from "lucide-react";

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter",  test: (p: string) => /[a-z]/.test(p) },
    { label: "One number",            test: (p: string) => /[0-9]/.test(p) },
];

function isPasswordValid(password: string) {
    return passwordRules.every(r => r.test(password));
}

interface RegisterForm {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirm_password: string;
};

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [form, setForm] = useState<RegisterForm>({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirm_password: ""
    });
    const [formError, setFormError] = useState<string>("");
    const [success, setSuccess] = useState(false);

    function onFormChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({
            ...form,
            [e.target.id]: e.target.value
        })
    }

    async function submit(e: React.MouseEvent) {
        e.preventDefault();
        setFormError("");

        if (!form.email || !form.firstname || !form.lastname || !form.password || !form.confirm_password) {
            setFormError("Please fill all the required fields");
            return;
        }

        if (!isPasswordValid(form.password)) {
            setFormError("Password does not meet the requirements below");
            return;
        }

        if (form.password != form.confirm_password) {
            setForm({ ...form, password: "", confirm_password: "" });
            setFormError("Passwords do not match");
            return;
        }

        const resp : Response = await fetch("http://localhost/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: form.email,
                name: form.firstname,
                lastname: form.lastname,
                password: form.password
            })
        });

        if (resp.status != 200) {
            if (resp.body) {
                const reqBody = await resp.text();
                setFormError(reqBody);
            }
            else
                setFormError(`Server error (${resp.status})`);
            return;
        }
        else {
            setSuccess(true);
        }
    }

    if (success) {
        return (
            <Card {...props}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" />
                        Account created!
                    </CardTitle>
                    <CardDescription>
                        We sent a verification email to <strong>{form.email}</strong>. Click the link inside to activate your account, then sign in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link to="/login">Go to login</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                            <Input id="firstname" type="text" placeholder="John" required onChange={onFormChange} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                            <Input id="lastname" type="text" placeholder="Doe" required onChange={onFormChange} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                onChange={onFormChange}
                            />
                            <FieldDescription>
                                We&apos;ll use this to contact you. We will not share your email
                                with anyone else.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password" type="password" required onChange={onFormChange} value={form.password} />
                            {form.password.length > 0 && (
                                <ul className="mt-1 space-y-0.5">
                                    {passwordRules.map(rule => {
                                        const met = rule.test(form.password);
                                        return (
                                            <li key={rule.label} className={`flex items-center gap-1 text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}>
                                                {met ? <Check size={12} /> : <X size={12} />}
                                                {rule.label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            {form.password.length === 0 && (
                                <FieldDescription>Must meet all requirements shown on input.</FieldDescription>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirm-password">
                                Confirm Password
                            </FieldLabel>
                            <Input id="confirm_password" type="password" required onChange={onFormChange} value={form.confirm_password} />
                            <FieldDescription>Please confirm your password.</FieldDescription>
                        </Field>
                        <FieldGroup>
                            <Field>
                                <span className="text-red-600">{formError}</span>
                                <Button type="submit" onClick={submit}>Create Account</Button>
                                <FieldDescription className="px-6 text-center">
                                    Already have an account? <Link to="/login">Sign in</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
