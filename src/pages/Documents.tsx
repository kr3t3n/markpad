import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Edit3, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';

export function Documents() {
  const { documents, loading, error, remove } = useDocuments();
  const { user } = useAuth();
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    await remove(documentToDelete);
    toast.success('Document deleted successfully');
    setDocumentToDelete(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your documents</h2>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Documents</h1>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Document
        </Link>
      </div>

      <div className="grid gap-4">
        {documents.map(doc => (
          <div
            key={doc.id} 
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Link
              to={`/edit/${doc.id}`}
              className="block p-4 pr-24 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Link
                to={`/edit/${doc.id}`}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Edit3 size={20} />
              </Link>
              <button
                onClick={async () => {
                  setDocumentToDelete(doc.id);
                }}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No documents yet. Create your first one!
          </div>
        )}
      </div>
      
      <Modal
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
}