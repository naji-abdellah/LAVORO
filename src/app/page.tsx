import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { getJobs } from "@/actions/jobs";
import {
  Briefcase,
  Users,
  Building2,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Rocket
} from "lucide-react";

export default async function HomePage() {
  const { jobs } = await getJobs();
  const latestJobs = jobs.slice(0, 6);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden animated-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />

        {/* Floating elements */}
        <div className="absolute top-40 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              Advanced Recruitment Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Elevate Your{" "}
              <span className="gradient-text">Career</span>{" "}
              Today
            </h1>

            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Launch your future with LAVORO. Connect with leading companies and discover
              opportunities that match your ambitions.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-lg"
              >
                Browse Jobs
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">5K+</div>
                <div className="text-gray-600 mt-1">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">2K+</div>
                <div className="text-gray-600 mt-1">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">50K+</div>
                <div className="text-gray-600 mt-1">Candidates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Choose LAVORO?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We leverage advanced technology to connect talent with opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-600">
                Our AI-powered algorithm matches candidates with jobs based on skills, experience, and preferences.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Companies</h3>
              <p className="text-gray-600">
                All companies are verified to ensure a safe and trustworthy job search experience.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Career Growth</h3>
              <p className="text-gray-600">
                Access resources and opportunities that help you advance your career to the next level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Latest Job Openings</h2>
              <p className="mt-2 text-gray-600">Discover the newest opportunities from top companies</p>
            </div>
            <Link
              href="/jobs"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.type === "CDI"
                      ? "bg-green-100 text-green-700"
                      : job.type === "CDD"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-purple-100 text-purple-700"
                      }`}>
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{job.enterprise.companyName}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.salary}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-6">Be the first to post a job opportunity!</p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Post a Job
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Launch Your Future?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals and companies who trust LAVORO for their recruitment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-lg"
            >
              <Users className="w-5 h-5" />
              I&apos;m a Candidate
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500/20 text-white border border-white/30 font-semibold rounded-xl hover:bg-blue-500/30 transition-all text-lg"
            >
              <Building2 className="w-5 h-5" />
              I&apos;m a Company
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-8 md:mb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/lavoro-logo-white.png"
                alt="LAVORO"
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-white tracking-wider" style={{ letterSpacing: '0.1em' }}>LAVORO</span>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} LAVORO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
