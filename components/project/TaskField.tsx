import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Plus, Eye, AlertTriangle, FileText, Film, ImageIcon, Files, Download, Trash2, MapPin, ExternalLink, CheckCircle, AlertCircle, SkipForward } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import CreateRiskModal from './modals/CreateRiskModal';
import ViewRisksModal from './modals/ViewRisksModal';
import {
  parseLocationInput,
  formatGPSCoordinates,
  formatGPSWithCardinal,
  getGoogleMapsUrl,
  getLocationInputHelp,
  Coordinates
} from '@/lib/utils/gps';
import LocationInputHelper from './Locationinputhelper';
import { getRiskRegisterSummary, deleteRiskItem } from '@/lib/api/riskManagement';
import { RiskItem } from '@/types';

// ---------------------------------------------------------------------------
// ISO country list for the country select field
// ---------------------------------------------------------------------------
const COUNTRY_LIST = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina',
  'Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados',
  'Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana',
  'Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon',
  'Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros',
  'Congo (Brazzaville)','Congo (Kinshasa)','Costa Rica','Croatia','Cuba','Cyprus',
  'Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt',
  'El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji',
  'Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada',
  'Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland',
  'India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kiribati','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon',
  'Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico',
  'Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama',
  'Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania',
  'Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines',
  'Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia',
  'Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo',
  'Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine',
  'United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu',
  'Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];


// Types for special data structures
interface LivestockItem {
  type: string;
  quantity: string;
}

interface WildlifeConflictItem {
  species: string;
  frequency: string;
}



interface UploadedFile {
  filename: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  originalName: string;
  uploadedAt?: string;
}

interface Task {
  _id: string;
  fieldName: string;
  dataType: string;
  description?: string;
  userFacingCopy?: string;
  options?: string[];
  fieldLabel: string;
  helperText: string;
  hoverText: string;
  isRequired: boolean;
  sortOrder: number;
  step: number;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  responseData?: any;
}

interface TaskFieldProps {
  task: Task;
  onComplete: (task: Task, responseData: any, files?: File[]) => Promise<void>;
  onUpdate: (task: Task, responseData: any, files?: File[]) => Promise<void>;
  onDeleteFile?: (filename: string) => Promise<void>;
  isLoading: boolean;
  projectId?: string;
  organizationId?: string;
  projectSites?: Array<{ _id: string; name: string; }>;
  /** When true the task is disabled — parent boolean was answered No */
  isDisabled?: boolean;
  /** Called whenever a boolean radio changes so the parent can track skip logic */
  onBooleanChange?: (fieldName: string, value: boolean) => void;
}

const TaskField: React.FC<TaskFieldProps> = ({
  task, onComplete, onUpdate, onDeleteFile, isLoading,
  projectId, organizationId, projectSites,
  isDisabled = false, onBooleanChange
}) => {
  // ✅ FIX: Update responseData when task changes
  const [responseData, setResponseData] = useState<any>(() => {
    // Normalize boolean values on initial load
    if (task.dataType === 'boolean' && task.responseData !== null && task.responseData !== undefined) {
      if (task.responseData === 'true') return true;
      if (task.responseData === 'false') return false;
      return task.responseData;
    }
    return task.responseData || null;
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [otherValue, setOtherValue] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);

  // ✅ NEW: File preview state
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  
  // ✅ NEW: Location input state
  const [locationInput, setLocationInput] = useState<string>('');
  const [parsedCoords, setParsedCoords] = useState<Coordinates | null>(null);
  const [showLocationValidation, setShowLocationValidation] = useState(false);
  
  // Fields that are always free-text tag inputs, regardless of what options
  // may have been incorrectly stored in the DB by an earlier bug.
  const FREE_TEXT_TAG_FIELDS = new Set([
    'ethnic_groups_present',       // array  — site & project
    'approval_granted_by',         // array  — project task 12
    'implementing_organisations',  // array  — project task 13
    'oversight_authorities',       // array  — project task 14
  ]);

  const isTagArrayField =
    FREE_TEXT_TAG_FIELDS.has(task.fieldName) ||
    (task.dataType === 'array' && (!task.options || task.options.length === 0));

  // Special states for complex fields
  // Initialise tags from saved responseData for any tag-style array field
  const [tags, setTags] = useState<string[]>(() =>
    (isTagArrayField && Array.isArray(task.responseData))
      ? task.responseData
      : []
  );
  const [newTag, setNewTag] = useState<string>('');
  const [livestockItems, setLivestockItems] = useState<LivestockItem[]>([]);
  const [wildlifeItems, setWildlifeItems] = useState<WildlifeConflictItem[]>([]);

  const [showCreateRiskModal, setShowCreateRiskModal] = useState(false);
  const [showViewRisksModal, setShowViewRisksModal] = useState(false);
  const [riskFieldName, setRiskFieldName] = useState<string>('');

  // Risk badges state — risks logged against this specific task field
  const [taskRisks, setTaskRisks] = useState<RiskItem[]>([]);
  const [loadingRisks, setLoadingRisks] = useState(false);
  const [deletingRisk, setDeletingRisk] = useState<string | null>(null);

  const { user } = useAuth();

  // ✅ ADD: useEffect to sync responseData when task changes
  useEffect(() => {
    if (task.dataType === 'boolean') {
      // Normalize boolean values
      if (task.responseData === 'true') {
        setResponseData(true);
      } else if (task.responseData === 'false') {
        setResponseData(false);
      } else if (task.responseData === true || task.responseData === false) {
        setResponseData(task.responseData);
      } else {
        setResponseData(null);
      }
    } else {
      setResponseData(task.responseData || null);
    }
  }, [task._id, task.responseData, task.dataType]);

  // ✅ NEW: Initialize location input from saved data
  useEffect(() => {
    if (isLocationField(task.fieldName, task.dataType)) {
      const savedLocation = task.responseData?.location || task.responseData || '';
      if (savedLocation) {
        setLocationInput(savedLocation);
        const coords = parseLocationInput(savedLocation);
        setParsedCoords(coords);
        setShowLocationValidation(true);
      }
    }
  }, [task._id, task.fieldName, task.dataType, task.responseData]);

  // ✅ NEW: Parse location when input changes
  useEffect(() => {
    if (isLocationField(task.fieldName, task.dataType) && locationInput.trim()) {
      const coords = parseLocationInput(locationInput);
      setParsedCoords(coords);
      setShowLocationValidation(true);
      
      if (coords.isValid) {
        // Auto-update responseData with formatted coordinates
        const formatted = formatGPSCoordinates(coords.latitude, coords.longitude);
        setResponseData(formatted);
      }
    } else if (isLocationField(task.fieldName, task.dataType) && !locationInput.trim()) {
      setParsedCoords(null);
      setShowLocationValidation(false);
    }
  }, [locationInput, task.fieldName, task.dataType]);

  useEffect(() => {
    // ✅ Skip boolean fields - handled by separate useEffect
    if (task.dataType === 'boolean') {
      return;
    }

    // isTagArrayField is defined above (at component level) so we can use it here.
    // It covers all known free-text tag fields plus any unnamed array fields with no options.
    if (isTagArrayField) {
      if (Array.isArray(task.responseData)) {
        setTags(task.responseData);
        setResponseData(task.responseData);
      } else if (tags.length > 0) {
        setTags([]);
        setResponseData([]);
      }
    } else if (task.fieldName === 'livestock_profile') {
      if (Array.isArray(task.responseData)) {
        setLivestockItems(task.responseData);
      }
    } else if (task.fieldName === 'wildlife_conflict_summary') {
      if (Array.isArray(task.responseData)) {
        setWildlifeItems(task.responseData);
      }
    }
  }, [task.responseData, task.fieldName, task._id, task.dataType]);

  useEffect(() => {
    // Debug boolean fields
    if (task.dataType === 'boolean') {
      console.log(`🔍 Boolean Task: ${task.fieldName}`);
      console.log(`   Response Data:`, responseData);
      console.log(`   Type:`, typeof responseData);
      console.log(`   Is Completed:`, task.isCompleted);
    }
  }, [task.responseData, task.fieldName, task.dataType, responseData]);

  // ---------------------------------------------------------------------------
  // Fetch risks logged against this task field whenever the answer is Yes
  // ---------------------------------------------------------------------------
  const RISK_FIELD_NAMES = [
    'conflict_history', 'political_risk', 'access_issues',
    'previous_project_failures', 'wildlife_conflict_present',
  ];

  const normalizedBooleanForRisk: boolean | null =
    responseData === true || responseData === 'true' ? true :
    responseData === false || responseData === 'false' ? false :
    (responseData && typeof responseData === 'object' && responseData.confirmed === true) ? true :
    null;

  useEffect(() => {
    const isRiskTaskField = RISK_FIELD_NAMES.includes(task.fieldName);
    if (!isRiskTaskField || normalizedBooleanForRisk !== true || !projectId) return;

    const fetchTaskRisks = async () => {
      try {
        setLoadingRisks(true);
        const data = await getRiskRegisterSummary({ projectId, organizationId });
        // Filter to risks that were logged from this specific task field
        const fieldRisks = (data.risks || []).filter(
          (r: RiskItem) => (r as any).sourceFieldName === task.fieldName
        );
        setTaskRisks(fieldRisks);
      } catch (err) {
        console.error('Error fetching task risks:', err);
      } finally {
        setLoadingRisks(false);
      }
    };

    fetchTaskRisks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.fieldName, normalizedBooleanForRisk, projectId, organizationId]);

  const handleDeleteRisk = async (riskId: string) => {
    if (!window.confirm('Remove this risk entry?')) return;
    try {
      setDeletingRisk(riskId);
      await deleteRiskItem(riskId);
      setTaskRisks(prev => prev.filter(r => r._id !== riskId));
    } catch (err) {
      console.error('Error deleting risk:', err);
      alert('Failed to delete risk. Please try again.');
    } finally {
      setDeletingRisk(null);
    }
  };

  // Refresh risk badges after a new risk is created
  const refreshTaskRisks = async () => {
    if (!projectId || normalizedBooleanForRisk !== true) return;
    try {
      const data = await getRiskRegisterSummary({ projectId, organizationId });
      const fieldRisks = (data.risks || []).filter(
        (r: RiskItem) => (r as any).sourceFieldName === task.fieldName
      );
      setTaskRisks(fieldRisks);
    } catch (err) {
      console.error('Error refreshing task risks:', err);
    }
  };

  const livestockTypes = ["Cattle", "Goats", "Sheep", "Pigs", "Chickens", "Donkeys", "Ducks or geese", "Other (please specify)"];
  const quantityOptions = ["None", "1–15", "16–30", "More than 30", "Unknown"];

  const speciesOptions = ["Elephants", "Baboons", "Bush pigs", "Monkeys", "Birds", "Crocodiles", "Hippos", "Lions", "Other (please specify)"];
  const frequencyOptions = ["Rare", "Occasional", "Frequent", "Constant", "Unknown"];

  // ✅ NEW: Helper function to check if field is location-related
  const isLocationField = (fieldName: string, dataType: string): boolean => {
    return (
      dataType === 'location' ||
      dataType === 'gps' ||
      dataType === 'coordinates' ||
      fieldName.toLowerCase().includes('location') ||
      fieldName.toLowerCase().includes('gps') ||
      fieldName.toLowerCase().includes('coordinates') ||
      fieldName === 'gps_coordinates'
    );
  };

  // ✅ NEW: Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Film className="h-5 w-5 text-purple-500" />;
    if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <Files className="h-5 w-5 text-gray-500" />;
  };

  // ✅ FIXED: Extract timestamp from filename
  const extractTimestampFromFilename = (filename: string): string => {
    // Match pattern like: filename_2025-11-26T08-21-17-933Z
    const match = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/);
    if (match) {
      const timestampStr = match[1];
      
      // Convert format from: 2025-11-26T08-21-17-933Z
      // To ISO format: 2025-11-26T08:21:17.933Z
      
      // Split by 'T'
      const [datePart, timePart] = timestampStr.split('T');
      
      // Process time part: 08-21-17-933Z -> 08:21:17.933Z
      const timeMatch = timePart.match(/(\d{2})-(\d{2})-(\d{2})-(\d{3}Z)/);
      if (timeMatch) {
        const [_, hours, minutes, seconds, milliseconds] = timeMatch;
        const isoTimestamp = `${datePart}T${hours}:${minutes}:${seconds}.${milliseconds}`;
        return isoTimestamp;
      }
    }
    return '';
  };

  // ✅ FIXED: Format timestamp for display
  const formatTimestamp = (timestamp: string | Date | undefined): string => {
    if (!timestamp) return '';
    
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  // ✅ NEW: Handle file deletion
  const handleDeleteFile = async (filename: string) => {
    if (!onDeleteFile) {
      alert('File deletion is not supported in this context');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this file? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      setDeletingFile(filename);
      await onDeleteFile(filename);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setDeletingFile(null);
    }
  };

  // ✅ NEW: Handle file preview
  const handlePreviewFile = (file: UploadedFile) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  // ✅ NEW: Check if file can be previewed
  const canPreviewFile = (mimeType: string) => {
    return mimeType.startsWith('image/') || 
           mimeType === 'application/pdf' || 
           mimeType.startsWith('video/') ||
           mimeType.startsWith('audio/') ||
           mimeType.startsWith('text/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalResponseData = getFinalResponseData();
    
    // ✅ Send all selected files
    if (selectedFiles.length > 0) {
      await onComplete(task, finalResponseData, selectedFiles);
    } else if (selectedFile) {
      await onComplete(task, finalResponseData, [selectedFile]);
    } else {
      await onComplete(task, finalResponseData);
    }
    
    setSelectedFile(null);
    setSelectedFiles([]);
  };

  const handleUpdate = async () => {
    let finalResponseData = getFinalResponseData();
    
    // ✅ Send all selected files
    if (selectedFiles.length > 0) {
      await onUpdate(task, finalResponseData, selectedFiles);
    } else if (selectedFile) {
      await onUpdate(task, finalResponseData, [selectedFile]);
    } else {
      await onUpdate(task, finalResponseData);
    }
    
    setSelectedFile(null);
    setSelectedFiles([]);
  };

  // ✅ ADD: Handler for opening risk modal with context
  const handleOpenRiskModal = (fieldName: string) => {
    setRiskFieldName(fieldName);
    setShowCreateRiskModal(true);
  };

  const handleRiskCreated = () => {
    console.log('Risk created successfully for field:', riskFieldName);
    setShowCreateRiskModal(false);
    setRiskFieldName('');
    // Refresh badges so newly created risk appears immediately
    refreshTaskRisks();
  };

  const handleCloseRiskModal = () => {
    setShowCreateRiskModal(false);
    setRiskFieldName('');
  };

  const getFinalResponseData = () => {
    if (task.fieldName === 'ethnic_groups_present') {
      return tags;
    } else if (task.fieldName === 'livestock_profile') {
      return livestockItems;
    } else if (task.fieldName === 'wildlife_conflict_summary') {
      return wildlifeItems;
    }

    if (task.dataType === 'array' && Array.isArray(responseData) && otherValue) {
      const hasOtherOption = task.options?.some(option => 
        option.toLowerCase().includes('other') || option.includes('please specify')
      );
      
      if (hasOtherOption && responseData.some(item => item.toLowerCase().includes('other'))) {
        return responseData.map(item => 
          item.toLowerCase().includes('other') ? otherValue : item
        );
      }
    }

    return responseData;
  };

  const isCompleted = task.isCompleted;

  const renderTaggableArray = () => {
    const addTag = () => {
      if (newTag.trim() && !tags.includes(newTag.trim())) {
        const updatedTags = [...tags, newTag.trim()];
        setTags(updatedTags);
        setResponseData(updatedTags);
        setNewTag('');
      } else {
        if (tags.includes(newTag.trim())) {
          alert('This tag already exists!');
        }
        if (!newTag.trim()) {
          alert('Tag cannot be empty!');
        }
      }
    };

    const removeTag = (tagToRemove: string) => {
      const updatedTags = tags.filter(tag => tag !== tagToRemove);
      setTags(updatedTags);
      setResponseData(updatedTags);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Type group name and press Enter..."
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500">
          Type a group name and press Enter or click + to add it as a tag
        </p>
      </div>
    );
  };

  const renderLivestockProfile = () => {
    const addLivestockItem = () => {
      setLivestockItems([...livestockItems, { type: '', quantity: '' }]);
    };

    const updateLivestockItem = (index: number, field: 'type' | 'quantity', value: string) => {
      const updated = [...livestockItems];
      updated[index][field] = value;
      setLivestockItems(updated);
    };

    const removeLivestockItem = (index: number) => {
      setLivestockItems(livestockItems.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-3">
        {livestockItems.map((item, index) => (
          <div key={index} className="flex gap-3 items-center p-3 border border-gray-200 rounded-md">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Livestock Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={item.type}
                onChange={(e) => updateLivestockItem(index, 'type', e.target.value)}
              >
                <option value="">Select type...</option>
                {livestockTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity Range</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={item.quantity}
                onChange={(e) => updateLivestockItem(index, 'quantity', e.target.value)}
              >
                <option value="">Select quantity...</option>
                {quantityOptions.map(quantity => (
                  <option key={quantity} value={quantity}>{quantity}</option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => removeLivestockItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addLivestockItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Livestock Type
        </button>
      </div>
    );
  };

  const renderWildlifeConflict = () => {
    const addWildlifeItem = () => {
      setWildlifeItems([...wildlifeItems, { species: '', frequency: '' }]);
    };

    const updateWildlifeItem = (index: number, field: 'species' | 'frequency', value: string) => {
      const updated = [...wildlifeItems];
      updated[index][field] = value;
      setWildlifeItems(updated);
    };

    const removeWildlifeItem = (index: number) => {
      setWildlifeItems(wildlifeItems.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-3">
        {wildlifeItems.map((item, index) => (
          <div key={index} className="flex gap-3 items-center p-3 border border-gray-200 rounded-md">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Species</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={item.species}
                onChange={(e) => updateWildlifeItem(index, 'species', e.target.value)}
              >
                <option value="">Select species...</option>
                {speciesOptions.map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={item.frequency}
                onChange={(e) => updateWildlifeItem(index, 'frequency', e.target.value)}
              >
                <option value="">Select frequency...</option>
                {frequencyOptions.map(frequency => (
                  <option key={frequency} value={frequency}>{frequency}</option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => removeWildlifeItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addWildlifeItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Wildlife Conflict
        </button>
      </div>
    );
  };

  // ✅ NEW: Render location input field
  const renderLocationInput = () => {
    return (
      <div className="space-y-3">
        {/* Input Field */}
        <div className="relative">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="Paste Google Maps URL or enter coordinates..."
            required={task.isRequired}
            className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              parsedCoords?.isValid 
                ? 'border-green-500 bg-green-50' 
                : showLocationValidation && locationInput 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-gray-300'
            }`}
          />
          
          {/* Validation Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {parsedCoords?.isValid && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {showLocationValidation && locationInput && !parsedCoords?.isValid && (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Validation Message */}
        {showLocationValidation && locationInput && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            parsedCoords?.isValid 
              ? 'bg-green-50 text-green-900 border border-green-200' 
              : 'bg-yellow-50 text-yellow-900 border border-yellow-200'
          }`}>
            {parsedCoords?.isValid ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
            )}
            <span>
              {parsedCoords?.isValid 
                ? '✓ Valid location detected' 
                : getLocationInputHelp(locationInput)
              }
            </span>
          </div>
        )}

        {/* Parsed Coordinates Display */}
        {parsedCoords?.isValid && (
          <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Detected Location:</p>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                  {formatGPSWithCardinal(parsedCoords.latitude, parsedCoords.longitude)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Decimal: {formatGPSCoordinates(parsedCoords.latitude, parsedCoords.longitude)}
                </p>
                {parsedCoords.parseMethod && (
                  <p className="text-xs text-gray-500 mt-1">
                    Format: {parsedCoords.parseMethod}
                  </p>
                )}
              </div>
              
              <a
                href={getGoogleMapsUrl(parsedCoords.latitude, parsedCoords.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <MapPin className="w-4 h-4" />
                View on Map
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {parsedCoords.warning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-900">{parsedCoords.warning}</p>
              </div>
            )}
          </div>
        )}

        {/* Helper Text Component */}
        {!isCompleted && <LocationInputHelper />}
        
        {/* Custom Helper Text from field config */}
        {task.helperText && (
          <p className="text-sm text-gray-600 italic">{task.helperText}</p>
        )}
      </div>
    );
  };

  const renderInputField = () => {
    // Route all known free-text tag fields to the tag input,
    // bypassing any options that may have been wrongly stored in the DB.
    if (FREE_TEXT_TAG_FIELDS.has(task.fieldName)) {
      return renderTaggableArray();
    }

    if (task.fieldName === 'livestock_profile') {
      return renderLivestockProfile();
    }

    if (task.fieldName === 'wildlife_conflict_summary') {
      return renderWildlifeConflict();
    }

    // ✅ Country select
    if (task.fieldName === 'country') {
      return (
        <div className="space-y-3">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={responseData || ''}
            onChange={(e) => setResponseData(e.target.value)}
          >
            <option value="">Select a country...</option>
            {COUNTRY_LIST.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      );
    }

    // ✅ NEW: Check for location fields
    if (isLocationField(task.fieldName, task.dataType)) {
      return renderLocationInput();
    }

    switch (task.dataType) {
      case 'string':
        return (
          <div className="space-y-3">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={responseData || ''}
              onChange={(e) => setResponseData(e.target.value)}
              rows={4}
              placeholder={task.helperText}
            />
          </div>
        );
        
      case 'number':
        return (
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={responseData || ''}
            onChange={(e) => setResponseData(Number(e.target.value))}
            placeholder={task.helperText}
          />
        );
        
      case 'boolean':
        const isPoliticalRiskField = task.fieldName === 'political_risk';
        const isConflictHistoryField = task.fieldName === 'conflict_history';
        const isAccessIssuesField = task.fieldName === 'access_issues';
        const isPreviousFailuresField = task.fieldName === 'previous_project_failures';
        const isWildlifeConflictField = task.fieldName === 'wildlife_conflict_present';
        const isConditionalUploadField = task.fieldName === 'shapefiles_uploaded' || task.fieldName === 'land_agreements_uploaded';

        const isRiskField = isPoliticalRiskField || isConflictHistoryField ||
                            isAccessIssuesField || isPreviousFailuresField ||
                            isWildlifeConflictField;

        // Handle plain boolean OR stored { confirmed: true, files: [...] } shape
        const normalizedValue: boolean | null =
          responseData === true || responseData === 'true' ? true :
          responseData === false || responseData === 'false' ? false :
          (responseData && typeof responseData === 'object' && responseData.confirmed === true) ? true :
          null;

        // Resolve the files already stored on this task (for conditional-upload fields)
        const storedUploadFiles: UploadedFile[] =
          isConditionalUploadField && task.responseData?.files && Array.isArray(task.responseData.files)
            ? task.responseData.files
            : [];

        return (
          <div className="space-y-3">
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name={`boolean-${task._id}`}
                  value="true"
                  checked={normalizedValue === true}
                  onChange={() => {
                    setResponseData(true);
                    onBooleanChange?.(task.fieldName, true);
                    if (isRiskField && !isCompleted) {
                      handleOpenRiskModal(task.fieldName);
                    }
                  }}
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name={`boolean-${task._id}`}
                  value="false"
                  checked={normalizedValue === false}
                  onChange={() => {
                    setResponseData(false);
                    onBooleanChange?.(task.fieldName, false);
                    // Clear any pending file selection when switching to No
                    if (isConditionalUploadField) {
                      setSelectedFiles([]);
                      setSelectedFile(null);
                    }
                  }}
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>

            {isRiskField && normalizedValue === true && (
              <div className="space-y-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRiskModal(task.fieldName)}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Risk Entry
                  </button>
                </div>

                {/* Risk badges */}
                {loadingRisks && (
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full" />
                    Loading risks...
                  </div>
                )}
                {!loadingRisks && taskRisks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-red-800">
                      Risks logged for this question ({taskRisks.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {taskRisks.map(risk => {
                        const scoreColour =
                          risk.riskScore === 'high' ? '#ef4444' :
                          risk.riskScore === 'medium' ? '#f97316' :
                          '#22c55e';
                        return (
                          <span
                            key={risk._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-red-300 text-red-800 shadow-sm"
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: scoreColour }}
                            />
                            <span className="max-w-[160px] truncate" title={risk.name}>{risk.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRisk(risk._id)}
                              disabled={deletingRisk === risk._id}
                              className="ml-1 text-red-400 hover:text-red-700 transition-colors disabled:opacity-50"
                              title="Remove risk"
                            >
                              {deletingRisk === risk._id
                                ? <div className="animate-spin h-3 w-3 border border-red-500 border-t-transparent rounded-full" />
                                : <X className="h-3 w-3" />
                              }
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!loadingRisks && taskRisks.length === 0 && (
                  <p className="text-xs text-red-600 italic">No risks logged yet — use "Add Risk Entry" above.</p>
                )}
              </div>
            )}

            {/* Conditional file upload section — shown when Yes is selected for upload-trigger fields */}
            {isConditionalUploadField && normalizedValue === true && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <p className="text-sm font-medium text-blue-900">
                  Please upload the relevant file(s):
                </p>

                {/* Already-saved files */}
                {storedUploadFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 font-medium">
                      Uploaded files ({storedUploadFiles.length}):
                    </p>
                    {storedUploadFiles.map((file: UploadedFile, index: number) => {
                      const timestamp = file.uploadedAt || extractTimestampFromFilename(file.filename);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {getFileIcon(file.mimeType)}
                            <div className="ml-3 flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{file.mimeType}</span>
                                <span>•</span>
                                <span>{(file.size / 1024).toFixed(2)} KB</span>
                                {timestamp && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-600">{formatTimestamp(timestamp)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {canPreviewFile(file.mimeType) && (
                              <button
                                type="button"
                                onClick={() => handlePreviewFile(file)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                title="Preview file"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {file.fileUrl && (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                            {onDeleteFile && (
                              <button
                                type="button"
                                onClick={() => handleDeleteFile(file.filename)}
                                disabled={deletingFile === file.filename}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete file"
                              >
                                {deletingFile === file.filename ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Newly selected files (not yet uploaded) */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected files ({selectedFiles.length}) — ready to upload:
                    </p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border border-blue-300">
                        <div className="flex items-center flex-1">
                          {getFileIcon(file.type)}
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-blue-900">{file.name}</p>
                            <p className="text-xs text-blue-700">
                              {file.type || 'unknown'} • {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            setSelectedFiles(newFiles);
                            if (newFiles.length === 0) setSelectedFile(null);
                          }}
                          className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File picker */}
                <div>
                  <label className="block cursor-pointer">
                    <div className="flex items-center justify-center px-6 py-4 border-2 border-blue-300 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-100 transition-colors">
                      <div className="text-center">
                        <svg className="mx-auto h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="mt-2 flex text-sm text-gray-600 justify-center">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            {selectedFiles.length > 0 ? 'Add more files' : 'Upload files'}
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Any file type, up to 10MB each</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      accept="*/*"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        if (newFiles.length === 0) return;
                        const oversized = newFiles.filter(f => f.size > 10 * 1024 * 1024);
                        if (oversized.length > 0) {
                          alert(`The following files exceed 10MB:\n${oversized.map(f => f.name).join('\n')}`);
                          e.target.value = '';
                          return;
                        }
                        setSelectedFiles(prev => [...prev, ...newFiles]);
                        if (selectedFiles.length === 0 && newFiles.length === 1) {
                          setSelectedFile(newFiles[0]);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSelectedFiles([]); setSelectedFile(null); }}
                      className="mt-2 w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-300 rounded-md transition-colors"
                    >
                      Clear all selected files
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
          
      case 'array':
        if (task.options && task.options.length > 0) {
          const hasOtherOption = task.options.some(option => 
            option.toLowerCase().includes('other') || option.includes('please specify')
          );
          
          const showOtherInput = hasOtherOption && 
            Array.isArray(responseData) && 
            responseData.some(item => item.toLowerCase().includes('other'));

          if (task.fieldName === 'education_summary' || task.fieldName === 'cultivated_land_size') {
            return (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={responseData || ''}
                onChange={(e) => setResponseData(e.target.value)}
              >
                <option value="">Select an option...</option>
                {task.options.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            );
          }

          return (
            <div className="space-y-2">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {task.options.map((option, index) => (
                  <label key={index} className="flex items-start">
                    <input
                      type="checkbox"
                      className="form-checkbox mt-1 text-blue-600"
                      checked={Array.isArray(responseData) && responseData.includes(option)}
                      onChange={(e) => {
                        let newData = Array.isArray(responseData) ? [...responseData] : [];
                        if (e.target.checked) {
                          newData.push(option);
                        } else {
                          newData = newData.filter(item => item !== option);
                        }
                        setResponseData(newData);
                      }}
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              
              {showOtherInput && (
                <div className="ml-6 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify:
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        }
        
        return renderTaggableArray();
        
      case 'object':
        // ✅ UPDATED: Don't render object input for gps_coordinates since we handle it with location input
        if (task.fieldName === 'gps_coordinates') {
          return renderLocationInput();
        }
        
        if (task.fieldName === 'gender_distribution' || task.fieldName === 'age_distribution') {
          return (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={responseData || ''}
              onChange={(e) => setResponseData(e.target.value)}
              placeholder={task.helperText}
            />
          );
        }

        return (
          <div className="space-y-2">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={responseData ? JSON.stringify(responseData, null, 2) : ''}
              onChange={(e) => {
                try {
                  setResponseData(JSON.parse(e.target.value));
                } catch (err) {
                  setResponseData(e.target.value);
                }
              }}
              rows={4}
              placeholder="Enter data in JSON format"
            />
            <p className="text-xs text-gray-500">
              For coordinates, use format: {`{"latitude": 0.0, "longitude": 0.0}`}
            </p>
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-3">
            {/* Existing uploaded files */}
            {task.responseData?.files && Array.isArray(task.responseData.files) && task.responseData.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Uploaded files ({task.responseData.files.length}):
                </p>
                {task.responseData.files.map((file: UploadedFile, index: number) => {
                  const timestamp = file.uploadedAt || extractTimestampFromFilename(file.filename);
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {getFileIcon(file.mimeType)}
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{file.mimeType}</span>
                            <span>•</span>
                            <span>{(file.size / 1024).toFixed(2)} KB</span>
                            {timestamp && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">
                                  {formatTimestamp(timestamp)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-3">
                        {canPreviewFile(file.mimeType) && (
                          <button
                            type="button"
                            onClick={() => handlePreviewFile(file)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Preview file"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        
                        {file.fileUrl && (
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        
                        {onDeleteFile && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.filename)}
                            disabled={deletingFile === file.filename}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete file"
                          >
                            {deletingFile === file.filename ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Show single file (backward compatibility) */}
            {task.responseData?.filename && !task.responseData?.files && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center flex-1">
                  {getFileIcon(task.responseData.mimeType || 'application/octet-stream')}
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {task.responseData.originalName || task.responseData.filename}
                    </p>
                    {task.responseData.uploadedAt && (
                      <p className="text-xs text-blue-600">
                        {formatTimestamp(task.responseData.uploadedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.responseData.signedUrl && (
                    <>
                      <a 
                        href={task.responseData.signedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {onDeleteFile && (
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(task.responseData.filename)}
                          disabled={deletingFile === task.responseData.filename}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingFile === task.responseData.filename ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Show newly selected files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected files ({selectedFiles.length}) - Ready to upload:
                </p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center flex-1">
                      {getFileIcon(file.type)}
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-blue-900">{file.name}</p>
                        <p className="text-xs text-blue-700">
                          {file.type || 'unknown'} • {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = selectedFiles.filter((_, i) => i !== index);
                        setSelectedFiles(newFiles);
                        if (newFiles.length === 1) {
                          setSelectedFile(newFiles[0]);
                        } else if (newFiles.length === 0) {
                          setSelectedFile(null);
                        }
                      }}
                      className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* File upload button */}
            <div className="mt-2">
              <label className="block">
                <div className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="mt-2 flex text-sm text-gray-600 justify-center">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        {selectedFiles.length > 0 ? 'Add more files' : 'Upload files'}
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Any file type, up to 10MB each • Select multiple files at once
                    </p>
                    {selectedFiles.length > 0 && (
                      <p className="mt-2 text-sm font-medium text-blue-600">
                        {selectedFiles.length} file(s) ready to upload
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    
                    if (newFiles.length === 0) return;
                    
                    const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
                    if (oversizedFiles.length > 0) {
                      alert(`The following files exceed 10MB:\n${oversizedFiles.map(f => f.name).join('\n')}`);
                      e.target.value = '';
                      return;
                    }
                    
                    const existingNames = selectedFiles.map(f => f.name);
                    const duplicates = newFiles.filter(f => existingNames.includes(f.name));
                    
                    if (duplicates.length > 0) {
                      const confirmAdd = window.confirm(
                        `The following files are already selected:\n${duplicates.map(f => f.name).join('\n')}\n\nDo you want to replace them?`
                      );
                      
                      if (confirmAdd) {
                        const withoutDuplicates = selectedFiles.filter(
                          f => !duplicates.map(d => d.name).includes(f.name)
                        );
                        setSelectedFiles([...withoutDuplicates, ...newFiles]);
                      } else {
                        const uniqueNewFiles = newFiles.filter(
                          f => !existingNames.includes(f.name)
                        );
                        setSelectedFiles([...selectedFiles, ...uniqueNewFiles]);
                      }
                    } else {
                      setSelectedFiles(prev => [...prev, ...newFiles]);
                    }
                    
                    if (selectedFiles.length === 0 && newFiles.length === 1) {
                      setSelectedFile(newFiles[0]);
                    }
                    
                    e.target.value = '';
                  }}
                  accept="*/*"
                />
              </label>
              
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setSelectedFile(null);
                  }}
                  className="mt-2 w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-300 rounded-md transition-colors"
                >
                  Clear all selected files
                </button>
              )}
            </div>
          </div>
        );
        
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={responseData || ''}
            onChange={(e) => setResponseData(e.target.value)}
          />
        );
        
      default:
        return (
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={responseData || ''}
            onChange={(e) => setResponseData(e.target.value)}
            placeholder={task.helperText}
          />
        );
    }
  };
  
  // ---------------------------------------------------------------------------
  // Disabled state — task skipped because parent boolean was answered No
  // ---------------------------------------------------------------------------
  if (isDisabled) {
    return (
      <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 opacity-70">
        <div className="flex items-start gap-3">
          <SkipForward className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-500">{task.fieldLabel}</p>
            <p className="text-xs text-gray-400 mt-1">
              This question has been skipped — it only applies when the previous question is answered <strong>Yes</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${isCompleted ? 'bg-gray-50 border-green-300' : 'bg-white border-gray-200'}`}>
      <div>
        <div className="mb-4 flex items-start">
          <div className="flex-grow">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700">
                {task.fieldLabel}
                {task.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {task.hoverText && (
                <div className="relative ml-2">
                  <HelpCircle
                    className="h-5 w-5 text-gray-400 cursor-help"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  />
                  {showTooltip && (
                    <div className="absolute z-10 w-64 p-2 bg-black text-white text-xs rounded shadow-lg top-0 left-6">
                      {task.hoverText}
                    </div>
                  )}
                </div>
              )}
            </div>
            {task.helperText && !isLocationField(task.fieldName, task.dataType) && (
              <p className="mt-1 text-sm text-gray-500">{task.helperText}</p>
            )}
          </div>
          {isCompleted && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          )}
        </div>

        <div className="mb-4">
          {renderInputField()}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Update'}
          </button>
          {!isCompleted && (
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? 'Completing...' : 'Complete Task'}
            </button>
          )}
        </div>
      </div>
      
      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {previewFile.originalName}
                </h3>
                <p className="text-sm text-gray-500">
                  {previewFile.mimeType} • {(previewFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {previewFile.mimeType.startsWith('image/') && (
                <img 
                  src={previewFile.fileUrl} 
                  alt={previewFile.originalName}
                  className="max-w-full h-auto mx-auto"
                />
              )}
              
              {previewFile.mimeType === 'application/pdf' && (
                <iframe
                  src={previewFile.fileUrl}
                  className="w-full h-[70vh] border-0"
                  title={previewFile.originalName}
                />
              )}
              
              {previewFile.mimeType.startsWith('video/') && (
                <video 
                  src={previewFile.fileUrl} 
                  controls
                  className="max-w-full h-auto mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {previewFile.mimeType.startsWith('audio/') && (
                <audio 
                  src={previewFile.fileUrl} 
                  controls
                  className="w-full"
                >
                  Your browser does not support the audio tag.
                </audio>
              )}
              
              {previewFile.mimeType.startsWith('text/') && (
                <iframe
                  src={previewFile.fileUrl}
                  className="w-full h-[70vh] border-0"
                  title={previewFile.originalName}
                />
              )}
              
              {!canPreviewFile(previewFile.mimeType) && (
                <div className="text-center py-12">
                  <Files className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <a
                    href={previewFile.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Create Risk Modal */}
      {showCreateRiskModal && user && (
        <CreateRiskModal
          isOpen={showCreateRiskModal}
          onClose={handleCloseRiskModal}
          projectId={projectId || ''}
          organizationId={organizationId || ''}
          userRole={user.primaryRole as 'manager' | 'projectCreator' | 'organiser' | 'reviewer' || 'manager'}
          onRiskCreated={handleRiskCreated}
          projectSites={projectSites || []}
          currentUser={{
            _id: user._id,
            name: user.name,
            email: user.email
          }}
          sourceFieldName={riskFieldName}
          initialDescription={
            riskFieldName === 'risk_narrative' ? responseData : 
            `Risk identified from ${task.fieldLabel}`
          }
        />
      )}

      {/* View Risks Modal */}
      {showViewRisksModal && (
        <ViewRisksModal
          isOpen={showViewRisksModal}
          onClose={() => setShowViewRisksModal(false)}
          projectId={projectId || ''}
          organizationId={organizationId || ''}
          sourceFieldName={riskFieldName || task.fieldName}
        />
      )}
    </div>
  );
};

export default TaskField;