import React, { useEffect } from 'react';

const teamMembers = [
  { name: 'Dr. Evelyn Reed', role: 'Founder & Chief Educator', image: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Marcus Chen', role: 'Head of Web Development', image: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Aisha Khan', role: 'Lead Data Scientist', image: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Ben Carter', role: 'Cyber Security Expert', image: 'https://i.pravatar.cc/150?img=4' },
];

const About: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

  return (
    <div className="bg-white">
      {/* Our Mission */}
      <div className="bg-brand-light">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-navy">Our Mission</h2>
            </div>
            <div className="mt-8 lg:mt-0 lg:col-span-2">
              <p className="text-lg text-gray-600">
                Our mission is to bridge the gap between academia and industry. We empower students with practical, in-demand skills through hands-on projects, mentorship from seasoned professionals, and a curriculum that evolves with technology. We believe in learning by doing, fostering a community where innovation and collaboration thrive.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                At Mentor Institute, we're not just teaching code; we're building careers. We are committed to creating an inclusive and supportive environment where every student can achieve their full potential and become a leader in the tech world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="bg-white">
        <div className="mx-auto py-12 px-4 max-w-7xl sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-navy text-center">Meet Our Expert Team</h2>
            <ul role="list" className="space-y-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 lg:gap-y-12 lg:space-y-0">
              {teamMembers.map((person) => (
                <li key={person.name}>
                  <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 lg:gap-8">
                    <div className="h-0 aspect-w-3 aspect-h-2 sm:aspect-w-3 sm:aspect-h-4">
                      <img className="object-cover shadow-lg rounded-lg" src={person.image} alt={person.name} />
                    </div>
                    <div className="sm:col-span-2">
                      <div className="space-y-4">
                        <div className="text-lg leading-6 font-medium space-y-1">
                          <h3>{person.name}</h3>
                          <p className="text-brand-purple">{person.role}</p>
                        </div>
                        <div className="text-lg">
                          <p className="text-gray-500">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, cupiditate.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;