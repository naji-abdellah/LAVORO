import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { db } from "@/lib/db";

const MOCK_JOBS = [
    {
        id: "job-1",
        title: "Senior Full Stack Developer",
        description: "Looking for an experienced Full Stack Developer proficient in Next.js, React, and Node.js to lead web applications engineering.",
        type: "CDI",
        salary: "$80,000 - $110,000",
        location: "Paris, France / Remote",
        status: "ACTIVE",
        requirements: JSON.stringify(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"]),
        createdAt: new Date().toISOString(),
        enterprise: { companyName: "TechCorp Global", logoUrl: null },
        _count: { applications: 3 },
        hasApplied: false,
    },
    {
        id: "job-2",
        title: "Frontend Developer (React/Tailwind)",
        description: "Join our UI design team to build high-performance, responsive web portals and slick client dashboards.",
        type: "CDI",
        salary: "$60,000 - $80,000",
        location: "Lyon, France",
        status: "ACTIVE",
        requirements: JSON.stringify(["React", "Tailwind CSS", "JavaScript", "HTML/CSS"]),
        createdAt: new Date().toISOString(),
        enterprise: { companyName: "Innovate AI Studio", logoUrl: null },
        _count: { applications: 5 },
        hasApplied: false,
    },
    {
        id: "job-3",
        title: "Backend Java / Microservices Architect",
        description: "Design scaleable backend REST APIs with Spring Boot / Jakarta EE and MySQL cloud databases.",
        type: "FREELANCE",
        salary: "$500 / day",
        location: "Remote",
        status: "ACTIVE",
        requirements: JSON.stringify(["Java", "Spring Boot", "MySQL", "Docker", "REST API"]),
        createdAt: new Date().toISOString(),
        enterprise: { companyName: "CloudScale Systems", logoUrl: null },
        _count: { applications: 2 },
        hasApplied: false,
    }
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.toLowerCase();
        const type = searchParams.get("type");
        const location = searchParams.get("location")?.toLowerCase();

        const authUser = await getAuthUser(request);

        let appliedJobIds: string[] = [];

        try {
            if (authUser && authUser.role === "CANDIDATE") {
                const candidate = await db.candidateProfile.findUnique({
                    where: { userId: authUser.id },
                    include: { applications: { select: { jobOfferId: true } } },
                });
                if (candidate) {
                    appliedJobIds = candidate.applications.map((a) => a.jobOfferId);
                }
            }

            const jobs = await db.jobOffer.findMany({
                where: {
                    status: "ACTIVE",
                    ...(type && type !== "all" ? { type: type as "CDI" | "CDD" | "FREELANCE" } : {}),
                    ...(location ? { location: { contains: location } } : {}),
                    ...(search
                        ? {
                            OR: [
                                { title: { contains: search } },
                                { description: { contains: search } },
                            ],
                        }
                        : {}),
                },
                include: {
                    enterprise: {
                        select: {
                            companyName: true,
                            logoUrl: true,
                        },
                    },
                    _count: {
                        select: { applications: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            if (jobs.length > 0) {
                const jobsWithApplied = jobs.map((job) => ({
                    ...job,
                    hasApplied: appliedJobIds.includes(job.id),
                }));
                return NextResponse.json({ jobs: jobsWithApplied });
            }
        } catch (dbErr) {
            console.warn("DB not reachable, returning demo fallback jobs:", dbErr);
        }

        // Return mock jobs if DB has no jobs or DB is not reachable
        let filteredJobs = MOCK_JOBS.map(job => ({ ...job, hasApplied: appliedJobIds.includes(job.id) }));
        if (type && type !== "all") {
            filteredJobs = filteredJobs.filter(j => j.type === type);
        }
        if (search) {
            filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes(search) || j.description.toLowerCase().includes(search));
        }
        if (location) {
            filteredJobs = filteredJobs.filter(j => j.location.toLowerCase().includes(location));
        }

        return NextResponse.json({ jobs: filteredJobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ jobs: MOCK_JOBS });
    }
}
