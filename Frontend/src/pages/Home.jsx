import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Bot, Globe, Home, MessageSquare } from "lucide-react";
import FeatureCard from "@/components/feature-card";
import { WorldMap } from "@/components/ui/world-map";
import { useTranslation } from "react-i18next";
import "@/i18n";
import { AIChat } from "./components/ai-chat";

const HomePage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="container mx-auto py-6 px-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Home className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">
                        {t("header.brand")}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/register">
                        <Button variant="outline" className="hidden sm:flex">
                            Register
                        </Button>
                    </Link>
                </div>
            </header>

            <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
                <div className="max-w-3xl mx-auto w-full">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        {t("home.mainHeading")}
                    </h1>
                    <p className="text-xl text-gray-400 mb-8">
                        {t("home.subheading")}
                    </p>
                    <WorldMap
                        dots={[
                            {
                                start: {
                                    lat: 64.2008,
                                    lng: -149.4937,
                                }, // Alaska (Fairbanks)
                                end: {
                                    lat: 34.0522,
                                    lng: -118.2437,
                                }, // Los Angeles
                            },
                            {
                                start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                                end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                            },
                            {
                                start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                                end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                            },
                            {
                                start: { lat: 51.5074, lng: -0.1278 }, // London
                                end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                            },
                            {
                                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                                end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                            },
                            {
                                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                                end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                            },
                        ]}
                    />
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/meet">
                            <Button size="lg" className="w-full sm:w-auto">
                                {t("home.talkAsUser")}
                                <MessageSquare className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/agent">
                            <Button size="lg" className="w-full sm:w-auto">
                                {t("home.talkAgentNow")}
                                <MessageSquare className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="bg-zinc-900 py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-6">
                                {t("section.speakYourLanguage")}
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {t("section.speakYourLanguageDesc")}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {[
                                    "English",
                                    "Español",
                                    "Français",
                                    "Deutsch",
                                    "中文",
                                    "日本語",
                                    "العربية",
                                    "हिन्दी",
                                ].map((lang) => (
                                    <span
                                        key={lang}
                                        className="px-3 py-1 bg-zinc-800 rounded-full text-sm"
                                    >
                                        {lang}
                                    </span>
                                ))}
                                <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm">
                                    +90 more
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="relative bg-zinc-800 rounded-lg p-6 border border-zinc-700">
                                <div className="absolute -top-3 -right-3">
                                    <Globe className="h-10 w-10 text-primary p-2 bg-black rounded-full" />
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-zinc-700 p-3 rounded-lg">
                                        <p className="text-sm text-gray-300">
                                            नमस्कार, मला शहराच्या मध्यभागी 3
                                            बेडरूमचे घर हवे आहे.
                                        </p>
                                    </div>
                                    <div className="bg-primary/10 p-3 rounded-lg border-l-4 border-primary">
                                        <p className="text-sm">
                                            मैं आपकी मदद कर सकता हूँ! मैंने आपकी
                                            आवश्यकताओं के अनुसार 12 संपत्तियाँ
                                            पाई हैं। क्या आप आधुनिक या पारंपरिक
                                            डिज़ाइन देखना चाहेंगे?
                                        </p>
                                    </div>
                                    <div className="bg-zinc-700 p-3 rounded-lg">
                                        <p className="text-sm text-gray-300">
                                            मला नैसर्गिक प्रकाश असलेली आधुनिक
                                            शैली आवडेल.
                                        </p>
                                    </div>
                                    <div className="bg-primary/10 p-3 rounded-lg border-l-4 border-primary">
                                        <p className="text-sm">
                                            उत्तम! मेरे पास बहुत सारे प्राकृतिक
                                            प्रकाश के साथ 5 आधुनिक संपत्तियाँ
                                            हैं। यहाँ पहला विकल्प है...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">
                    {t("section.speakYourLanguage")}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon="globe"
                        title={t("feature.multilingualSupport.title")}
                        description={t(
                            "feature.multilingualSupport.description",
                        )}
                    />
                    <FeatureCard
                        icon="clock"
                        title={t("feature.availability.title")}
                        description={t("feature.availability.description")}
                    />
                    <FeatureCard
                        icon="search"
                        title={t("feature.smartMatching.title")}
                        description={t("feature.smartMatching.description")}
                    />
                    <FeatureCard
                        icon="shield"
                        title={t("feature.secureTransactions.title")}
                        description={t(
                            "feature.secureTransactions.description",
                        )}
                    />
                    <FeatureCard
                        icon="map-pin"
                        title={t("feature.localExpertise.title")}
                        description={t("feature.localExpertise.description")}
                    />
                    <FeatureCard
                        icon="heart"
                        title={t("feature.personalizedExperience.title")}
                        description={t(
                            "feature.personalizedExperience.description",
                        )}
                    />
                </div>
            </section>

            <footer className="bg-zinc-950 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">
                                {t("footer.aiEstate")}
                            </h3>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <Link
                                        href="/"
                                        className="hover:text-primary"
                                    >
                                        {t("footer.quickLinks.home")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/properties"
                                        className="hover:text-primary"
                                    >
                                        {t("footer.quickLinks.properties")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/meet"
                                        className="hover:text-primary"
                                    >
                                        {t("footer.quickLinks.talkToAgent")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/about"
                                        className="hover:text-primary"
                                    >
                                        {t("footer.quickLinks.aboutUs")}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Legal</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <Link
                                        href="/terms"
                                        className="hover:text-primary"
                                    >
                                        {t("footer.legal.terms")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="hover:text-primary"
                                    >
                                        {t("footer.legal.privacy")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cookies"
                                        className="hover:text-primary"
                                    >
                                        {t("footer.legal.cookies")}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Contact</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>{t("footer.contact.email")}</li>
                                <li>{t("footer.contact.phone")}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-gray-500">
                        <p>
                            {t("footer.rights", {
                                year: new Date().getFullYear(),
                            })}
                        </p>
                    </div>
                </div>
            </footer>
            <AIChat />
        </div>
    );
};

export default HomePage;
