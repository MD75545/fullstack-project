import React, { useState, useEffect } from 'react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formState);
    // Here you would typically handle form submission, e.g., send data to a server
    setIsSubmitted(true);
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-brand-light">
      <div className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Contact Form */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-brand-navy mb-6">Send a Message</h2>
                {isSubmitted ? (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Thank you!</p>
                    <p>Your message has been sent successfully. We will be in touch shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input type="text" name="name" id="name" required value={formState.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input type="email" name="email" id="email" required value={formState.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                      <textarea id="message" name="message" rows={4} required value={formState.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"></textarea>
                    </div>
                    <div>
                      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple">
                        Send Message
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-brand-navy text-white p-8">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong>Address:</strong><br/>
                    123 Tech Avenue, Innovation Park,<br/>
                    Navi Mumbai, Maharashtra, 400703<br/>
                    India
                  </p>
                  <p>
                    <strong>Phone:</strong><br/>
                    +91 98765 43210
                  </p>
                  <p>
                    <strong>Email:</strong><br/>
                    info@mentorinstitute.tech
                  </p>
                  <p>
                    <strong>Hours:</strong><br/>
                    Mon - Fri: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
          
           {/* Map Section */}
           <div className="mt-12 bg-white rounded-lg shadow-xl overflow-hidden">
            <h2 className="text-2xl font-bold text-brand-navy p-6 sm:p-8 border-b">Our Location</h2>
            <div>
                 <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60351.24151785535!2d72.98188167823429!3d19.02131016892551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c3f50821899b%3A0x42f7c2f582f354b6!2sNerul%2C%20Navi%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mentor Institute Location in Nerul, Navi Mumbai"
                 ></iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;