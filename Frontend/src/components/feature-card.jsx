import { Clock, Globe, Heart, MapPin, Search, Shield } from "lucide-react";

export default function FeatureCard({ icon, title, description }) {
    const getIcon = () => {
        switch (icon) {
            case "globe":
                return <Globe className="h-10 w-10 text-primary" />;
            case "clock":
                return <Clock className="h-10 w-10 text-primary" />;
            case "search":
                return <Search className="h-10 w-10 text-primary" />;
            case "shield":
                return <Shield className="h-10 w-10 text-primary" />;
            case "map-pin":
                return <MapPin className="h-10 w-10 text-primary" />;
            case "heart":
                return <Heart className="h-10 w-10 text-primary" />;
            default:
                return <Globe className="h-10 w-10 text-primary" />;
        }
    };

    return (
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-primary/50 transition-all duration-300">
            <div className="mb-4">{getIcon()}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}
