import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-[#052659] py-16 px-6 text-center text-white">
      <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
      <p className="text-blue-100 mb-8 max-w-md mx-auto">
        Log in to the staff portal or check your child's result right now.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/login"
          className=" bg-[#021024] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#c1e8ff] hover:text-primary transition"
        >
          Staff Login
        </Link>
        <Link
          href="/parent/login"
          className="border border-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-[#c1e8ff] transition"
        >
          Parent Portal
        </Link>
      </div>
    </section>
  );
}
