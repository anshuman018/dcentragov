import React from 'react';
import { FileText, Building2, Truck, Utensils, Store, Wine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 'gst',
    icon: FileText,
    title: "GST Registration",
    titleHindi: "जीएसटी पंजीकरण",
    description: "Register for Goods & Services Tax with simplified documentation"
  },
  {
    id: 'iec',
    icon: Building2,
    title: "IEC Registration",
    titleHindi: "आईईसी पंजीकरण",
    description: "Import Export Code registration for international trade"
  },
  {
    id: 'shop',
    icon: Store,
    title: "Shop License",
    titleHindi: "दुकान लाइसेंस",
    description: "Obtain shop and establishment licenses easily"
  },
  {
    id: 'fssai',
    icon: Utensils,
    title: "FSSAI License",
    titleHindi: "एफएसएसएआई लाइसेंस",
    description: "Food safety certification and licensing"
  },
  {
    id: 'transport',
    icon: Truck,
    title: "Transport Permit",
    titleHindi: "परिवहन परमिट",
    description: "Vehicle permits for goods and passenger transport"
  },
  {
    id: 'liquor',
    icon: Wine,
    title: "Liquor License",
    titleHindi: "शराब लाइसेंस",
    description: "Complete liquor licensing and regulation compliance"
  }
];

const ServiceHighlights = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="block text-red-700">Essential Services</span>
          <span className="block text-2xl text-gray-600 mt-1">आवश्यक सेवाएं</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-orange-50 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {service.titleHindi}
                <span className="block text-lg text-gray-600">{service.title}</span>
              </h3>
              <p className="text-gray-600">{service.description}</p>
              <button 
                onClick={() => navigate(`/service/${service.id}`)}
                className="mt-4 text-orange-600 font-medium hover:text-orange-700 transition-colors"
              >
                Apply Now →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;