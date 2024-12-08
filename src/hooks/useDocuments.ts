import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserDocuments, createDocument, updateDocument, deleteDocument } from '../lib/database';
import type { Document } from '../types/database';

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await getUserDocuments(user.id);
    
    if (error) {
      setError(error.message);
    } else {
      setDocuments(data || []);
      setError(null);
    }
    
    setLoading(false);
  };

  const create = async (title: string, content: string) => {
    if (!user) return null;
    
    const { data, error } = await createDocument(user.id, title, content);
    
    if (error) {
      setError(error.message);
      return null;
    }
    
    setDocuments(prev => [data!, ...prev]);
    return data;
  };

  const update = async (id: string, title: string, content: string) => {
    const { data, error } = await updateDocument(id, { title, content });
    
    if (error) {
      setError(error.message);
      return;
    }
    
    setDocuments(prev => 
      prev.map(doc => doc.id === id ? data! : doc)
    );
  };

  const remove = async (id: string) => {
    const { error } = await deleteDocument(id);
    
    if (error) {
      setError(error.message);
      return;
    }
    
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return {
    documents,
    loading,
    error,
    create,
    update,
    remove,
    refresh: loadDocuments
  };
}