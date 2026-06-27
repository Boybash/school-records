const testimonials = [
  {
    name: "Mrs. Adaeze Okonkwo",
    role: "Parent of JSS 2 Student",
    image: "AO",
    comment:
      "Shalom Model College has been a blessing to our family. The level of dedication from the teachers is outstanding. My son's grades have improved significantly since he enrolled and his confidence has grown tremendously.",
  },
  {
    name: "Mr. Emeka Chukwu",
    role: "Parent of SS 1 Student",
    image: "EC",
    comment:
      "I love how transparent the school is with results. Through the parent portal I can check my daughter's performance anytime from anywhere. The school management system is very easy to use and very convenient.",
  },
  {
    name: "Mrs. Fatima Aliyu",
    role: "Parent of JSS 3 Student",
    image: "FA",
    comment:
      "The discipline and academic standard at Shalom Model College is top notch. My child came back home more focused and determined after enrolling. I highly recommend this school to every parent who wants the best for their child.",
  },
  {
    name: "Mr. Tunde Fashola",
    role: "Parent of SS 2 Student",
    image: "TF",
    comment:
      "What sets Shalom apart is the combination of academic excellence and moral values. My son not only performs well academically but has also developed strong character and leadership qualities.",
  },
  {
    name: "Mrs. Ngozi Eze",
    role: "Parent of JSS 1 Student",
    image: "NE",
    comment:
      "From the first day we visited the school we knew it was the right place for our daughter. The environment is safe, the teachers are caring and the results speak for themselves. We are very proud parents.",
  },
  {
    name: "Mr. Biodun Adeleke",
    role: "Parent of SS 3 Student",
    image: "BA",
    comment:
      "My son just finished his WAEC and scored distinctions in all his subjects. I credit this to the solid foundation Shalom Model College gave him. The teachers go above and beyond to ensure every student succeeds.",
  },
];

const colors = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-orange-500",
  "bg-red-500",
  "bg-teal-600",
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#021024] text-3xl font-semibold uppercase tracking-widest mb-4">
            Parent Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
            What Parents Are Saying
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Don't just take our word for it — hear directly from parents whose
            children are thriving at Shalom Model College.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className="bg-[#c1e8ff]/30 rounded-2xl p-6 shadow-sm  hover:shadow-md transition-transform duration-500 group-hover:scale-110 flex flex-col justify-between"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-[#021024] text-sm leading-relaxed mb-6">
                "{t.comment}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`${colors[index]} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0`}
                >
                  {t.image}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-gray-400 text-sm mt-10">
          Join hundreds of satisfied parents who trust Shalom Model College with
          their children's future.
        </p>
      </div>
    </section>
  );
}
