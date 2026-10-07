import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import Card from '../components/common/Card';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 border border-purple-500/30">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested institutional record or portal view does not exist or has been relocated.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </Card>
    </div>
  );
}
