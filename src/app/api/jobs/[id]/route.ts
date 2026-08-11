import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const MOCK_JOBS_BY_ID: Record<string, any> = {
    "job-1": {
        id: "job-1",
        title: "Senior Full Stack Developer",
        description: "Looking for an experienced Full Stack Developer proficient in Next.js, React, and Node.js to lead web applications engineering.",
        type: "CDI",
        salary: "$80,000 - $110,000",
        location: "Paris, France / Remote",
        status: "ACTIVE",
        requirements: JSON.stringify(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"]),
        createdAt: new Date().toISOString(),
        enterprise: {
            companyName: "TechCorp Global",
            description: "Leading technology enterprise building next-gen web applications.",
            industry: "Technology",
            location: "Paris, France",
            logoUrl: null
        },
        _count: { applications: 3 },
    },
    "job-2": {
        id: "job-2",
        title: "Frontend Developer (React/Tailwind)",
        description: "Join our UI design team to build high-performance, responsive web portals and slick client dashboards.",
        type: "CDI",
        salary: "$60,000 - $80,000",
        location: "Lyon, France",
        status: "ACTIVE",
        requirements: JSON.stringify(["React", "Tailwind CSS", "JavaScript", "HTML/CSS"]),
        createdAt: new Date().toISOString(),
        enterprise: {
            companyName: "Innovate AI Studio",
            description: "Creative digital agency specializing in UI design and web applications.",
            industry: "Design & Software",
            location: "Lyon, France",
            logoUrl: null
        },
        _count: { applications: 5 },
    },
    "job-3": {
        id: "job-3",
        title: "Backend Java / Microservices Architect",
        description: "Design scaleable backend REST APIs with Spring Boot / Jakarta EE and MySQL cloud databases.",
        type: "FREELANCE",
        salary: "$500 / day",
        location: "Remote",
        status: "ACTIVE",
        requirements: JSON.stringify(["Java", "Spring Boot", "MySQL", "Docker", "REST API"]),
        createdAt: new Date().toISOString(),
        enterprise: {
            companyName: "CloudScale Systems",
            description: "Cloud infrastructure and backend microservices consulting.",
            industry: "Cloud Computing",
            location: "Remote",
            logoUrl: null
        },
        _count: { applications: 2 },
    }
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;

        try {
            const job = await db.jobOffer.findUnique({
                where: { id: jobId },
                include: {
                    enterprise: {
                        select: {
                            companyName: true,
                            description: true,
                            industry: true,
                            location: true,
                            logoUrl: true,
                        },
                    },
                    _count: {
                        select: { applications: true },
                    },
                },
            });

            if (job) {
                return NextResponse.json({ job });
            }
        } catch (dbErr) {
            console.warn("DB not reachable for getJobById, using mock fallback if available:", dbErr);
        }

        const mockJob = MOCK_JOBS_BY_ID[jobId];
        if (mockJob) {
            return NextResponse.json({ job: mockJob });
        }

        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
    }
}
