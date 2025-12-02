import { cn } from "@/lib/utils"
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
import { Link, useNavigate } from "react-router";
import { useState } from "react"

interface LoginForm {
    email: string;
    password: string;
};

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    let navigate = useNavigate();
    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: ""
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

        if (!form.email || !form.password) {
            setFormError("Please fill all the required fields");
            return;
        }

        const req = await fetch("http://localhost/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: form.email,
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
            navigate('/home');
        }

    }


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    onChange={onFormChange} 
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" type="password" required onChange={onFormChange} value={form.password} />
                            </Field>
                            <Field>
                                <span>{formError}</span>
                                <Button type="submit" onClick={submit}>Login</Button>
                                <FieldDescription className="text-center">
                                    Don&apos;t have an account? <Link to="/register">Sign up</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
