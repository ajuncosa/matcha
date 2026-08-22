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
import { useContext, useState } from "react"
import AuthContext, { logInUser, type User } from "@/contexts/AuthContextProvider"

interface LoginForm {
    username: string;
    password: string;
};

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const [form, setForm] = useState<LoginForm>({
        username: "",
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

        if (!form.username || !form.password) {
            setFormError("Please fill all the required fields");
            return;
        }

        try {
            const loggedInUser: User = await logInUser(form.username, form.password);
            if (!loggedInUser) {
                return;
            }

            setUser(loggedInUser);
            // The socket connects reactively from SocketContextProvider when
            // loggedIn flips true. Connecting again here created a second, racing
            // socket without the event bridge — the cause of the chat unread badge
            // not updating live right after the first login.

            if (loggedInUser.profileCompleted)
                navigate('/browser');
            else
                navigate('/welcome');
        }
        catch (e) {
            if (e instanceof Error)
                setFormError(e.message);
        }
        
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="johndoe"
                                    required
                                    onChange={onFormChange}
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Link
                                        to="/forgot-password"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input id="password" type="password" required onChange={onFormChange} value={form.password} />
                            </Field>
                            <Field>
                                <span className="text-red-500">{formError}</span>
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
