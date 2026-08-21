import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { API_URL } from "@/lib/config";

export default function VerifyUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [accountVerified, setAccountVerified] = useState("loading");

    async function verifyUser() {
        const request = await fetch(`${API_URL}/auth/verify/${id}`);
        if (request.status == 200) {
            setAccountVerified("verified");
        }
        else {
            setAccountVerified("error");
        }
    }
    
    useEffect(() => {
        if (!id) {
            navigate('/login');
        }
        verifyUser();
    }, []);

    return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
        {accountVerified != "loading" ? (
            <>
            <Card>
                {accountVerified == "verified" ? (
                <>
                    <CardHeader>
                    <CardTitle>Account verification</CardTitle>
                    <CardDescription>
                        Your account has been verified successfully
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <a href="/login">
                        <Button className="cursor-pointer">Go to login</Button>
                    </a>
                    </CardContent>
                </>
                ) : (
                <>
                    <CardHeader>
                    <CardTitle>Account verification</CardTitle>
                    <CardDescription>Invalid token</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <a href="/login">
                            <Button className="cursor-pointer">Go to login</Button>
                        </a>
                    </CardContent>
                </>
                )}
            </Card>
            </>
        ) : (
            <div className="flex justify-center">
            <Loader className="animate-spin" />
            </div>
        )}
        </div>
    </div>
    )

}