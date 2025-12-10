import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';

export function TermsPage() {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
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
          <h1 className="text-4xl mb-6 text-[#1e3a5f]">Terms of Service</h1>
          <p className="text-slate-600 mb-8">Last updated: December 5, 2025</p>

          <div className="space-y-6 text-slate-700">
            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">1. Acceptance of Terms</h2>
              <p>
                By accessing and using MANZIL (&ldquo;the Platform&rdquo;), you accept and agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">2. Use of Services</h2>
              <p className="mb-3">
                MANZIL provides educational resources, university information, career assessments, and mock tests
                for Pakistani students. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Platform only for lawful purposes</li>
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not impersonate others or provide false information</li>
                <li>Not engage in any activity that disrupts or interferes with the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the security of your account and for all activities that occur
                under your account. You must immediately notify us of any unauthorized use of your account or any
                other breach of security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">4. Intellectual Property</h2>
              <p className="mb-3">
                All content on MANZIL, including but not limited to text, graphics, logos, images, and software,
                is the property of MANZIL or its content suppliers and is protected by copyright and intellectual
                property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative works of any content without our
                express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">5. User Content</h2>
              <p className="mb-3">
                By posting content on MANZIL (such as forum posts or reviews), you grant us a non-exclusive,
                worldwide, royalty-free license to use, reproduce, and display that content in connection with
                the Platform.
              </p>
              <p>
                You retain all rights to your content and are responsible for ensuring that your content does not
                violate any laws or infringe on the rights of others.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">6. Disclaimers</h2>
              <p className="mb-3">
                MANZIL provides information about universities and educational opportunities, but:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We do not guarantee admission to any educational institution</li>
                <li>Career assessment results are for guidance purposes only</li>
                <li>University information may change without notice</li>
                <li>Mock test scores do not guarantee actual exam performance</li>
                <li>The Platform is provided &ldquo;as is&rdquo; without warranties of any kind</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MANZIL shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of or related to your use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">8. Community Guidelines</h2>
              <p className="mb-3">
                When participating in MANZIL&rsquo;s community features, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be respectful and courteous to other users</li>
                <li>Not post offensive, discriminatory, or harmful content</li>
                <li>Not spam or post promotional content without permission</li>
                <li>Not share false or misleading information</li>
                <li>Respect the privacy of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time, with or without notice,
                for violating these Terms of Service or for any other reason we deem appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">10. Changes to Terms</h2>
              <p>
                We may modify these Terms of Service at any time. We will notify you of any material changes by
                posting the updated terms on this page. Your continued use of the Platform after such changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">11. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of Pakistan.
                Any disputes shall be subject to the exclusive jurisdiction of the courts of Pakistan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl mb-3 text-[#1e3a5f]">12. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-slate-100 rounded-lg">
                <p>Email: support@manzil.edu.pk</p>
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
