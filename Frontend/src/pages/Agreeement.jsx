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
import { Upload, FileText } from "lucide-react";

const Agreement = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("english");
    const [fileName, setFileName] = useState("No file selected");

    const languages = [
        { value: "english", label: "English" },
        { value: "spanish", label: "Spanish" },
        { value: "french", label: "French" },
        { value: "german", label: "German" },
        { value: "chinese", label: "Chinese" },
        { value: "japanese", label: "Japanese" },
    ];

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
                        disabled={!selectedFile}
                        className="flex items-center gap-2"
                    >
                        <FileText size={18} />
                        Generate Transcript
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Agreement;
