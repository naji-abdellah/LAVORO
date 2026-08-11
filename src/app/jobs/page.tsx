import { Navbar } from "@/components/navbar";
import JobsList from "@/components/JobsList";

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; location?: string; search?: string }>;
}) {
    const params = await searchParams;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12 bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Job</h1>
                        <p className="mt-3 text-lg text-gray-600">Browse through hundreds of job opportunities</p>
                    </div>

                    <JobsList
                        initialType={params.type || ''}
                        initialLocation={params.location || ''}
                        initialSearch={params.search || ''}
                    />
                </div>
            </div>
        </div>
    );
}
