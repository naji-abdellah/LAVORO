import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@jobportal.com" },
        update: {},
        create: {
            email: "admin@jobportal.com",
            password: adminPassword,
            role: "ADMIN",
        },
    });
    console.log("✅ Admin user created:", admin.email);

    // Create sample enterprise
    const enterprisePassword = await bcrypt.hash("company123", 10);
    const enterprise = await prisma.user.upsert({
        where: { email: "company@techcorp.com" },
        update: {},
        create: {
            email: "company@techcorp.com",
            password: enterprisePassword,
            role: "ENTERPRISE",
            enterpriseProfile: {
                create: {
                    companyName: "TechCorp Inc.",
                    description: "A leading technology company building innovative solutions.",
                    industry: "Technology",
                    location: "San Francisco, CA",
                },
            },
        },
    });
    console.log("✅ Enterprise created:", enterprise.email);

    // Get enterprise profile
    const enterpriseProfile = await prisma.enterpriseProfile.findUnique({
        where: { userId: enterprise.id },
    });

    // Create sample jobs
    if (enterpriseProfile) {
        const jobs = await Promise.all([
            prisma.jobOffer.upsert({
                where: { id: "job-1" },
                update: {},
                create: {
                    id: "job-1",
                    enterpriseId: enterpriseProfile.id,
                    title: "Senior React Developer",
                    description: "We are looking for an experienced React developer to join our team. You will work on building modern web applications using React, TypeScript, and Next.js.",
                    type: "CDI",
                    salary: "$120,000 - $150,000",
                    location: "San Francisco, CA",
                    requirements: JSON.stringify(["React", "TypeScript", "Next.js", "Node.js", "5+ years experience"]),
                },
            }),
            prisma.jobOffer.upsert({
                where: { id: "job-2" },
                update: {},
                create: {
                    id: "job-2",
                    enterpriseId: enterpriseProfile.id,
                    title: "Full Stack Engineer",
                    description: "Join our engineering team to build scalable web applications. You will work across the entire stack, from frontend to backend to infrastructure.",
                    type: "CDI",
                    salary: "$100,000 - $130,000",
                    location: "Remote",
                    requirements: JSON.stringify(["JavaScript", "Python", "PostgreSQL", "AWS", "Docker"]),
                },
            }),
            prisma.jobOffer.upsert({
                where: { id: "job-3" },
                update: {},
                create: {
                    id: "job-3",
                    enterpriseId: enterpriseProfile.id,
                    title: "UI/UX Designer",
                    description: "We need a talented designer to create beautiful user interfaces and improve user experience across our product suite.",
                    type: "CDD",
                    salary: "$80,000 - $100,000",
                    location: "New York, NY",
                    requirements: JSON.stringify(["Figma", "UI Design", "UX Research", "Prototyping"]),
                },
            }),
        ]);
        console.log("✅ Sample jobs created:", jobs.length);
    }

    // Create sample candidate
    const candidatePassword = await bcrypt.hash("candidate123", 10);
    const candidate = await prisma.user.upsert({
        where: { email: "john@developer.com" },
        update: {},
        create: {
            email: "john@developer.com",
            password: candidatePassword,
            role: "CANDIDATE",
            candidateProfile: {
                create: {
                    skills: JSON.stringify(["React", "TypeScript", "Node.js", "Python", "Docker"]),
                    bio: "Passionate full-stack developer with 5 years of experience building web applications.",
                    phone: "+1 555-1234",
                    address: "San Francisco, CA",
                },
            },
        },
    });
    console.log("✅ Candidate created:", candidate.email);

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📝 Test accounts:");
    console.log("   Admin:      admin@jobportal.com / admin123");
    console.log("   Enterprise: company@techcorp.com / company123");
    console.log("   Candidate:  john@developer.com / candidate123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
