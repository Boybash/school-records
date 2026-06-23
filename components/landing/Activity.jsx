export default function Activity() {
  const activities = [
    { image: "/shalom image 3.webp", title: "Culture Day" },
    { image: "/shalom image 4.webp", title: "Colour Day" },
    { image: "/shalom image 5.webp", title: "Competition Day" },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-primary text-lg font-extrabold uppercase tracking-widest px-3 py-1 mb-4">
            School Life
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
            Life at Shalom Model College
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Beyond the classroom, our students enjoy a rich and vibrant school
            life full of exciting activities and events.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="relative h-[400px]  rounded-md overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500" />

              {/* Title */}
              <div className="absolute inset-0 flex justify-center items-end p-6">
                <h1 className="text-white text-2xl font-extrabold text-center uppercase">
                  {activity.title}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
