import { Fade, Slide } from "react-awesome-reveal";

const steps = [
  {
    step: "01",
    title: "Admin Sets Up",
    desc: "Admin adds students, subjects and creates teacher accounts with assigned classes.",
  },
  {
    step: "02",
    title: "Teachers Upload Results",
    desc: "Teachers enter or bulk upload CA and exam scores for their assigned subjects and classes.",
  },
  {
    step: "03",
    title: "Parents Check Results",
    desc: "Parents log in with their child's matric number and surname to view and download result sheets.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-white">
      <Fade>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 uppercase tracking-wide text-[#021024]">
            How It Works
          </h2>
          <p className="text-center text-[#021024] mb-12 max-w-xl mx-auto">
            Simple and straightforward for both staff and parents.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Slide direction="up" cascade damping={0.1} triggerOnce>
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#021024] text-white flex items-center justify-center text-xl font-extrabold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#021024] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#021024] text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </Slide>
          </div>
        </div>
      </Fade>
    </section>
  );
}
