import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database, Mail, Cookie, User, Key, Globe, BarChart } from "lucide-react";
import { Section } from "@/app/_components/Section";

export const metadata: Metadata = {
  title: "Privacy Policy | FYGS Learning Platform",
  description: "Privacy policy for the FYGS Learning Platform",
};

export default function PrivacyPage() {
  return (
    <Section className="py-16 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-purple-500/20 border-purple-500/30 text-purple-300 backdrop-blur-sm">
              <Shield className="w-5 h-5 mr-2" />
              Privacy Policy
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid gap-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-blue-50/20">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-blue-300">1. Introduction</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                At FYGS Learning Platform, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information.
              </p>
              <p className="text-slate-300 leading-relaxed">
                This policy applies to all services provided by FYGS Learning Platform and is compliant with the General Data Protection Regulation (GDPR).
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Database className="w-6 h-6 text-green-40" />
                </div>
                <span className="text-green-30">2. Data We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    2.1 Identification Information
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                    <li>Name and surname</li>
                    <li>Email address</li>
                    <li>Profile photo (optional)</li>
                    <li>Social network login information</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-3 flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-blue-400" />
                    2.2 Learning Data
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                    <li>Course progress</li>
                    <li>Exercise and quiz results</li>
                    <li>Time spent on the platform</li>
                    <li>Learning preferences</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    2.3 Technical Data
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                    <li>IP address</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and session duration</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-yellow-50/20">
                  <Lock className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-yellow-30">3. How We Use Your Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    3.1 Service Provision
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                    <li>Create and manage your user account</li>
                    <li>Provide access to courses and content</li>
                    <li>Track your learning progress</li>
                    <li>Issue completion certificates</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-200 mb-3 flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-blue-400" />
                    3.2 Service Improvement
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                    <li>Analyze platform usage</li>
                    <li>Personalize your learning experience</li>
                    <li>Develop new features</li>
                    <li>Resolve technical issues</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-200 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-400" />
                    3.3 Communication
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                    <li>Send important notifications</li>
                    <li>Respond to your questions and requests</li>
                    <li>Inform about new courses (with your consent)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Cookie className="w-6 h-6 text-pink-400" />
                </div>
                <span className="text-pink-300">4. Cookies and Tracking Technologies</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-3 flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-purple-400" />
                    4.1 Types of Cookies
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                    <li><strong>Essential cookies:</strong> Necessary for site functionality</li>
                    <li><strong>Performance cookies:</strong> Analyze site usage</li>
                    <li><strong>Preference cookies:</strong> Remember your settings</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-lg text-slate-20 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    4.2 Cookie Management
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    You can manage your cookie preferences in your browser settings. Please note that disabling certain cookies may affect the functionality of the platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="text-2xl text-cyan-300">5. Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                We never sell your personal data. We may share your information only in the following cases:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                <li>With your explicit consent</li>
                <li>With our service providers (hosting, payment, analytics)</li>
                <li>To comply with our legal obligations</li>
                <li>To protect our rights and those of our users</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="text-2xl text-indigo-300">6. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                We implement appropriate security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access management</li>
                <li>Continuous monitoring and intrusion detection</li>
                <li>Regular backups and recovery plans</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="text-2xl text-red-300">7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                In accordance with GDPR, you have the following rights:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-slate-200">Right of access</h4>
                  <p className="text-sm text-slate-300">Consult your personal data</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-slate-200">Right to rectification</h4>
                  <p className="text-sm text-slate-30">Correct your information</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-slate-200">Right to erasure</h4>
                  <p className="text-sm text-slate-300">Delete your data</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="font-semibold text-slate-20">Right to portability</h4>
                  <p className="text-sm text-slate-300">Retrieve your data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="text-2xl text-orange-300">8. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                We retain your personal data only as long as necessary for the purposes for which it was collected:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                <li><strong>Account data:</strong> As long as your account is active</li>
                <li><strong>Learning data:</strong> 3 years after last activity</li>
                <li><strong>Billing data:</strong> 10 years (legal obligations)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-purple-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <Mail className="w-6 h-6 text-teal-400" />
                </div>
                <span className="text-teal-300">9. Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-300 leading-relaxed mb-4">
                To exercise your rights or for any questions regarding this privacy policy:
              </p>
              <div className="space-y-3">
                <p className="font-medium text-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Email: fygs.dev@gmail.com
                </p>
                <p className="font-medium text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  Subject: &quot;Data Protection&quot;
                </p>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                We commit to responding to your requests within 30 days.
              </p>
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
