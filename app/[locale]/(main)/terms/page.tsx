import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, Users, CreditCard, Lock, Eye, Clock, CheckCircle, Mail, MapPin } from "lucide-react";
import { Section } from "@/app/_components/Section";

export default function TermsPage() {
  return (
    <Section className="py-16 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-purple-500/20 border-purple-500/30 text-purple-300 backdrop-blur-sm">
              <FileText className="w-5 h-5 mr-2" />
              Terms of Service
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid gap-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-purple-300">1. Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                By accessing and using the FYGS Learning Platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
              <p className="text-slate-300 leading-relaxed">
                These terms apply to all users of the platform, including visitors, registered students, and premium users.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-blue-50/20">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-blue-300">2. Service Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                FYGS Learning Platform is an online learning platform that offers training in modern web development, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Interactive video training
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Practical exercises and projects
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Personalized progress tracking
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Completion certificates
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Community support
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CreditCard className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-green-300">3. User Accounts and Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    3.1 Account Creation
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    To access certain features, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your credentials.
                  </p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-200 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" />
                    3.2 Eligibility
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    You must be at least 16 years old to use this service. If you are between 16 and 18 years old, you must obtain parental consent.
                  </p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-200 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-400" />
                    3.3 Acceptable Use
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    You agree to use the platform only for legal purposes and in accordance with these terms. It is prohibited to share your credentials or access content illegally.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="text-2xl text-yellow-300">4. Content and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-2">4.1 Content Ownership</h4>
                  <p className="text-slate-300 leading-relaxed">
                    All platform content (videos, text, exercises, source code) is protected by copyright and belongs to FYGS or its partners.
                  </p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-2">4.2 License of Use</h4>
                  <p className="text-slate-300 leading-relaxed">
                    We grant you a limited, non-exclusive, and non-transferable license to access content for personal learning purposes only.
                  </p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-2">4.3 Restrictions</h4>
                  <p className="text-slate-300 leading-relaxed">
                    It is strictly prohibited to copy, distribute, resell, or use the content for commercial purposes without written permission.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-30 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="text-2xl text-pink-300">5. Payments and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-2">5.1 Pricing</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Prices are displayed in euros including taxes. We reserve the right to change our prices with 30 days&apos; notice.
                  </p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-200 mb-2">5.2 Refund Policy</h4>
                  <p className="text-slate-300 leading-relaxed">
                    You have 14 days to request a full refund if you are not satisfied, provided you have not completed more than 20% of the content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="text-2xl text-red-300">6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                FYGS Learning Platform is provided &quot;as is&quot;. We do not guarantee that the service will be uninterrupted or error-free. Our liability is limited to the amount paid for the service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-70/50 pb-6">
              <CardTitle className="text-2xl text-indigo-300">7. Modifications to Terms</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Significant changes will be notified by email with 30 days&apos; notice.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-70/50 pb-6">
              <CardTitle className="text-2xl text-cyan-300">8. Contact</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-300 leading-relaxed mb-6">
                For any questions regarding these terms of service, contact us at:
              </p>
              <div className="space-y-3">
                <p className="font-medium text-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Email: fygs.dev@gmail.com
                </p>
                <p className="font-medium text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Address: France
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-12 bg-slate-700/50" />

        <div className="text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} FYGS Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </Section>
  );
}
