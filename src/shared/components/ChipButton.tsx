import { Download } from "lucide-react";

const ChipButton: React.FC<{
    label: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    color?: string;
}> = ({ label, onClick, icon, color }) => (
    <button
        onClick={onClick}
        className={`group flex w-full items-center justify-between rounded-xl px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg focus:outline-none ${color}`}
        title={label}
    >
        <span className="flex items-center gap-2">
            {icon}
            {label}
        </span>
        <Download className="w-4 h-4 opacity-80 group-hover:opacity-100" />
    </button>
);

export default ChipButton