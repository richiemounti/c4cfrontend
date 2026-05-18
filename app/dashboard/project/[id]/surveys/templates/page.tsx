// app/dashboard/project/[id]/surveys/templates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Copy, 
  Eye, 
  Plus, 
  FileText, 
  Users, 
  Clock, 
  Star,
  Grid3X3,
  List,
  Download,
  Bookmark,
  Tag,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import * as surveyApi from '@/lib/api/survey';
import { useToast } from "@/hooks/use-toast";

interface PageParams {
  id: string;
}

interface Template {
  _id: string;
  title: string;
  description?: string;
  templateCategory: 'organizational' | 'community' | 'environmental' | 'social' | 'economic';
  totalQuestions: number;
  estimatedDuration: number;
  stakeholderGroup?: {
    _id: string;
    name: string;
  };
  theoryOfChangeStage?: {
    stageNumber: number;
  };
  createdAt: string;
  creator?: {
    name: string;
  };
  usageCount?: number;
}

const SurveyTemplatesPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    fetchProject();
    fetchTemplates();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await surveyApi.getSurvey(projectId); // This should be getProject, but using survey API for now
      // setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await surveyApi.getSurveyTemplates({
        templateCategory: categoryFilter === 'all' ? undefined : categoryFilter,
        page: 1,
        limit: 50
      });
      
      if (response.success) {
        let sortedTemplates = response.data || [];
        
        // Sort templates
        switch (sortBy) {
          case 'popular':
            sortedTemplates.sort((a: Template, b: Template) => (b.usageCount || 0) - (a.usageCount || 0));
            break;
          case 'name':
            sortedTemplates.sort((a: Template, b: Template) => a.title.localeCompare(b.title));
            break;
          case 'questions':
            sortedTemplates.sort((a: Template, b: Template) => b.totalQuestions - a.totalQuestions);
            break;
          case 'recent':
          default:
            sortedTemplates.sort((a: Template, b: Template) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            break;
        }
        
        setTemplates(sortedTemplates);
      } else {
        setError('Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter, sortBy]);

  const handleUseTemplate = async (templateId: string) => {
    try {
      const response = await surveyApi.cloneSurvey(templateId, {
        projectId: projectId,
        title: `New Survey from Template`
      });
      
      if (response.success) {
        toast({
          title: 'Template Applied',
          description: 'Survey created from template successfully',
        });
        router.push(`/dashboard/project/${projectId}/surveys/${response.data._id}/edit`);
      }
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create survey from template',
        variant: 'destructive',
      });
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    router.push(`/dashboard/project/${projectId}/surveys/${templateId}/take?preview=true`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'organizational': return 'bg-sky-50 text-sky-500 border-sky-500/20';
      case 'community': return 'bg-coral-50 text-coral-500 border-coral-500/20';
      case 'environmental': return 'bg-forest-50 text-forest-500 border-forest-500/20';
      case 'social': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'economic': return 'bg-grass-50 text-grass-500 border-grass-500/20';
      default: return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organizational': return Users;
      case 'community': return Users;
      case 'environmental': return FileText;
      case 'social': return Users;
      case 'economic': return FileText;
      default: return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.templateCategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const templateCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'organizational', label: 'Organizational' },
    { value: 'community', label: 'Community' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'social', label: 'Social' },
    { value: 'economic', label: 'Economic' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Used' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'questions', label: 'Most Questions' }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          <p className="text-stratosphere-900 font-medium ml-4">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={projectId}
        projectName={project?.name || 'Project'}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-concrete-500/20">
          <Link 
            href={`/dashboard/project/${projectId}/surveys`}
            className="flex items-center text-sky-500 hover:text-stratosphere-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Surveys
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-stratosphere-900">Survey Templates</h1>
              <p className="text-sm text-sky-500 mt-1">
                Choose from pre-built survey templates to get started quickly
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Survey
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-concrete-500/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-concrete-500/30 focus:border-sky-500"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48 border-concrete-500/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 border-concrete-500/30">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center border border-concrete-500/30 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Templates Display */}
          {error ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-concrete-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stratosphere-900 mb-2">Error Loading Templates</h3>
              <p className="text-sky-500 mb-4">{error}</p>
              <Button 
                onClick={fetchTemplates}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-concrete-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stratosphere-900 mb-2">No Templates Found</h3>
              <p className="text-sky-500 mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : "No templates are available at the moment"
                }
              </p>
              {searchTerm || categoryFilter !== 'all' ? (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                  variant="outline"
                  className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                  <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Survey
                  </Button>
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.templateCategory);
                return (
                  <Card key={template._id} className="bg-white border-concrete-500/20 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-5 w-5 text-sky-500" />
                          <Badge className={`capitalize text-xs ${getCategoryColor(template.templateCategory)}`}>
                            {template.templateCategory}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUseTemplate(template._id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Use Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePreviewTemplate(template._id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Bookmark className="h-4 w-4 mr-2" />
                              Save to Favorites
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-lg font-semibold text-stratosphere-900 line-clamp-2">
                        {template.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {template.description && (
                        <p className="text-sm text-sky-500 mb-4 line-clamp-3">
                          {template.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-sky-500 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {template.totalQuestions} questions
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ~{template.estimatedDuration} min
                        </div>
                        {template.usageCount && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Used {template.usageCount} times
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-concrete-500">
                          {formatDate(template.createdAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewTemplate(template._id)}
                            className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template._id)}
                            className="bg-sky-500 hover:bg-sky-600 text-white"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-lg border border-concrete-500/20">
              <div className="p-6 border-b border-concrete-500/20">
                <h2 className="text-lg font-semibold text-stratosphere-900">Available Templates</h2>
                <p className="text-sm text-sky-500 mt-1">
                  {filteredTemplates.length} templates found
                </p>
              </div>
              
              <div className="divide-y divide-concrete-500/20">
                {filteredTemplates.map((template) => {
                  const CategoryIcon = getCategoryIcon(template.templateCategory);
                  return (
                    <div key={template._id} className="p-6 hover:bg-stratosphere-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CategoryIcon className="h-5 w-5 text-sky-500" />
                            <h3 className="text-lg font-medium text-stratosphere-900">
                              {template.title}
                            </h3>
                            <Badge className={`capitalize text-xs ${getCategoryColor(template.templateCategory)}`}>
                              {template.templateCategory}
                            </Badge>
                          </div>
                          
                          {template.description && (
                            <p className="text-sm text-sky-500 mb-3 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-sky-500">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {template.totalQuestions} questions
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              ~{template.estimatedDuration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(template.createdAt)}
                            </div>
                            {template.usageCount && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                Used {template.usageCount} times
                              </div>
                            )}
                            {template.creator && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {template.creator.name}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewTemplate(template._id)}
                            className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template._id)}
                            className="bg-sky-500 hover:bg-sky-600 text-white"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create Template CTA */}
          <div className="mt-12 bg-white rounded-lg border border-concrete-500/20 p-8 text-center">
            <FileText className="h-12 w-12 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stratosphere-900 mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-sky-500 mb-6">
              Create a custom survey from scratch using our survey builder, 
              or convert an existing survey into a reusable template.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Survey
                </Button>
              </Link>
              <Link href={`/dashboard/project/${projectId}/surveys`}>
                <Button variant="outline" className="border-sky-500/30 text-sky-500 hover:bg-sky-50">
                  <FileText className="h-4 w-4 mr-2" />
                  View Existing Surveys
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyTemplatesPage;