import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import Card from '../components/common/Card';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#D64550]/10 border border-[#D64550]/20 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#D64550]" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold text-[#14141B] dark:text-[#ECECF1] mb-1.5">Page Not Found</h2>
        <p className="text-xs text-[#70707E] dark:text-[#6B6B7B] mb-5">
          The requested institutional record or portal view does not exist or has been relocated.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] transition-colors"
        >
          <Home className="w-4 h-4" strokeWidth={1.5} />
          <span>Return to Dashboard</span>
        </Link>
      </Card>
    </div>
  );
}
