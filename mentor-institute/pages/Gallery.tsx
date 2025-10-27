import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { galleryItems } from '../data/mockData';

const Gallery: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-brand-light">
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
                {galleryItems.map((item) => (
                    <div key={item.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="flex-shrink-0">
                            <img className="h-48 w-full object-cover" src={item.bannerImage} alt={item.title} />
                        </div>
                        <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-brand-purple">
                                    {item.date}
                                </p>
                                <Link to={`/gallery/${item.id}`} className="block mt-2">
                                    <p className="text-xl font-semibold text-gray-900">{item.title}</p>
                                    <p className="mt-3 text-base text-gray-500">{item.description.substring(0, 120)}...</p>
                                </Link>
                            </div>
                            <div className="mt-6 flex items-center">
                                <Link to={`/gallery/${item.id}`} className="text-base font-semibold text-brand-purple hover:text-brand-navy">
                                    Read more &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;