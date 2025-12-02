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
import { Link, useNavigate } from "react-router";

interface RegisterForm {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirm_password: string;
};

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    let navigate = useNavigate();
    const [form, setForm] = useState<RegisterForm>({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirm_password: ""
    });
    const [formError, setFormError] = useState<string>("")

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

        if (form.password != form.confirm_password) {
            setForm({ ...form, password: "", confirm_password: "" });
            setFormError("Passwords do not match");
            return;
        }

        //TODO: check password things

        const req = await fetch("http://localhost/api/auth/register", {
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

        if (req.status != 200) {
            if (req.body) {
                const reqBody = await req.text();
                setFormError(reqBody);
            }
            else
                setFormError(`Server error (${req.status})`);
            return;
        }
        else {
            navigate('/login');
        }

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
                            <FieldDescription>
                                Must be at least 8 characters long.
                            </FieldDescription>
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
                                <span>{formError}</span>
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
