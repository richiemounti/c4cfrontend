// data/helpTopicsRegistry.ts
import { HelpTopicMetadata } from '@/types';

export const helpTopicsRegistry: Record<string, HelpTopicMetadata> = {
  // Project Setup section
  'certification': {
    id: 'certification',
    title: 'What certification standards are relevant to my project?',
    description: 'Learn about different certification standards for carbon projects and how to choose the right one.',
    section: 'project-setup',
    lastUpdated: 'May 1, 2025',
    relatedTopics: ['zone', 'governance']
  },
  'zone': {
    id: 'zone',
    title: 'How do I describe the size and ecological zone of my project?',
    description: 'Guidelines for accurately defining your project boundaries and ecological classification.',
    section: 'project-setup',
    lastUpdated: 'April 28, 2025',
    relatedTopics: ['certification', 'upload']
  },
  'governance': {
    id: 'governance',
    title: 'Who should I include when describing project governance?',
    description: 'Identify key stakeholders and decision-makers for your project governance structure.',
    section: 'project-setup',
    lastUpdated: 'April 25, 2025',
    relatedTopics: ['landrights', 'involved']
  },
  'landrights': {
    id: 'landrights',
    title: 'What\'s the difference between customary and formal land rights?',
    description: 'Understanding the distinction between formal legal land rights and customary or traditional land rights.',
    section: 'project-setup',
    lastUpdated: 'April 22, 2025',
    relatedTopics: ['governance', 'riskscan']
  },
  'riskscan': {
    id: 'riskscan',
    title: 'What should I include in a basic political or access risk scan?',
    description: 'How to conduct a thorough assessment of political and access risks for your project area.',
    section: 'project-setup',
    lastUpdated: 'April 20, 2025',
    relatedTopics: ['landrights', 'groups']
  },
  'groups': {
    id: 'groups',
    title: 'How do I identify vulnerable or marginalised groups in the site?',
    description: 'Methods for identifying and engaging with vulnerable or marginalized groups in your project area.',
    section: 'project-setup',
    lastUpdated: 'April 18, 2025',
    relatedTopics: ['riskscan', 'stakeholder']
  },
  'livelihood': {
    id: 'livelihood',
    title: 'What counts as a livelihood or income-generating activity?',
    description: 'Understanding different forms of livelihood activities relevant for carbon projects.',
    section: 'project-setup',
    lastUpdated: 'April 15, 2025',
    relatedTopics: ['groups', 'changes']
  },
  'wildlife': {
    id: 'wildlife',
    title: 'Why do we ask about wildlife conflict at the site level?',
    description: 'The importance of documenting human-wildlife conflicts and how it affects project planning.',
    section: 'project-setup',
    lastUpdated: 'April 12, 2025',
    relatedTopics: ['livelihood', 'riskscan']
  },
  'upload': {
    id: 'upload',
    title: 'How do I upload a map or shapefile for each site?',
    description: 'Step-by-step guide to uploading and managing spatial data for your project sites.',
    section: 'project-setup',
    lastUpdated: 'April 10, 2025',
    relatedTopics: ['zone']
  },
  
  // Stakeholder Mapping section
  'mapping': {
    id: 'mapping',
    title: 'What is Stakeholder Mapping and Why Does it Matter?',
    description: 'An introduction to stakeholder mapping and its importance in carbon project development.',
    section: 'stakeholder-mapping',
    lastUpdated: 'April 8, 2025',
    relatedTopics: ['involved', 'stakeholder']
  },
  'involved': {
    id: 'involved',
    title: 'Who Should Be Involved?',
    description: 'Guidance on identifying and involving key stakeholders in the mapping process.',
    section: 'stakeholder-mapping',
    lastUpdated: 'April 5, 2025',
    relatedTopics: ['mapping', 'activity']
  },
  'activity': {
    id: 'activity',
    title: 'How Should We Facilitate This Activity?',
    description: 'Best practices for facilitating stakeholder mapping sessions and workshops.',
    section: 'stakeholder-mapping',
    lastUpdated: 'April 3, 2025',
    relatedTopics: ['involved', 'stakeholder']
  },
  'stakeholder': {
    id: 'stakeholder',
    title: 'What is a Stakeholder — and What\'s the Difference Between Category and Group?',
    description: 'Understanding stakeholder definitions and the distinction between categories and groups.',
    section: 'stakeholder-mapping',
    lastUpdated: 'April 1, 2025',
    relatedTopics: ['mapping', 'list']
  },
  'list': {
    id: 'list',
    title: 'Already Have a List? Import It.',
    description: 'How to import existing stakeholder lists into the C4C platform.',
    section: 'stakeholder-mapping',
    lastUpdated: 'March 30, 2025',
    relatedTopics: ['stakeholder', 'data']
  },
  'data': {
    id: 'data',
    title: 'What Happens to My Data and Where Does It Go?',
    description: 'Information about data handling, storage, and privacy in the C4C platform.',
    section: 'stakeholder-mapping',
    lastUpdated: 'March 28, 2025',
    relatedTopics: ['list', 'approval']
  },
  'approval': {
    id: 'approval',
    title: 'What needs to be complete before approval?',
    description: 'Requirements and checklist for stakeholder mapping approval process.',
    section: 'stakeholder-mapping',
    lastUpdated: 'March 25, 2025',
    relatedTopics: ['data', 'info']
  },
  'info': {
    id: 'info',
    title: 'Who can see this information?',
    description: 'Details about visibility and access controls for stakeholder information.',
    section: 'stakeholder-mapping',
    lastUpdated: 'March 23, 2025',
    relatedTopics: ['approval', 'data']
  },
  
  // Theory of Change section
  'stages': {
    id: 'stages',
    title: 'What\'s the difference between Stage 1 and Stage 2?',
    description: 'Understanding the two stages of Theory of Change development in the C4C platform.',
    section: 'theory-of-change',
    lastUpdated: 'March 20, 2025',
    relatedTopics: ['completion', 'tocchanges']
  },
  'completion': {
    id: 'completion',
    title: 'Do I have to complete both stages now?',
    description: 'Information about stage completion requirements and timeline flexibility.',
    section: 'theory-of-change',
    lastUpdated: 'March 18, 2025',
    relatedTopics: ['stages', 'collaboration']
  },
  'collaboration': {
    id: 'collaboration',
    title: 'Can I work on this collaboratively with my team?',
    description: 'How to collaborate with team members on Theory of Change development.',
    section: 'theory-of-change',
    lastUpdated: 'March 15, 2025',
    relatedTopics: ['completion', 'stakeholderseparately']
  },
  'stakeholderseparately': {
    id: 'stakeholderseparately',
    title: 'Do I need to do this for each stakeholder separately?',
    description: 'Guidance on developing Theory of Change for different stakeholder groups.',
    section: 'theory-of-change',
    lastUpdated: 'March 13, 2025',
    relatedTopics: ['collaboration', 'repeat']
  },
  'relevant': {
    id: 'relevant',
    title: 'What kinds of domains are relevant?',
    description: 'Overview of relevant domains to consider in your Theory of Change.',
    section: 'theory-of-change',
    lastUpdated: 'March 10, 2025',
    relatedTopics: ['subthemes', 'changes']
  },
  'subthemes': {
    id: 'subthemes',
    title: 'How specific should we be when choosing sub-themes?',
    description: 'Guidelines for selecting appropriate sub-themes for your Theory of Change.',
    section: 'theory-of-change',
    lastUpdated: 'March 8, 2025',
    relatedTopics: ['relevant', 'actions']
  },
  'actions': {
    id: 'actions',
    title: 'What should I include in `actions`?',
    description: 'Guidance on defining specific actions within your Theory of Change.',
    section: 'theory-of-change',
    lastUpdated: 'March 5, 2025',
    relatedTopics: ['subthemes', 'responsibility']
  },
  'responsibility': {
    id: 'responsibility',
    title: 'How do I assign responsibility if multiple people are involved?',
    description: 'Best practices for assigning and tracking responsibilities in your Theory of Change.',
    section: 'theory-of-change',
    lastUpdated: 'March 3, 2025',
    relatedTopics: ['actions', 'collaboration']
  },
  'repeat': {
    id: 'repeat',
    title: 'Do I need to repeat this for each group like women, youth, communities?',
    description: 'Guidance on adapting your Theory of Change for different demographic groups.',
    section: 'theory-of-change',
    lastUpdated: 'March 1, 2025',
    relatedTopics: ['stakeholderseparately', 'changes']
  },
  'changes': {
    id: 'changes',
    title: 'What kinds of changes are included in these domains?',
    description: 'Understanding the various changes and impacts within different domains.',
    section: 'theory-of-change',
    lastUpdated: 'February 28, 2025',
    relatedTopics: ['relevant', 'outputoutcome']
  },
  'outputoutcome': {
    id: 'outputoutcome',
    title: 'How do I define an outcome vs an output?',
    description: 'Understanding the difference between outputs and outcomes in Theory of Change.',
    section: 'theory-of-change',
    lastUpdated: 'February 25, 2025',
    relatedTopics: ['changes', 'logicmodel']
  },
  'risksurerity': {
    id: 'risksurerity',
    title: 'What if we are unsure about risks?',
    description: 'How to handle uncertainty when identifying risks in your Theory of Change.',
    section: 'theory-of-change',
    lastUpdated: 'February 23, 2025',
    relatedTopics: ['riskscan', 'tocchanges']
  },
  'reveiwapprove': {
    id: 'reveiwapprove',
    title: 'Who reviews or approves the Theory of Change?',
    description: 'Understanding the review and approval process for Theory of Change submissions.',
    section: 'theory-of-change',
    lastUpdated: 'February 20, 2025',
    relatedTopics: ['approval', 'tocchanges']
  },
  'tocchanges': {
    id: 'tocchanges',
    title: 'What if our Theory of Change changes later?',
    description: 'How to update and revise your Theory of Change as your project evolves.',
    section: 'theory-of-change',
    lastUpdated: 'February 18, 2025',
    relatedTopics: ['reveiwapprove', 'stages']
  },
  'logicmodel': {
    id: 'logicmodel',
    title: 'Will this automatically generate a logic model?',
    description: 'Information about logic model generation from your Theory of Change.',
    section: 'theory-of-change',
    lastUpdated: 'February 15, 2025',
    relatedTopics: ['outputoutcome', 'downloadcontent']
  },
  'downloadcontent': {
    id: 'downloadcontent',
    title: 'Can I download or compare across sites?',
    description: 'How to export, download, and compare Theory of Change models across different sites.',
    section: 'theory-of-change',
    lastUpdated: 'February 13, 2025',
    relatedTopics: ['logicmodel', 'collaboration']
  },
};