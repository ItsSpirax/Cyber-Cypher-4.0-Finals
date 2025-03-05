import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2 } from "lucide-react";

const Agreement = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [fileName, setFileName] = useState("No file selected");
    const [isUploading, setIsUploading] = useState(false);

    const languages = [
        { value: "en", label: "English" },
        { value: "en-IN", label: "English (India)" },
        { value: "en-US", label: "English (US)" },
        { value: "as", label: "Assamese" },
        { value: "bn", label: "Bengali" },
        { value: "gu", label: "Gujarati" },
        { value: "hi", label: "Hindi" },
        { value: "kn", label: "Kannada" },
        { value: "ml", label: "Malayalam" },
        { value: "mr", label: "Marathi" },
        { value: "or", label: "Odia" },
        { value: "pa", label: "Punjabi" },
        { value: "ta", label: "Tamil" },
        { value: "te", label: "Telugu" },
        { value: "ur", label: "Urdu" },
    ];

    const uploadFile = async () => {
        if (!selectedFile) {
            alert("Please upload a PDF first");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("language", selectedLanguage);

            const response = await fetch(`${process.env.SERVER_URL}/upload`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Upload successful:", data);
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Error during upload:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
        }
    };

    const handleTranscript = () => {
        if (!selectedFile) {
            alert("Please upload a PDF first");
            return;
        }

        console.log(`Generating transcript in ${selectedLanguage}`);
        uploadFile();
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Document Agreement
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="language">Select Language</Label>
                        <Select
                            value={selectedLanguage}
                            onValueChange={setSelectedLanguage}
                        >
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((language) => (
                                    <SelectItem
                                        key={language.value}
                                        value={language.value}
                                    >
                                        {language.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Upload Document</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                id="pdf-upload"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Label
                                htmlFor="pdf-upload"
                                className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-white border"
                            >
                                <Upload size={18} />
                                Upload PDF
                            </Label>
                            <span className="text-sm text-gray-500">
                                {fileName}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={handleTranscript}
                        disabled={!selectedFile || isUploading}
                        className="flex items-center gap-2"
                    >
                        {isUploading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <FileText size={18} />
                        )}
                        {isUploading ? "Uploading..." : "Generate Transcript"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Agreement;
