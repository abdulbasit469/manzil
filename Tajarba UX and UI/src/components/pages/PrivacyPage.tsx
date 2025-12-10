import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';

export function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f3a] via-[#1e3a5f] to-[#2d4a6f]">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={manzilLogo} alt="Manzil Logo" className="w-12 h-12" />
            <span className="text-white text-2xl">MANZIL</span>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="bg-white text-[#1e3a5f] hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-2xl"
        >
          <h1 className="text-4xl mb-6 text-[#1e3a5f]">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: December 5, 2025</p>

          <div className="space-y-6 text-slate-700">
            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">1. Information We Collect</h2>
              <p className="mb-3">
                At MANZIL, we collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create an account and register for our services</li>
                <li>Complete career assessments and mock tests</li>
                <li>Browse universities and save preferences</li>
                <li>Participate in community forums</li>
                <li>Contact our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">2. How We Use Your Information</h2>
              <p className="mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience and provide tailored recommendations</li>
                <li>Send you updates about universities and educational opportunities</li>
                <li>Analyze usage patterns to enhance platform functionality</li>
                <li>Protect against fraudulent or unauthorized activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>With your consent or at your direction</li>
                <li>With universities you express interest in (with your permission)</li>
                <li>To comply with legal obligations</li>
                <li>To protect the rights and safety of MANZIL and our users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">5. Your Rights</h2>
              <p className="mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience, analyze site traffic,
                and understand where our visitors are coming from. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">7. Children&rsquo;s Privacy</h2>
              <p>
                Our services are intended for students aged 13 and older. We do not knowingly collect personal
                information from children under 13. If you believe we have collected such information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-slate-100 rounded-lg">
                <p>Email: privacy@manzil.edu.pk</p>
                <p>Phone: +92 300 1234567</p>
                <p>Address: Islamabad, Pakistan</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
