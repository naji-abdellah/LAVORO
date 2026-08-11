import { Sidebar } from "@/components/sidebar";

export default function EnterpriseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar role="enterprise" />
            <main className="lg:ml-72 min-h-screen">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
