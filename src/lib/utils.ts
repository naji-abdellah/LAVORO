import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function calculateMatchingScore(
    candidateSkills: string[],
    jobRequirements: string[]
): number {
    if (jobRequirements.length === 0) return 0;

    const normalizedSkills = candidateSkills.map((s) => s.toLowerCase().trim());
    const normalizedRequirements = jobRequirements.map((r) => r.toLowerCase().trim());

    const matchedCount = normalizedRequirements.filter((req) =>
        normalizedSkills.some(
            (skill) => skill.includes(req) || req.includes(skill)
        )
    ).length;

    return Math.round((matchedCount / jobRequirements.length) * 100);
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        INTERVIEW_SCHEDULED: "bg-blue-100 text-blue-800",
        ACCEPTED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        ACTIVE: "bg-green-100 text-green-800",
        CLOSED: "bg-gray-100 text-gray-800",
        SCHEDULED: "bg-blue-100 text-blue-800",
        COMPLETED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
}
