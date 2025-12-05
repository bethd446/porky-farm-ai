import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pig, PigStatus, PigSex } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UsepigsOptions {
  status?: PigStatus;
  search?: string;
}

export function usePigs(options: UsepigsOptions = {}) {
  const [pigs, setPigs] = useState<Pig[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPigs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('pigs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.search) {
        query = query.ilike('tag_number', `%${options.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Parse weight_history from JSON
      const parsedPigs = (data || []).map(pig => ({
        ...pig,
        weight_history: pig.weight_history || [],
      })) as Pig[];

      setPigs(parsedPigs);
    } catch (error) {
      console.error('Error fetching pigs:', error);
      toast.error('Erreur lors du chargement des porcs');
    } finally {
      setLoading(false);
    }
  };

  const addPig = async (pigData: Partial<Pig>) => {
    if (!user) return { error: new Error('Non authentifié') };

    try {
      const { data, error } = await supabase
        .from('pigs')
        .insert({
          ...pigData,
          user_id: user.id,
          weight_history: pigData.weight_history || [],
        })
        .select()
        .single();

      if (error) throw error;

      setPigs(prev => [data as Pig, ...prev]);
      toast.success('Porc ajouté avec succès');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding pig:', error);
      toast.error('Erreur lors de l\'ajout du porc');
      return { data: null, error };
    }
  };

  const updatePig = async (id: string, updates: Partial<Pig>) => {
    try {
      const { data, error } = await supabase
        .from('pigs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPigs(prev => prev.map(p => p.id === id ? (data as Pig) : p));
      toast.success('Porc mis à jour');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating pig:', error);
      toast.error('Erreur lors de la mise à jour');
      return { data: null, error };
    }
  };

  const deletePig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pigs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPigs(prev => prev.filter(p => p.id !== id));
      toast.success('Porc supprimé');
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting pig:', error);
      toast.error('Erreur lors de la suppression');
      return { error };
    }
  };

  useEffect(() => {
    fetchPigs();
  }, [user, options.status, options.search]);

  return {
    pigs,
    loading,
    refetch: fetchPigs,
    addPig,
    updatePig,
    deletePig,
  };
}
