'use client';

import React from 'react';
import { motion } from 'framer-motion';
import TemplateCard from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:px-6 lg:px-8 sm:py-16 lg:py-20">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            Report Templates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Build, preview, and send reports instantly.
          </p>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {TEMPLATES.map((template) => (
            <motion.div key={template.slug} variants={itemVariants}>
              <TemplateCard template={template} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
