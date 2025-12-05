import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pig, PigStatus, PigSex, WeightRecord } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface UsepigsOptions {
  status?: PigStatus;
  search?: string;
}

// Helper function to safely parse weight history
function parseWeightHistory(data: Json | null): WeightRecord[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'object' && item !== null && 'date' in item && 'weight' in item) {
        return {
          date: String((item as { date: string }).date),
          weight: Number((item as { weight: number }).weight),
        };
      }
      return { date: '', weight: 0 };
    }).filter(item => item.date !== '');
  }
  return [];
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

      // Parse and transform the data
      const parsedPigs: Pig[] = (data || []).map(pig => ({
        id: pig.id,
        user_id: pig.user_id,
        tag_number: pig.tag_number,
        birth_date: pig.birth_date,
        sex: pig.sex as PigSex,
        breed: pig.breed,
        status: pig.status as PigStatus,
        weight_history: parseWeightHistory(pig.weight_history),
        photo_url: pig.photo_url,
        mother_id: pig.mother_id,
        father_id: pig.father_id,
        notes: pig.notes,
        created_at: pig.created_at,
        updated_at: pig.updated_at,
      }));

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
      const insertData = {
        user_id: user.id,
        tag_number: pigData.tag_number!,
        sex: pigData.sex!,
        birth_date: pigData.birth_date || null,
        breed: pigData.breed || null,
        status: pigData.status || 'active',
        weight_history: (pigData.weight_history || []) as unknown as Json,
        photo_url: pigData.photo_url || null,
        notes: pigData.notes || null,
      };

      const { data, error } = await supabase
        .from('pigs')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newPig: Pig = {
        ...data,
        sex: data.sex as PigSex,
        status: data.status as PigStatus,
        weight_history: parseWeightHistory(data.weight_history),
      };

      setPigs(prev => [newPig, ...prev]);
      toast.success('Porc ajouté avec succès');
      return { data: newPig, error: null };
    } catch (error: unknown) {
      console.error('Error adding pig:', error);
      toast.error("Erreur lors de l'ajout du porc");
      return { data: null, error: error as Error };
    }
  };

  const updatePig = async (id: string, updates: Partial<Pig>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.tag_number !== undefined) updateData.tag_number = updates.tag_number;
      if (updates.sex !== undefined) updateData.sex = updates.sex;
      if (updates.birth_date !== undefined) updateData.birth_date = updates.birth_date;
      if (updates.breed !== undefined) updateData.breed = updates.breed;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.weight_history !== undefined) updateData.weight_history = updates.weight_history as unknown as Json;
      if (updates.photo_url !== undefined) updateData.photo_url = updates.photo_url;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('pigs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPig: Pig = {
        ...data,
        sex: data.sex as PigSex,
        status: data.status as PigStatus,
        weight_history: parseWeightHistory(data.weight_history),
      };

      setPigs(prev => prev.map(p => p.id === id ? updatedPig : p));
      toast.success('Porc mis à jour');
      return { data: updatedPig, error: null };
    } catch (error: unknown) {
      console.error('Error updating pig:', error);
      toast.error('Erreur lors de la mise à jour');
      return { data: null, error: error as Error };
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
    } catch (error: unknown) {
      console.error('Error deleting pig:', error);
      toast.error('Erreur lors de la suppression');
      return { error: error as Error };
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
