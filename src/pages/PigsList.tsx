import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PigCard } from '@/components/features/PigCard';
import { usePigs } from '@/hooks/usePigs';
import { AddPigDialog } from '@/components/features/AddPigDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PigStatus } from '@/types/database';

export default function PigsList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PigStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(searchParams.get('action') === 'add');

  const { pigs, loading, addPig } = usePigs({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
  });

  const filteredPigs = pigs.filter(pig => {
    if (search && !pig.tag_number.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="content-area space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Mes Porcs</h1>
          <p className="text-muted-foreground">{pigs.length} porcs au total</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un porc
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as PigStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="breeding">Reproduction</SelectItem>
            <SelectItem value="sold">Vendu</SelectItem>
            <SelectItem value="deceased">Décédé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pigs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPigs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐷</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun porc trouvé
          </h3>
          <p className="text-muted-foreground mb-4">
            {search ? 'Essayez une autre recherche' : 'Commencez par ajouter votre premier porc'}
          </p>
          {!search && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un porc
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPigs.map((pig) => (
            <PigCard
              key={pig.id}
              pig={pig}
              onClick={() => navigate(`/pigs/${pig.id}`)}
            />
          ))}
        </div>
      )}

      {/* Add Pig Dialog */}
      <AddPigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={addPig}
      />
    </div>
  );
}
