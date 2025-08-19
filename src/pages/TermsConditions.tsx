import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShoppingCart, Truck, CreditCard, AlertTriangle, Mail, Phone } from "lucide-react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Terms & Conditions
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Please read these terms carefully before using our services.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: December 26, 2024
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By accessing and using MyFuze website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p className="text-muted-foreground">
                  These terms apply to all visitors, users, and others who access or use our service, including enterprise customers and individual consumers.
                </p>
              </CardContent>
            </Card>

            {/* Products and Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Products and Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Product Offerings</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Premium water bottles in various sizes and materials</li>
                    <li>Custom label design and printing services</li>
                    <li>Enterprise and bulk order solutions</li>
                    <li>Accessories and replacement parts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Product Quality</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>All bottles are made from food-grade materials</li>
                    <li>Custom labels use high-quality, waterproof printing</li>
                    <li>Products meet international safety standards</li>
                    <li>We guarantee the quality of materials and workmanship</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Custom Design Services</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Label designs are created using our online design tool</li>
                    <li>You retain ownership of your original content and images</li>
                    <li>We reserve the right to refuse designs that violate our content policy</li>
                    <li>Final products may vary slightly from digital previews</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Orders and Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Orders and Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>All prices are displayed in South African Rand (ZAR)</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Volume discounts apply to bulk orders (500+ units)</li>
                    <li>Custom design fees may apply for complex projects</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Order Processing</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Orders are processed upon payment confirmation</li>
                    <li>Standard orders: 3-5 business days processing time</li>
                    <li>Custom orders: 2-3 weeks processing time</li>
                    <li>Enterprise orders: Timeline provided in quote</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Payment Terms</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Payment is required at the time of order</li>
                    <li>We accept major credit cards and bank transfers</li>
                    <li>Enterprise customers may be eligible for net-30 terms</li>
                    <li>All payments are processed securely through certified providers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Shipping and Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Shipping and Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Options</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Standard shipping: 3-7 business days</li>
                    <li>Express shipping: 1-2 business days</li>
                    <li>Bulk delivery: Arranged per enterprise agreement</li>
                    <li>Free shipping on orders over R1,000</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Delivery</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Delivery to most locations within South Africa</li>
                    <li>Signature may be required for high-value orders</li>
                    <li>Customers will receive tracking information via email</li>
                    <li>Failed delivery attempts may result in return to sender</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Risk of Loss</h3>
                  <p className="text-muted-foreground">
                    Risk of loss and title for products purchased pass to you upon delivery to the shipping address you provide.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Returns and Refunds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Returns and Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Return Policy</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Standard products: 30-day return policy</li>
                    <li>Custom products: Returns only for manufacturing defects</li>
                    <li>Products must be in original condition and packaging</li>
                    <li>Return shipping costs are customer's responsibility unless item is defective</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Refund Processing</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Refunds processed within 5-10 business days of receipt</li>
                    <li>Refunds issued to original payment method</li>
                    <li>Custom design fees are non-refundable</li>
                    <li>Shipping charges are non-refundable unless error was ours</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Damaged or Defective Items</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Report damaged items within 48 hours of delivery</li>
                    <li>Provide photos of damage for faster processing</li>
                    <li>We will replace or refund defective items at no cost</li>
                    <li>Manufacturing defects covered under our quality guarantee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Our Content</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>MyFuze brand, logos, and website content are our property</li>
                    <li>Design tools and templates remain our intellectual property</li>
                    <li>Unauthorized use of our content is prohibited</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Your Content</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>You retain ownership of your original designs and content</li>
                    <li>You grant us license to produce your designs on products</li>
                    <li>You are responsible for ensuring you have rights to all content used</li>
                    <li>We may refuse to print content that violates third-party rights</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  MyFuze shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>

                <div>
                  <h3 className="font-semibold mb-2">Maximum Liability</h3>
                  <p className="text-muted-foreground">
                    Our total liability to you for all damages shall not exceed the amount paid by you for the specific product or service that gave rise to the claim.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Force Majeure</h3>
                  <p className="text-muted-foreground">
                    We are not responsible for delays or failures due to circumstances beyond our control, including but not limited to natural disasters, government actions, or supply chain disruptions.
                  </p>
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
                  If you have questions about these Terms & Conditions, please contact us:
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">legal@myfuze.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">+27 11 123 4567</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> These terms and conditions are subject to change. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of any changes.
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

export default TermsConditions;
