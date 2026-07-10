import { Slide, Fade } from "react-awesome-reveal";

const features = [
  {
    icon: "/graduation-cap.png",
    title: "Student Management",
    desc: "Add, edit and manage student records with matric numbers, class and gender information.",
  },
  {
    icon: "/result.png",
    title: "Result Entry",
    desc: "Teachers enter CA and Exam scores separately. Totals and grades are calculated automatically.",
  },
  {
    icon: "/checkbox.png",
    title: "Result Approval",
    desc: "Admin reviews and approves results before they are visible to parents. Full control over data.",
  },
  {
    icon: "/sheet.png",
    title: "PDF Result Sheets",
    desc: "Generate and download professional result sheets with school logo, position and grade summary.",
  },
  {
    icon: "/family.png",
    title: "Parent Portal",
    desc: "Parents log in with their child's matric number and surname to view results anytime.",
  },
  {
    icon: "/upload.png",
    title: "Bulk Upload",
    desc: "Upload results for an entire class at once using an Excel template. Saves hours of manual entry.",
  },
];

export default function Features() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Fade>
          <h2 className="text-4xl uppercase font-extrabold text-center text-[#021024] tracking-widest mb-4">
            Everything You Need
          </h2>
          <p className="text-center text-[#021024] mb-12 max-w-xl mx-auto">
            Built specifically for our secondary school students to simplify
            academic record keeping.
          </p>
        </Fade>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Slide direction="up" cascade damping={0.1} triggerOnce>
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#052659] rounded-md p-10  hover:shadow-md transition text-white"
              >
                <img
                  className="w-13 h-13 mb-3 bg-white p-1 rounded-4xl"
                  src={feature.icon}
                  alt={feature.title}
                />
                <h3 className="text-lg font-semibold  mt-3 mb-2 uppercase">
                  {feature.title}
                </h3>
                <p className=" text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </Slide>
        </div>
      </div>
    </section>
  );
}
