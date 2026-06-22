const stats = [
  { value: "CA + Exam", label: "Result Breakdown" },
  { value: "100%", label: "Digital Records" },
  { value: "Instant", label: "PDF Downloads" },
  { value: "500", label: "Students Enrolled" },
  { value: "20", label: "Subjects" },
  { value: "3", label: "Terms Supported" },
];

const offers = [
  {
    title: "academics activities",
    description:
      "Shalom Model College is made up of the junior secondary schools and senior secondary schools as well as its leadership programmes.",
    image: "/graduation-cap.png",
  },
  {
    title: "school life",
    description:
      "Our students are involved in a wide range of extracurricular activities without compromising their exceptional academic performance.",
    image: "/people-roof.png",
  },
  {
    title: "leadership training",
    description:
      "We provide an extensive array of leadership opportunities, including involvement in communities service for all students.To shape future of our student.",
    image: "/medal.png",
  },
];

export default function Stats() {
  return (
    <section className="bg-white py-12 px-6 border-b-2 border-[#052659]">
      <h1 className="uppercase text-center tracking-widest text-4xl font-bold text-[#021024]">
        What We Offer
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-16 items-start max-w-7xl mx-auto">
        {offers.map((offer) => (
          <div
            key={offer.id || offer.title} // Prefers id, falls back to title if unique
            className="flex flex-col gap-2 justify-center text-left bg-[#c1e8ff]/50 p-6 rounded-md hover:shadow-md transition"
          >
            <img
              src={offer.image}
              alt={offer.title}
              className="w-12 h-12 mb-4 object-contain" // Changed to standard w-12/h-12
            />
            <h3 className="text-[#052659] mb-2 uppercase text-2xl font-semibold text-left">
              {offer.title}
            </h3>
            <p className="text-[#021024] text-lg">{offer.description}</p>
          </div>
        ))}
      </div>
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
