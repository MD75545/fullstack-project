import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { galleryItems } from '../data/mockData';
import ImageSlider from '../components/ImageSlider';

const GalleryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const item = galleryItems.find((i) => i.id === parseInt(id || ''));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!item) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-brand-navy">Event not found</h2>
        <Link to="/gallery" className="mt-4 inline-block text-brand-purple hover:underline">Back to Workshops</Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Banner Image */}
      <div className="h-64 md:h-80 bg-cover bg-center" style={{ backgroundImage: `url(${item.bannerImage})` }}>
        <div className="h-full w-full bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center px-4">{item.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 mb-8">{item.date}</p>
        
        <div className="mb-12">
          <ImageSlider images={item.images} />
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
            <h2 className="text-3xl font-bold text-brand-navy border-b-2 border-brand-purple pb-2">About the Event</h2>
            <p>{item.description}</p>
        </div>

        <div className="mt-12">
            <h3 className="text-2xl font-bold text-brand-navy mb-4">Technologies Covered</h3>
            <div className="flex flex-wrap gap-2">
                {item.technologies.map((tech) => (
                    <span key={tech} className="bg-brand-purple text-white px-3 py-1 text-sm font-semibold rounded-full">{tech}</span>
                ))}
            </div>
        </div>

        <div className="text-center mt-16">
            <Link to="/gallery" className="px-6 py-3 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors">
                &larr; Back to Workshops
            </Link>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetail;