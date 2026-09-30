// components/reviews/EntityPicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, CheckCircle } from 'lucide-react';
import type { ReviewEntityType } from '@/types/review.types';

interface Entity {
  _id: string;
  name?: string;
  title?: string;
  [key: string]: any;
}

interface EntityPickerProps {
  projectId: string;
  entityType: ReviewEntityType;
  value: string;
  onChange: (entityId: string, entityTitle: string) => void;
  disabled?: boolean;
}

/**
 * EntityPicker - A component to select entities for review
 * Fetches available entities based on type and allows user to pick one
 * 
 * TODO: Implement actual API calls to fetch entities
 * Currently returns placeholder data
 */
const EntityPicker = ({
  projectId,
  entityType,
  value,
  onChange,
  disabled = false
}: EntityPickerProps) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntities();
  }, [projectId, entityType]);

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API calls based on entityType
      // Example: const response = await getProjectSetups(projectId);
      
      // Placeholder logic - you'll need to implement actual endpoints
      let fetchedEntities: Entity[] = [];
      
      switch (entityType) {
        case 'project_setup':
          // fetchedEntities = await getProjectSetups(projectId);
          fetchedEntities = [
            { _id: 'setup1', name: 'Initial Project Setup' },
            { _id: 'setup2', name: 'Phase 2 Setup' },
          ];
          break;
        
        case 'site_setup':
          // fetchedEntities = await getProjectSites(projectId);
          fetchedEntities = [
            { _id: 'site1', name: 'Main Site Setup' },
            { _id: 'site2', name: 'Secondary Site' },
          ];
          break;
        
        case 'stakeholder_mapping':
          // fetchedEntities = await getStakeholderMappings(projectId);
          fetchedEntities = [
            { _id: 'stake1', name: 'Initial Stakeholder Mapping' },
          ];
          break;
        
        case 'consultation_plan':
          // fetchedEntities = await getConsultationPlans(projectId);
          fetchedEntities = [
            { _id: 'consult1', name: 'Community Consultation Plan' },
          ];
          break;
        
        case 'theory_of_change_stage':
          // fetchedEntities = await getToCStages(projectId);
          fetchedEntities = [
            { _id: 'toc1', name: 'ToC Stage 1: Inputs' },
            { _id: 'toc2', name: 'ToC Stage 2: Activities' },
          ];
          break;
        
        case 'survey':
          // fetchedEntities = await getSurveys(projectId);
          fetchedEntities = [
            { _id: 'survey1', name: 'Baseline Community Survey' },
            { _id: 'survey2', name: 'Impact Assessment Survey' },
          ];
          break;
        
        case 'report':
          // fetchedEntities = await getReports(projectId);
          fetchedEntities = [
            { _id: 'report1', name: 'Q1 Progress Report' },
          ];
          break;
      }

      setEntities(fetchedEntities);
    } catch (err) {
      console.error('Error fetching entities:', err);
      setError('Failed to load entities. You can still enter the ID manually.');
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter(entity => {
    if (!search) return true;
    const name = entity.name || entity.title || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const selectedEntity = entities.find(e => e._id === value);

  return (
    <div className="space-y-3">
      {/* Search */}
      {entities.length > 0 && (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-c4c-petrol"
            size={18}
          />
          <input
            type="text"
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled || loading}
            className="w-full pl-10 pr-4 py-2 border border-c4c-rule rounded-lg focus:ring-2 focus:ring-c4c-petrol focus:border-transparent disabled:bg-c4c-grey-bg"
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-6 w-6 text-c4c-petrol mr-2" />
          <span className="text-c4c-petrol">Loading entities...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-c4c-tint-gold border border-c4c-yellow rounded-lg">
          <p className="text-sm text-black">{error}</p>
        </div>
      )}

      {/* Entity List */}
      {!loading && entities.length > 0 && (
        <div className="max-h-64 overflow-y-auto border border-c4c-rule rounded-lg">
          {filteredEntities.length > 0 ? (
            <div className="divide-y divide-c4c-rule">
              {filteredEntities.map((entity) => (
                <button
                  key={entity._id}
                  type="button"
                  onClick={() => onChange(entity._id, entity.name || entity.title || 'Unnamed')}
                  disabled={disabled}
                  className={`w-full px-4 py-3 text-left hover:bg-c4c-grey-bg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    value === entity._id ? 'bg-c4c-grey-bg' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-black">
                      {entity.name || entity.title || 'Unnamed Entity'}
                    </p>
                    <p className="text-xs text-c4c-petrol font-mono mt-1">
                      ID: {entity._id}
                    </p>
                  </div>
                  {value === entity._id && (
                    <CheckCircle className="text-c4c-petrol flex-shrink-0" size={20} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-c4c-petrol">No entities match your search</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && entities.length === 0 && (
        <div className="p-4 bg-c4c-grey-bg border border-c4c-rule rounded-lg text-center">
          <p className="text-sm text-c4c-petrol mb-2">
            No entities found of type "{entityType.replace(/_/g, ' ')}"
          </p>
          <p className="text-xs text-c4c-petrol">
            You can still create a review by entering the Entity ID manually above
          </p>
        </div>
      )}

      {/* Selected Entity Display */}
      {selectedEntity && (
        <div className="p-3 bg-c4c-tint-sage border border-c4c-sage rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="text-c4c-sage mr-2 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-medium text-black">
                Selected: {selectedEntity.name || selectedEntity.title}
              </p>
              <p className="text-xs text-black font-mono">
                {selectedEntity._id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityPicker;