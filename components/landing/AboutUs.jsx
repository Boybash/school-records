import Image from "next/image";
import { Fade, Slide } from "react-awesome-reveal";

export default function AboutUs() {
  return (
    <section id="about" className="py-20 px-6 bg-[#c1e8ff]/50">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-17">
        {/* Left — Text Content */}
        <div className="flex-1">
          {/* Section Tag */}
          <Fade cascade damping={0.12} triggerOnce>
            <span className="inline-block  text-primary text-lg font-extrabold uppercase tracking-widest  py-1 mb-4">
              About Us
            </span>
          </Fade>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#021024] leading-tight mb-6">
            Shaping Lives, Building{" "}
            <span className="text-[#052659]">Futures</span>
          </h2>

          <p className=" leading-relaxed mb-4">
            SchoolDesk Model College is a premier secondary school committed to
            providing quality education that nurtures academic excellence, moral
            integrity, and leadership skills in every student. Founded on the
            principles of discipline, innovation, and service, we have
            consistently produced outstanding graduates who go on to make
            meaningful contributions to society.
          </p>

          <p className=" leading-relaxed mb-6">
            Our school offers a dynamic learning environment where students are
            challenged to think critically, grow spiritually, and develop the
            skills needed to thrive in a rapidly changing world. With
            experienced and dedicated teachers, state-of-the-art facilities, and
            a rich extracurricular program, SchoolDesk Model College stands as a
            beacon of educational excellence.
          </p>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Fade cascade damping={0.08} triggerOnce>
              {[
                {
                  image: "/flag.png",
                  title: "Our Mission",
                  desc: "To provide holistic education that empowers students academically, morally, and socially.",
                },
                {
                  image: "/magnifying-glass-eye.png",
                  title: "Our Vision",
                  desc: "To be the leading model school producing well-rounded leaders for the next generation.",
                },
                {
                  image: "/benefit-diamond.png",
                  title: "Our Values",
                  desc: "Excellence, Integrity, Discipline, Innovation and Service to humanity.",
                },
                {
                  image: "/medal.png",
                  title: "Our Achievement",
                  desc: "Consistently outstanding WAEC results and award-winning extracurricular programs.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-7 h-7 mb-4 "
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      {item.title}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </Fade>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-6 border-t pt-6">
            <Fade cascade damping={0.05} triggerOnce>
              {[
                { value: "10+", label: "Years of Excellence" },
                { value: "500+", label: "Students Enrolled" },
                { value: "30+", label: "Qualified Teachers" },
                { value: "100%", label: "WAEC Pass Rate" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-[#052659]">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </Fade>
          </div>
        </div>

        {/* Right — Image */}
        <div className="flex-1 w-full">
          <Slide direction="up" delay={200} triggerOnce>
            <div className="relative w-full h-[500px] rounded-md overflow-hidden shadow-xl">
              <Image
                src="/studentImage.jpg"
                alt="SchoolDesk Model College"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="eager"
                priority
              />
              {/* Floating Card */}
              <Fade delay={600} triggerOnce>
                <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  <img
                    src="/shalomlogo.svg"
                    alt="Shalom logo"
                    className="w-16 h-16 shadow-sm"
                  />
                  <div>
                    <p className="font-bold text-primary uppercase text-sm">
                      SchoolDesk Model College
                    </p>
                    <p className="text-xs text-gray-400">
                      Excellence in Education
                    </p>
                  </div>
                </div>
              </Fade>
            </div>
          </Slide>
        </div>
      </div>
    </section>
  );
}
