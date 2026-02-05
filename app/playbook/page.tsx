'use client';

import React from 'react';
import Link from 'next/link';

const RELATED_REPORTS = [
  { label: 'Daily Batch Re-runs', href: '/reports/batch-reruns' },
  { label: 'Manual Rebills', href: '/reports/manual-rebills' },
  { label: 'Mint Additional Sales', href: '/reports/mint-additional-sales' },
  { label: 'Hourly Approval Rate', href: '/reports/hourly-approval-rate' },
  { label: 'XSHIELD MID Performance Report', href: '/reports/xshield-hourly-approval' },
];

const RESPONSIBILITIES = [
  {
    title: 'Daily Operational Monitoring',
    description: 'Track daily revenue health, approval rates, and system performance across core flows.',
    actions: [
      'Review daily approval rate and declines by processor',
      'Validate traffic health and alert on anomalies',
      'Confirm critical dashboards and integrations are online',
    ],
  },
  {
    title: 'Fulfillment & Order Integrity',
    description: 'Ensure orders are fulfilled on time and reconcile any stuck or failed flows.',
    actions: [
      'Identify failed fulfillments and stalled orders',
      'Coordinate with fulfillment vendors for resolution',
      'Escalate recurring issues with root-cause notes',
    ],
  },
  {
    title: 'Payment Operations & Approval Rate Optimization',
    description: 'Optimize routing to maximize approvals while minimizing declines and risk exposure.',
    actions: [
      'Monitor hourly approval rate movement by MID',
      'Adjust routing for underperforming MIDs',
      'Track performance shifts after configuration changes',
    ],
  },
  {
    title: 'Rebill & Subscription Health',
    description: 'Maintain a steady rebill profile and rapidly address rebill failures.',
    actions: [
      'Track rebill success rates and failure reasons',
      'Review retry strategies and cadence',
      'Report rebill performance trends and anomalies',
    ],
  },
  {
    title: 'Fraud Detection & Risk Management',
    description: 'Reduce chargebacks and fraud while protecting approval rates.',
    actions: [
      'Monitor fraud flags and velocity patterns',
      'Coordinate with risk team on emerging threats',
      'Track fraud-related decline reasons',
    ],
  },
  {
    title: 'Refunds & Chargeback Prevention',
    description: 'Minimize revenue loss through proactive refund and chargeback mitigation.',
    actions: [
      'Review refund volume and root causes',
      'Spot abnormal spikes by offer or funnel',
      'Recommend process fixes to reduce disputes',
    ],
  },
  {
    title: 'Reporting & Performance Insights',
    description: 'Deliver accurate, timely reporting that supports operational decisions.',
    actions: [
      'Send daily ops reports and approval rate updates',
      'Highlight deviations from historical baselines',
      'Capture action items for follow-up',
    ],
  },
  {
    title: 'Affiliate & Monetization Support',
    description: 'Support affiliate flows and ensure monetization operations stay healthy.',
    actions: [
      'Monitor affiliate performance shifts and anomalies',
      'Validate tracking and attribution integrity',
      'Surface routing or conversion issues quickly',
    ],
  },
  {
    title: 'Launch & Lander Support',
    description: 'Support new offer launches, landers, and routing changes with diligence.',
    actions: [
      'Validate new flows in pre-launch checks',
      'Monitor launch-day performance and issues',
      'Document changes and outcomes for learning',
    ],
  },
  {
    title: 'Tools, Systems & Process Improvement',
    description: 'Maintain reliability of core ops tools and improve operating procedures.',
    actions: [
      'Track tool reliability and escalation paths',
      'Recommend automation opportunities',
      'Document recurring issues and fixes',
    ],
  },
];

function ResponsibilityCard({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: string[];
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Key Operational Actions
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Related Reports & Templates
        </p>
        <div className="flex flex-wrap gap-2">
          {RELATED_REPORTS.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {report.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaybookDemoCard({
  title,
  description,
  ctaLabel,
  href,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors w-fit"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-4.197-2.4A1 1 0 009 9.63v4.74a1 1 0 001.555.832l4.197-2.4a1 1 0 000-1.694z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {ctaLabel}
      </a>
    </div>
  );
}

export default function PlaybookPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100">
            Ecom OPS PlayBook
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
            Authoritative guidance for daily ecommerce operations, reporting, and performance response.
          </p>
        </header>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Responsibilities Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {RESPONSIBILITIES.map((item) => (
              <ResponsibilityCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Operations Playbook & Demos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlaybookDemoCard
              title="Failed Fulfillment Playbook"
              description="Guide for identifying and resolving failed or stuck fulfillments."
              ctaLabel="Watch Failed Fulfillment Demo"
              href="https://mintads-my.sharepoint.com/:v:/p/chris/IQAfwsOv4qmyTKfzYgvNFJFVAbQlyes2Irj1-zuCiaDLDJg?e=3rCbhX"
            />
            <PlaybookDemoCard
              title="Rebill Health Management Demo"
              description="Demonstration of monitoring rebill performance and responding to rebill failures."
              ctaLabel="Watch Rebill Health Demo"
              href="https://mintads-my.sharepoint.com/:v:/p/chris/IQBFEMkwc4b9QKhQ_se134NwAXOm9527ix4VP3hzS5CEI50?e=Nc05bx"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
