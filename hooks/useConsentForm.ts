// hooks/useConsentForm.ts
import { useState, useCallback, useEffect } from 'react';
import {
  ConsentForm,
  CreateConsentFormRequest,
  UpdateConsentFormRequest,
  ConsentFormFilters,
  AvailableConsentFormsResponse
} from '@/types';
import * as consentFormApi from '@/lib/api/consentForm';

/**
 * Hook for managing a single consent form
 */
export const useConsentForm = (consentFormId?: string) => {
  const [consentForm, setConsentForm] = useState<ConsentForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsentForm = useCallback(async (id?: string) => {
    const targetId = id || consentFormId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await consentFormApi.getConsentForm(targetId);
      setConsentForm(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consent form');
    } finally {
      setLoading(false);
    }
  }, [consentFormId]);

  const updateConsentForm = useCallback(async (data: UpdateConsentFormRequest) => {
    if (!consentFormId) return;

    setLoading(true);
    try {
      const response = await consentFormApi.updateConsentForm(consentFormId, data);
      setConsentForm(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update consent form');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [consentFormId]);

  const archiveConsentForm = useCallback(async () => {
    if (!consentFormId) return;

    setLoading(true);
    try {
      await consentFormApi.archiveConsentForm(consentFormId);
      setConsentForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive consent form');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [consentFormId]);

  useEffect(() => {
    if (consentFormId) {
      fetchConsentForm();
    }
  }, [consentFormId, fetchConsentForm]);

  return {
    consentForm,
    loading,
    error,
    fetchConsentForm,
    updateConsentForm,
    archiveConsentForm,
    refetch: fetchConsentForm
  };
};

/**
 * Hook for managing consent forms list
 */
export const useConsentForms = (filters?: ConsentFormFilters) => {
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchConsentForms = useCallback(async (customFilters?: ConsentFormFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await consentFormApi.getConsentForms(customFilters || filters);
      setConsentForms(response.data);
      setPagination(response.pagination);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consent forms');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createConsentForm = useCallback(async (data: CreateConsentFormRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await consentFormApi.createConsentForm(data);
      await fetchConsentForms(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create consent form');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConsentForms]);

  const cloneConsentForm = useCallback(async (id: string, options?: {
    name?: string;
    projectId?: string;
    organizationId?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await consentFormApi.cloneConsentForm(id, options);
      await fetchConsentForms(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone consent form');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConsentForms]);

  useEffect(() => {
    fetchConsentForms();
  }, [fetchConsentForms]);

  return {
    consentForms,
    pagination,
    loading,
    error,
    fetchConsentForms,
    createConsentForm,
    cloneConsentForm,
    refetch: fetchConsentForms
  };
};

/**
 * Hook for getting available consent forms for a project
 */
export const useAvailableConsentForms = (projectId?: string) => {
  const [consentForms, setConsentForms] = useState<AvailableConsentFormsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableConsentForms = useCallback(async (id?: string) => {
    const targetId = id || projectId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await consentFormApi.getAvailableConsentFormsForProject(targetId);
      setConsentForms(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available consent forms');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchAvailableConsentForms();
    }
  }, [projectId, fetchAvailableConsentForms]);

  return {
    consentForms,
    loading,
    error,
    fetchAvailableConsentForms,
    refetch: () => projectId && fetchAvailableConsentForms(projectId)
  };
};