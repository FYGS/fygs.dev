import { escapeHtml } from "@/lib/html-escape";

export interface EmailTemplateProps {
  userName: string;
  siteUrl?: string;
}

export interface CourseTemplateProps extends EmailTemplateProps {
  courseTitle: string;
  courseSlug: string;
  coursePrice?: number;
}

export interface SubscriptionTemplateProps extends EmailTemplateProps {
  planName: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  nextBillingDate?: string;
}

export interface PasswordChangeTemplateProps extends EmailTemplateProps {
  changeDate: string;
  ipAddress?: string;
}

// Base email template with modern design
export const createBaseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .content p {
            margin-bottom: 16px;
            color: #4b5563;
            font-size: 16px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features-list {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features-list ul {
            list-style: none;
        }
        .features-list li {
            padding: 8px 0;
            position: relative;
            padding-left: 24px;
        }
        .features-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .highlight {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-left: 4px solid #667eea;
            padding: 16px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container { margin: 0 10px; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .content h2 { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div style="padding: 20px 0;">
        <div class="container">
            ${content}
        </div>
    </div>
</body>
</html>
`;
