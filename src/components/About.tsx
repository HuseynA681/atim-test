import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface AboutProps {
  darkMode: boolean;
}

export default function About({ darkMode }: AboutProps) {
  const [aboutContent, setAboutContent] = useState({ title: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/about')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch about content');
        return res.json();
      })
      .then(data => setAboutContent(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  return (
    <div className={`p-8 rounded-3xl ${darkMode ? "bg-slate-900/50 border border-slate-800" : "bg-white border border-slate-200"} space-y-4`}>
      <ReactMarkdown className="prose dark:prose-invert max-w-none">
        {aboutContent.text}
      </ReactMarkdown>
    </div>
  );
}