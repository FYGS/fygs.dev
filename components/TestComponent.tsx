"use client";
import { useIntlayer } from "next-intlayer";
import Link from "next/link";
import React from "react";

export const TestComponent = () => {
  const content = useIntlayer("test");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <nav className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              {content.navigation.home}
            </Link>
            <div className="text-sm text-gray-300">
              {content.currentLanguage}: {content.language.english}
            </div>
          </nav>

          <h1 className="text-4xl font-bold text-white mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-gray-300">
            {content.description}
          </p>
        </header>

        {/* Main Content */}
        <main className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {content.content.heading}
            </h2>
            <p className="text-gray-300 mb-6">
              {content.content.body}
            </p>

            <ul className="space-y-2">
              {content.content.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 p-6 bg-blue-900/20 rounded-lg border border-blue-800">
            <h3 className="font-semibold text-blue-200 mb-2">
              {content.welcome}
            </h3>
            <p className="text-blue-300">
              This page is fully internationalized using intlayer. Try changing
              the language in the URL to see the content update!
            </p>
          </div>
        </main>

        {/* Language Switcher */}
        <section className="bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {content.languageSwitcher}
          </h2>
          <p className="text-gray-300 mb-6">
            {content.currentLanguage}:{" "}
            <span className="font-semibold">{content.language.french}</span>
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/en/test"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {content.language.english}
            </Link>
            <Link
              href="/fr/test"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {content.language.french}
            </Link>
            <Link
              href="/es/test"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {content.language.spanish}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
