import { Footer } from '@/components/shared/Footer'
import { Header } from '@/components/shared/Header'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read FreightIQ's terms and conditions for using our AI voice agent platform",
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Registration
          </Link>

          {/* Header */}
          <div className="bg-card rounded-3xl shadow-sm border border-border p-6 sm:p-8 md:p-10 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Terms and Conditions
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: March 29, 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-3xl shadow-sm border border-border p-6 sm:p-8 md:p-10 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to FreightIQ. By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
                Please read them carefully before creating an account or using our services. If you do not agree with any part 
                of these terms, you may not access or use our platform.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Account Registration</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  To use certain features of our platform, you must register for an account. When you register, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept all responsibility for activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p>
                  You must be at least 18 years old to create an account. By registering, you represent and warrant that you 
                  meet this age requirement.
                </p>
              </div>
            </section>

            {/* Use of Services */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Use of Services</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  You agree to use our platform only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the platform in any way that violates any applicable law or regulation</li>
                  <li>Impersonate or attempt to impersonate any person or entity</li>
                  <li>Engage in any conduct that restricts or inhibits anyone&apos;s use of the platform</li>
                  <li>Use any automated system to access the platform without our permission</li>
                  <li>Attempt to gain unauthorized access to any portion of the platform</li>
                  <li>Upload or transmit viruses, malware, or any other malicious code</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Intellectual Property Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                The platform and its entire contents, features, and functionality are owned by FreightIQ and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not 
                reproduce, distribute, modify, create derivative works of, publicly display, or exploit any of our content 
                without our express written permission.
              </p>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. User Content</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  You retain ownership of any content you submit to the platform. However, by submitting content, you grant 
                  us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content 
                  in connection with operating and providing the platform.
                </p>
                <p>
                  You represent and warrant that you own or have the necessary rights to all content you submit and that your 
                  content does not violate any third-party rights or applicable laws.
                </p>
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal 
                information. By using our platform, you consent to our collection and use of your information as described in 
                our Privacy Policy.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the platform immediately, without prior notice or 
                liability, for any reason, including if you breach these Terms. Upon termination, your right to use the 
                platform will immediately cease. All provisions of these Terms that by their nature should survive termination 
                shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express 
                or implied. We do not warrant that the platform will be uninterrupted, secure, or error-free, or that any 
                defects will be corrected.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, FreightIQ shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
                or any loss of data, use, goodwill, or other intangible losses resulting from your use of the platform.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If we make material 
                changes, we will notify you by updating the date at the top of these Terms and, where appropriate, provide 
                additional notice. Your continued use of the platform after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FreightIQ 
                operates, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Us</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="font-medium text-foreground">FreightIQ Support</p>
                  <p>Email: support@freightiq.com</p>
                  <p>Website: www.freightiq.com</p>
                </div>
              </div>
            </section>

            {/* Acceptance */}
            <section className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground italic">
                By creating an account and using our platform, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms and Conditions.
              </p>
            </section>
          </div>

          {/* Action Button */}
          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-6 py-3.5 text-sm rounded-2xl hover:bg-foreground/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={16} />
              Back to Registration
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
