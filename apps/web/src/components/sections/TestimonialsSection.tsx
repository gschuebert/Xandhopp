'use client';

import { Star, MapPin } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    location: "Singapore",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
    text: "Portalis made my move from San Francisco to Singapore incredibly smooth. The document management system saved me weeks of paperwork, and the local expert guidance was invaluable.",
    flag: "🇸🇬"
  },
  {
    name: "Marcus Rodriguez",
    role: "Marketing Director",
    location: "Barcelona",
    avatar: "/avatars/marcus.jpg",
    rating: 5,
    text: "I was overwhelmed by the visa process for Spain, but Portalis broke it down into manageable steps. The real-time updates kept me informed every step of the way.",
    flag: "🇪🇸"
  },
  {
    name: "Priya Patel",
    role: "Data Scientist",
    location: "Toronto",
    avatar: "/avatars/priya.jpg",
    rating: 5,
    text: "The cost calculator helped me budget accurately, and the community network connected me with other expats before I even arrived. Highly recommended!",
    flag: "🇨🇦"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Loved by thousands of
            <span className="block text-primary">successful relocators</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how Portalis has helped people from around the world 
            achieve their relocation dreams with confidence and ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-2xl shadow-soft hover:shadow-warm transition-all duration-300 transform hover:scale-105 border border-gray-100"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-700">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {testimonial.role}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{testimonial.flag} {testimonial.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
