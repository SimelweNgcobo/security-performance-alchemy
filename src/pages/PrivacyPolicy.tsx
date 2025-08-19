import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Mail, Phone } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Privacy Policy
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: December 26, 2024
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-muted-foreground">
                    When you register for an account or place an order, we may collect:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Name and contact information</li>
                    <li>Email address and phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Usage Information</h3>
                  <p className="text-muted-foreground">
                    We automatically collect information about how you use our website:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>IP address and browser information</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Device and operating system information</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Custom Label Designs</h3>
                  <p className="text-muted-foreground">
                    When you create custom labels using our design tool, we store:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Design elements and configurations</li>
                    <li>Text content and images you upload</li>
                    <li>Design preferences and settings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Provision</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Process and fulfill your orders</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Send order confirmations and shipping updates</li>
                    <li>Manage your account and preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Communication</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Send important service announcements</li>
                    <li>Respond to enterprise quote requests</li>
                    <li>Provide technical support</li>
                    <li>Send promotional emails (with your consent)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Improvement and Analytics</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Analyze website usage and performance</li>
                    <li>Improve our products and services</li>
                    <li>Develop new features and functionality</li>
                    <li>Ensure website security and prevent fraud</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  How We Protect Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Security Measures</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>SSL encryption for all data transmission</li>
                    <li>Secure cloud storage with access controls</li>
                    <li>Regular security audits and updates</li>
                    <li>Payment processing through PCI-compliant providers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Access Controls</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Limited access to personal information</li>
                    <li>Employee training on data protection</li>
                    <li>Regular monitoring of data access</li>
                    <li>Secure authentication for staff accounts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:
                </p>
                
                <div>
                  <h3 className="font-semibold mb-2">Service Providers</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Payment processors for order transactions</li>
                    <li>Shipping companies for order fulfillment</li>
                    <li>Email service providers for communications</li>
                    <li>Cloud hosting providers for data storage</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Legal Requirements</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>When required by law or legal process</li>
                    <li>To protect our rights and property</li>
                    <li>To prevent fraud or security threats</li>
                    <li>With your explicit consent</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Management</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Access and update your personal information</li>
                    <li>Download your data in a portable format</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of promotional communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Cookie Preferences</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Manage cookie settings in your browser</li>
                    <li>Opt out of analytics tracking</li>
                    <li>Control targeted advertising preferences</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or how we handle your data, please contact us:
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">privacy@myfuze.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">+27 11 123 4567</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> This privacy policy is subject to change. We will notify you of any significant updates by email or through our website.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default PrivacyPolicy;
