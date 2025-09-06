import { PortalisLogo } from "../../components/portalis-logo";
import { Button } from "@portalis/ui";
import Link from "next/link";

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <PortalisLogo size="sm" />
            <span className="text-xl font-bold text-amber-900">PORTALIS</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-amber-800 hover:text-amber-900 font-medium transition-colors">Services</a>
            <a href="#" className="text-amber-800 hover:text-amber-900 font-medium transition-colors">About</a>
            <a href="#" className="text-amber-800 hover:text-amber-900 font-medium transition-colors">Contact</a>
          </div>
          <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white">
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <PortalisLogo size="xl" className="drop-shadow-lg" />
            </div>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-amber-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience seamless global relocation services with our comprehensive platform. 
              Connect with trusted partners and make your perfect move anywhere in the world.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-200"
              >
                Discover More
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/30 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-4">Global Network</h3>
                <p className="text-amber-800">Connect with trusted partners worldwide for seamless relocations.</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-4">Trusted Service</h3>
                <p className="text-amber-800">Verified providers and comprehensive support throughout your journey.</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-4">Fast & Efficient</h3>
                <p className="text-amber-800">Streamlined processes to get you settled in your new destination quickly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="py-20">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold text-amber-900 mb-6">
              Ready to make your move?
            </h2>
            <p className="text-xl text-amber-800 mb-8">
              Join thousands of satisfied customers who trusted Portalis with their global relocation.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <PortalisLogo size="sm" />
                <span className="text-2xl font-bold">PORTALIS</span>
              </div>
              <p className="text-amber-200 max-w-md">
                Your trusted partner for seamless global relocations. 
                Making your perfect move worldwide, one journey at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-amber-200">
                <li><a href="#" className="hover:text-white transition-colors">Corporate Relocation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Individual Moves</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Visa Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-amber-200">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-800 mt-8 pt-8 text-center text-amber-300">
            <p>&copy; 2024 Portalis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}