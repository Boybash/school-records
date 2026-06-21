const stats = [
  { value: "100%", label: "Digital Records" },
  { value: "3", label: "Terms Supported" },
  { value: "CA + Exam", label: "Result Breakdown" },
  { value: "Instant", label: "PDF Downloads" },
  { value: "500", label: "Students Enrolled" },
  { value: "20", label: "Subjects" },
];

export default function Stats() {
  return (
    <section className="bg-white py-12 px-6 border-b-2 border-[#052659]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-6 gap-6 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-extrabold text-[#052659]">
              {stat.value}
            </p>
            <p className="text-[#021024] text-sm mt-1 font-semibold">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
