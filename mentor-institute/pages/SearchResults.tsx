import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { courses } from '../data/mockData';
import { galleryItems } from '../data/mockData';
import type { Course, GalleryItem } from '../types';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const courseResults: Course[] = query ? courses.filter(course =>
    course.title.toLowerCase().includes(query.toLowerCase()) ||
    course.description.toLowerCase().includes(query.toLowerCase())
  ) : [];

  const galleryResults: GalleryItem[] = query ? galleryItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  ) : [];
  
  const totalResults = courseResults.length + galleryResults.length;

  const resultsSummaryParts: string[] = [];
  if (courseResults.length > 0) {
      resultsSummaryParts.push(`${courseResults.length} course${courseResults.length !== 1 ? 's' : ''}`);
  }
  if (galleryResults.length > 0) {
      resultsSummaryParts.push(`${galleryResults.length} event${galleryResults.length !== 1 ? 's' : ''}`);
  }
  const resultsSummary = resultsSummaryParts.join(' and ');


  return (
    <div className="bg-brand-light py-12 min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">
          Search Results for "{query}"
        </h1>
        <p className="mt-2 text-lg text-gray-600">
            {totalResults > 0 ? `Found ${resultsSummary}.` : 'Found 0 results.'}
        </p>

        <div className="mt-10 space-y-10">
          {totalResults === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <p className="text-xl text-gray-500">No results found.</p>
              <Link to="/" className="mt-4 inline-block text-brand-purple hover:underline">
                Go back to Home
              </Link>
            </div>
          ) : (
            <>
              {courseResults.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-brand-navy border-b-2 border-brand-purple pb-2 mb-4">Courses ({courseResults.length})</h2>
                  <div className="space-y-6">
                    {courseResults.map(course => (
                      <div key={`course-${course.id}`} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-bold text-brand-navy">{course.title}</h3>
                        <p className="mt-2 text-gray-600">{course.description}</p>
                        <Link to="/courses" className="mt-4 inline-block text-brand-purple font-semibold hover:underline">
                          View Courses page &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {galleryResults.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-brand-navy border-b-2 border-brand-purple pb-2 mb-4">Workshops &amp; Events ({galleryResults.length})</h2>
                  <div className="space-y-6">
                    {galleryResults.map(item => (
                      <div key={`gallery-${item.id}`} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-bold text-brand-navy">{item.title}</h3>
                        <p className="mt-2 text-gray-600">{item.description}</p>
                        <Link to={`/gallery/${item.id}`} className="mt-4 inline-block text-brand-purple font-semibold hover:underline">
                          View Event Details &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;