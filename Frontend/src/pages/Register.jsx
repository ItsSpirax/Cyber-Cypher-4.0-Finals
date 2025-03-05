import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react"; // Add this import for the spinner icon

export default function Register() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [isVerifying, setIsVerifying] = useState(false); // Add verification loading state

    // Registration form state
    const [registerForm, setRegisterForm] = useState({
        name: "",
        email: "",
        no: "",
        gender: "",
    });

    // Registration form errors
    const [registerErrors, setRegisterErrors] = useState({
        name: "",
        email: "",
        no: "",
        gender: "",
    });

    // OTP form state
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    // Handle input changes for registration form
    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm({
            ...registerForm,
            [name]: value,
        });

        // Clear error when user types
        if (registerErrors[name]) {
            setRegisterErrors({
                ...registerErrors,
                [name]: "",
            });
        }
    };

    // Handle gender select change
    const handleGenderChange = (value) => {
        setRegisterForm({
            ...registerForm,
            gender: value,
        });

        // Clear error when user selects
        if (registerErrors.gender) {
            setRegisterErrors({
                ...registerErrors,
                gender: "",
            });
        }
    };

    // Validate registration form
    const validateRegisterForm = () => {
        let isValid = true;
        const errors = {
            name: "",
            email: "",
            no: "",
            gender: "",
        };

        // Name validation
        if (!registerForm.name || registerForm.name.length < 2) {
            errors.name = "Name must be at least 2 characters";
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!registerForm.email || !emailRegex.test(registerForm.email)) {
            errors.email = "Please enter a valid email address";
            isValid = false;
        }

        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!registerForm.no || !phoneRegex.test(registerForm.no)) {
            errors.no = "Phone number must be 10 digits";
            isValid = false;
        }

        // Gender validation
        if (!registerForm.gender) {
            errors.gender = "Please select a gender";
            isValid = false;
        }

        setRegisterErrors(errors);
        return isValid;
    };

    // Validate OTP
    const validateOtp = () => {
        let isValid = true;
        let error = "";

        const otpRegex = /^\d{6}$/;
        if (!otp || !otpRegex.test(otp)) {
            error = "OTP must be 6 digits";
            isValid = false;
        }

        setOtpError(error);
        return isValid;
    };

    // Handle registration form submission
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!validateRegisterForm()) {
            return;
        }

        setIsLoading(true); // Set loading state to true

        try {
            const params = new URLSearchParams({
                name: registerForm.name,
                email: registerForm.email,
                no: registerForm.no,
                gender: registerForm.gender,
            });

            const response = await axios.post(
                `${process.env.SERVER_URL}/register?${params}`,
            );

            if (response.data.status === "success") {
                toast({
                    title: "Registration successful",
                    description:
                        "Please enter the OTP sent to your WhatsApp number",
                });
                setPhoneNumber(registerForm.no);
                setIsRegistering(false);
            } else {
                toast({
                    variant: "destructive",
                    title: "Registration failed",
                    description: "Please try again later",
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast({
                variant: "destructive",
                title: "Registration failed",
                description: error.message || "Please try again later",
            });
        } finally {
            setIsLoading(false); // Set loading state to false when done
        }
    };

    // Handle OTP verification form submission
    const handleVerifySubmit = async (e) => {
        e.preventDefault();

        if (!validateOtp()) {
            return;
        }

        setIsVerifying(true); // Set verifying state to true

        try {
            const params = new URLSearchParams({
                no: phoneNumber,
                otp: otp,
            });

            const response = await axios.post(
                `${process.env.SERVER_URL}/verify?${params}`,
            );

            toast({
                title: "Verification successful",
                description: "Your account has been verified!",
            });
            navigate("/");
        } catch (error) {
            console.error("Verification error:", error);
            toast({
                variant: "destructive",
                title: "Verification failed",
                description: error.message || "Please try again later",
            });
        } finally {
            setIsVerifying(false); // Set verifying state to false when done
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-[350px] md:w-[450px]">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {isRegistering ? "Create Account" : "Verify OTP"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isRegistering ? (
                        <form
                            onSubmit={handleRegisterSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={registerForm.name}
                                    onChange={handleRegisterChange}
                                />
                                {registerErrors.name && (
                                    <p className="text-sm font-medium text-destructive">
                                        {registerErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={registerForm.email}
                                    onChange={handleRegisterChange}
                                />
                                {registerErrors.email && (
                                    <p className="text-sm font-medium text-destructive">
                                        {registerErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="no">Phone Number</Label>
                                <Input
                                    id="no"
                                    name="no"
                                    type="tel"
                                    placeholder="10-digit phone number"
                                    value={registerForm.no}
                                    onChange={handleRegisterChange}
                                />
                                {registerErrors.no && (
                                    <p className="text-sm font-medium text-destructive">
                                        {registerErrors.no}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    onValueChange={handleGenderChange}
                                    value={registerForm.gender}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="Female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {registerErrors.gender && (
                                    <p className="text-sm font-medium text-destructive">
                                        {registerErrors.gender}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    "Register"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form
                            onSubmit={handleVerifySubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="otp">OTP Code</Label>
                                <Input
                                    id="otp"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value);
                                        setOtpError("");
                                    }}
                                />
                                {otpError && (
                                    <p className="text-sm font-medium text-destructive">
                                        {otpError}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isVerifying}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>

                            <div className="text-center text-sm text-gray-500">
                                <p>
                                    OTP has been sent to your WhatsApp on +91
                                    {phoneNumber}
                                </p>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
