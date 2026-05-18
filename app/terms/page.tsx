// app/terms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, User, Mail, Building, CheckCircle, AlertCircle, ArrowLeft, X, Eye, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { checkEulaStatus, signEula, getEulaContent } from '@/lib/api/eula';

const TermsAndConditionsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    position: '',
    organization: '',
    acceptedTerms: false
  });
  
  const [eulaStatus, setEulaStatus] = useState<any>(null);
  const [eulaContent, setEulaContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEulaModal, setShowEulaModal] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Check EULA status and load content
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsChecking(true);
        
        // Load EULA content (public)
        const content = await getEulaContent();
        setEulaContent(content);
        
        // Check EULA status if authenticated
        if (isAuthenticated) {
          const status = await checkEulaStatus();
          setEulaStatus(status);
        }
      } catch (err) {
        console.error('Error loading EULA data:', err);
      } finally {
        setIsChecking(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('You must be logged in to sign the terms and conditions');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.acceptedTerms) {
      setError('Please fill in all required fields and accept the terms');
      return;
    }

    if (!formData.acceptedTerms) {
      setError('You must accept the terms and conditions to continue');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await signEula(formData);
      setSuccess('Terms and conditions signed successfully!');
      
      // Refresh EULA status
      const updatedStatus = await checkEulaStatus();
      setEulaStatus(updatedStatus);
      
      // Redirect after a brief delay
      setTimeout(() => {
        if (user?.isConnectGoStaff) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to sign terms and conditions');
    } finally {
      setIsLoading(false);
    }
  };

  // Modal component for full EULA document
  const EulaModal = () => {
    if (!showEulaModal) return null;

    const handlePrint = () => {
      const content = document.getElementById('eula-printable-content');
      if (!content) return;

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>End User Licence Agreement - REFLECT</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 40px; line-height: 1.6; }
              h1 { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 8px; }
              h3 { font-size: 15px; font-weight: bold; margin-top: 28px; margin-bottom: 10px; color: #1a5276; }
              p { margin-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              td { padding: 8px 12px; border-bottom: 1px solid #ddd; vertical-align: top; }
              td:first-child { font-weight: bold; min-width: 160px; }
              .warning-box { background: #fef9e7; border: 1px solid #f0c040; border-radius: 4px; padding: 12px; margin-bottom: 20px; text-align: center; font-weight: bold; }
              .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #888; }
              .ml-4 { margin-left: 20px; }
              .ml-8 { margin-left: 40px; }
              a { color: #1a5276; }
              @media print {
                body { padding: 20px; }
                a { color: #1a5276; text-decoration: underline; }
              }
            </style>
          </head>
          <body>
            ${content.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="bg-stratosphere-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-semibold">End User Licence Agreement</h2>
                <p className="text-stratosphere-100 text-sm">Complete Terms & Conditions Document</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-stratosphere-600 rounded-md transition-colors"
                title="Print / Download Document"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowEulaModal(false)}
                className="p-2 hover:bg-stratosphere-600 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="prose max-w-none">

              <div id="eula-printable-content" className="space-y-6 text-sm text-grey-600 leading-relaxed">

                <div className="text-center mb-8">
                  <h1 className="text-xl font-semibold text-grey-600">END USER LICENCE AGREEMENT</h1>
                </div>

                <div className="warning-box bg-ochre-50 border border-ochre-200 rounded-lg p-4 mb-6">
                  <p className="text-ochre-900 font-semibold text-center">
                    PLEASE READ THIS LICENCE AGREEMENT CAREFULLY BEFORE CONTINUING.
                    IF YOU DO NOT ACCEPT THE TERMS OF THIS LICENCE, YOU MUST NOT USE THE PLATFORM.
                  </p>
                </div>

                <p>
                  This End User Licence Agreement (<strong>EULA</strong>) is a legal agreement between:{' '}
                  (1) <strong>You</strong> (the End User);{' '}
                  (2) <strong>CONNECTGO LTD</strong>, incorporated and registered in England and Wales
                  with company number 11200005 whose registered office is at 8b Nevill Terrace,
                  Tunbridge Wells, Kent, England, TN2 5QY (<strong>Supplier</strong>); and{' '}
                  (3) <strong>WEARELEVEL LTD</strong>, incorporated and registered in England and Wales
                  with company number 11268835 whose registered office is at Maisonette 8b Nevill Terrace,
                  Tunbridge Wells, England, TN2 5QY (<strong>Platform Partner</strong>).
                </p>

                <p>
                  This EULA covers the Value Scope platform, branded as REFLECT, in the form of a web-based application,
                  which makes impact measurements ethical, actionable, and investor-ready by providing
                  tools and insights that enable organisations to quantify, analyse, and communicate
                  their social impact effectively (<strong>Platform</strong>).
                </p>

                <p>
                  This EULA grants a licence to use the Platform only. We do not sell or assign the
                  Platform to you.
                </p>

                <p>This EULA was last updated in February 2026.</p>

                <p>
                  It is recommended that you print or save a copy of this EULA for future reference.
                </p>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  1. Definitions and Interpretation
                </h3>

                <p>In this EULA, unless the context otherwise requires, the following expressions have the following meanings:</p>

                <div className="bg-concrete-50 border border-concrete-200 rounded-lg p-4 my-4">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-concrete-200">
                        <td className="font-semibold py-2 pr-4 align-top min-w-[150px]">Authorised User</td>
                        <td className="py-2">an individual authorised by you to use the Platform.</td>
                      </tr>
                      <tr className="border-b border-concrete-200">
                        <td className="font-semibold py-2 pr-4 align-top">Business Day</td>
                        <td className="py-2">any day (other than Saturday, Sunday or public holiday) on which ordinary banks are open for their full range of normal business in England.</td>
                      </tr>
                      <tr className="border-b border-concrete-200">
                        <td className="font-semibold py-2 pr-4 align-top">Confidential Information</td>
                        <td className="py-2">in relation to either party, information which is disclosed to that party by the other party pursuant to or in connection with this EULA (whether orally or in writing or any other medium, and whether or not the information is expressly stated to be confidential or marked as such).</td>
                      </tr>
                      <tr className="border-b border-concrete-200">
                        <td className="font-semibold py-2 pr-4 align-top">Data Protection Legislation</td>
                        <td className="py-2">all applicable legislation in force from time to time in the United Kingdom applicable to data protection and privacy including, but not limited to the retained EU law version of the General Data Protection Regulation ((EU) 2016/679), as it forms part of the law of England and Wales, Scotland, and Northern Ireland by virtue of section 3 of the European Union (Withdrawal) Act 2018); the Data Protection Act 2018 (and regulations made thereunder); and the Privacy and Electronic Communications Regulations 2003 as amended.</td>
                      </tr>
                      <tr className="border-b border-concrete-200">
                        <td className="font-semibold py-2 pr-4 align-top">Fees</td>
                        <td className="py-2">the fees payable by you to us in consideration of use of the Platform.</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-2 pr-4 align-top">party or parties</td>
                        <td className="py-2">the parties to this EULA.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  2. Accepting this EULA
                </h3>

                <div className="space-y-4">
                  <p>2.1. By logging in or otherwise using the Platform, you indicate your acceptance of this EULA and the terms and conditions set out herein, which will become binding on you and your Authorised Users upon your acceptance. By accepting the terms of this EULA, you warrant to us that you have authority to bind your organisation to its terms. If you do not agree to the terms of this EULA, you may not use the Platform.</p>
                  <p>2.2. We are permitted to make changes to this EULA from time to time. Please check back regularly to ensure you have the most up to date information, as the most current EULA will apply to your use of the Platform.</p>
                  <p>2.3. If you do not agree to the changes to this EULA, you must immediately stop all actions permitted under this EULA including, but not limited to, using the Platform.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  3. Ownership of the Platform
                </h3>

                <div className="space-y-4">
                  <p>3.1. The Platform and all intellectual property rights therein (including, but not limited to, copyright) belong to us. This EULA does not grant to you (or sell to you) any rights of ownership in the Platform. This EULA grants you a licence to use the Platform in accordance with the terms and conditions of this EULA only (<strong>Licence</strong>).</p>
                  <p>3.2. We also retain ownership of any and all copies of the Platform and all intellectual property rights therein, regardless of the form in which the copies may exist.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  4. Grant and Scope of Licence
                </h3>

                <div className="space-y-4">
                  <p>4.1. In consideration of your payment of the Fees and your acceptance of this EULA, we hereby grants to you a limited, non-exclusive, non-transferable, royalty free, non-sublicensable licence to use the Platform in accordance with the terms and conditions of this EULA, for business purposes only.</p>
                  <p>4.2. The Licence granted hereunder also extends to any and all updates, patches, fixes and similar that we may provide.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  5. Licence Restrictions
                </h3>

                <p>Except as expressly set out in this EULA or as permitted by any local law, you undertake:</p>

                <div className="space-y-3 ml-4">
                  <p>5.1. not to copy the Platform except where such copying is incidental to normal use of the Platform, or where it is necessary for the purpose of back-up or operational security;</p>
                  <p>5.2. not to rent, lease, sub-license, loan, translate, merge, adapt, vary or modify the Platform;</p>
                  <p>5.3. not to make alterations to, or modifications of, the whole or any part of the Platform, nor permit the Platform or any part of it to be combined with, or become incorporated in, any other programs;</p>
                  <p>5.4. not to disassemble, decompile, reverse-engineer or create derivative works based on the whole or any part of the Platform nor attempt to do any such thing except to the extent that (by virtue of section 296A of the Copyright, Designs and Patents Act 1988) such actions cannot be prohibited because they are essential for the purpose of achieving inter-operability of the Platform with another similar program, and provided that the information obtained by you during such activities:</p>
                  <div className="ml-4 space-y-2">
                    <p>(a) is used only for the purpose of achieving inter-operability of the Platform with another similar program; and</p>
                    <p>(b) is not unnecessarily disclosed or communicated without our prior written consent to any third party; and</p>
                    <p>(c) is not used to create any platform, application or software which is substantially similar to the Platform;</p>
                  </div>
                  <p>5.5. to keep all copies of the Platform secure and to maintain accurate and up-to-date records of the number and locations of all copies of the Platform;</p>
                  <p>5.6. to supervise and control use of the Platform and ensure that the Platform is used by your Authorised Users in accordance with the terms of this Licence;</p>
                  <p>5.7. to include our copyright notice on all entire and partial copies you make of the Platform on any medium;</p>
                  <p>5.8. not to provide or otherwise make available the Platform in whole or in part (including but not limited to program listings, object and source program listings, object code and source code), in any form to any person other than your Authorised Users without our prior written consent;</p>
                  <p>5.9. to comply with all applicable technology control or export laws and regulations; and</p>
                  <p>5.10. not access or attempt to access the Platform by any unauthorised means, including bypassing access controls, using automated tools without permission, or accessing the Platform in a manner that interferes with its normal operation.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  6. Your Undertakings
                </h3>

                <p>You hereby undertake and agree that:</p>

                <div className="space-y-3 ml-4">
                  <p>6.1. you will use and permit the use of the Platform only in accordance with the bounds of the terms and conditions of this EULA;</p>
                  <p>6.2. you will supervise and control any use of the Platform by your Authorised Users and ensure that they are notified of the terms and conditions of this EULA, understand them, and comply with them; and</p>
                  <p>6.3. you will comply with all applicable laws, rules, and regulations governing technology control and export.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  7. Limited Warranty
                </h3>

                <p>The Platform is provided 'as is'. We do not warrant any matter relating to the quality or functioning of the Platform. Although we shall use our commercially reasonable endeavours to ensure that you shall have access to the Platform at all times and will aim to offer a stable and responsive service to you. We do not warrant that the Platform will be uninterrupted, error-free or functional 100% of the time.</p>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  8. Limitation of Liability
                </h3>

                <div className="space-y-3 ml-4">
                  <p>8.1. You acknowledge that the Platform has not been developed to meet your individual requirements, including any particular cybersecurity requirements you might be subject to under law or otherwise, and that it is therefore your responsibility to ensure that the facilities and functions of the Platform meet your requirements.</p>
                  <p>8.2. We only supply the Platform for internal use by your business, and you agree not to use the Platform for any re-sale purposes.</p>
                  <p>8.3. We shall not in any circumstances whatever be liable to you, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, arising under or in connection with this EULA for:</p>
                  <div className="ml-4 space-y-2">
                    <p>(a) loss of profits, sales, business, or revenue;</p>
                    <p>(b) business interruption;</p>
                    <p>(c) loss of anticipated savings;</p>
                    <p>(d) wasted expenditure;</p>
                    <p>(e) loss or corruption of data or information;</p>
                    <p>(f) loss of business opportunity, goodwill or reputation;</p>
                    <p>(g) where any of the losses set out in clause 8.3(a) to 8.3(f) are direct or indirect; or</p>
                    <p>(h) any special, indirect or consequential loss, damage, charges or expenses.</p>
                  </div>
                  <p>8.4. Subject to clause 8.5, other than the losses set out in clause 8.3 (for which we are not liable), our maximum aggregate liability under or in connection with this EULA whether in contract, tort (including negligence) or otherwise, shall in all circumstances be limited to a sum equal to 12 months' Fees, unless otherwise agreed in writing between the parties.</p>
                  <p>8.5. Nothing in this Licence shall limit or exclude our liability for:</p>
                  <div className="ml-4 space-y-2">
                    <p>(a) death or personal injury resulting from our negligence;</p>
                    <p>(b) fraud or fraudulent misrepresentation;</p>
                    <p>(c) any other liability that cannot be excluded or limited by English law.</p>
                  </div>
                  <p>8.6. This EULA sets out the full extent of our obligations and liabilities in respect of the supply of the Platform. Except as expressly stated in this Licence, there are no conditions, warranties, representations or other terms, express or implied, that are binding on us. Any condition, warranty, representation or other term concerning the supply of the Platform which might otherwise be implied into, or incorporated in, this EULA whether by statute, common law or otherwise, is excluded to the fullest extent permitted by law.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  9. Intellectual Property
                </h3>

                <div className="space-y-3 ml-4">
                  <p>9.1. You acknowledge that the Platform is protected by copyright laws and international copyright treaties, as well as other intellectual property rights and treaties.</p>
                  <p>9.2. You will not, during or any time after the termination of this EULA or discontinuance of the Platform, commit or permit any act which infringes those intellectual property rights.</p>
                  <p>9.3. You acknowledge that certain marks identified as registered or unregistered trade marks or service marks are our exclusive property and that no right to use such marks is granted pursuant to this EULA. You will not remove, deface or combine with any other mark or symbol, any marks contained in the service or provided by us.</p>
                  <p>9.4. All intellectual property rights in and to any content, data, materials, or outputs generated by or through the Platform in connection with your use of the Platform (excluding any Personal Data, as defined under the Data Protection Legislation) shall vest in and remain our sole and exclusive property. You acknowledge and agree that you shall have no rights in or to such content other than the limited, non-exclusive, non-transferable, royalty free, non-sublicensable licence to use such content strictly for your internal business purposes in accordance with the terms of this EULA.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  10. Confidential Information
                </h3>

                <div className="space-y-3 ml-4">
                  <p>10.1. You agree to keep confidential and not to use for any purpose other than as necessary to allow you to use the Platform as permitted by the terms of this EULA, all Confidential Information relating to the performance, operation, structure, methods, programming and documentation of the Platform unless you have obtained our prior written approval to your proposed use or disclosure or said disclosure is required to comply with any governmental or other authority or regulatory body.</p>
                  <p>10.2. No party shall use any other party's Confidential Information for any purpose other than to exercise its rights and perform its obligations and the Platform under or in connection with this EULA.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  11. No Other Warranties or Liability
                </h3>

                <div className="space-y-3 ml-4">
                  <p>11.1. This EULA sets out the full extent of our liabilities and obligations with respect to the Platform. Except as expressly set out in this EULA, we are bound by no other conditions, warranties, representations, guarantees, or other terms, whether express or implied.</p>
                  <p>11.2. To the fullest extent permitted by law, any warranties, representations, guarantees, or other terms which may be implied or otherwise incorporated into this EULA whether by statute, common law, or otherwise, are hereby excluded.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  12. Term and Termination of this EULA
                </h3>

                <div className="space-y-3 ml-4">
                  <p>12.1. We may terminate your Licence immediately by written notice to you if you (or any Authorised Users) commit a material or persistent breach of this EULA which you fail to remedy (if remediable) within 14 days after the service of written notice requiring you to do so.</p>
                  <p>12.2. On termination for any reason:</p>
                  <div className="ml-4 space-y-2">
                    <p>(a) all rights granted to you under this Licence shall cease; and</p>
                    <p>(b) you (and all Authorised Users) must immediately cease all activities authorised by this EULA;</p>
                    <p>(c) subject to your compliance with all outstanding obligations under this EULA (including payment of any outstanding fees), you may within [30] days of termination, request:</p>
                    <div className="ml-4 space-y-2">
                      <p>(i) a one-time export of your data in a commonly used format, which we will provide within a reasonable time; or</p>
                      <p>(ii) read-only access to your account for a limited period of [30] days solely for the purpose of retrieving your data; and</p>
                    </div>
                    <p>(d) after the [30] day period referred to in clause 12.2(c), we reserve the right to permanently delete your data, unless otherwise required by law to retain it.</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  13. Privacy and Data Protection
                </h3>

                <div className="space-y-3 ml-4">
                  <p>13.1. In this clause 13, the following terms have the following meanings: <strong>"personal data"</strong>, <strong>"data controller"</strong>, <strong>"data processor"</strong>, shall have the meaning defined in the Data Protection Legislation.</p>
                  <p>13.2. All personal data that we may use will be collected, processed, and held in accordance with the provisions of Data Protection Legislation, your rights and the rights of Authorised Users thereunder.</p>
                  <p>13.3. You agree and acknowledge that unless we are required by law to delete personal data upon termination of this EULA, we may retain anonymised or aggregated data after termination for the purposes of product improvement, analytics, and benchmarking, provided such data does not identify any individual.</p>
                  <p>13.4. The Platform integrates with third party services, including but not limited to Google Workspace. By using the Platform, you acknowledge and agree that certain data may be shared or accessed through Google Workspace services in accordance with Google's applicable terms of service and privacy policies. We encourage you to review Google's privacy policy at <a href="https://policies.google.com/privacy?hl=en-GB" target="_blank" rel="noopener noreferrer" className="text-stratosphere-500 underline hover:no-underline">https://policies.google.com/privacy</a>.</p>
                  <p>13.5. For complete details of our integration with third parties, collection, processing, storage, and retention of personal data including, but not limited to, the purpose(s) for which personal data is used, the legal basis or bases for using it, personal data sharing (where applicable), details of your rights and the rights of Authorised Users and how to exercise those rights please refer to our privacy policy, <a href="https://reflectforcarbon.app/privacy" target="_blank" rel="noopener noreferrer" className="text-stratosphere-500 underline hover:no-underline">https://reflectforcarbon.app/privacy</a> and our cookie policy, both available on our website.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  14. Third Party Rights
                </h3>

                <div className="space-y-3 ml-4">
                  <p>14.1. No part of this EULA is intended to confer rights on any third parties and accordingly the Contracts (Rights of Third Parties) Act 1999 shall not apply to this EULA.</p>
                  <p>14.2. Subject to this clause 14 this EULA shall continue and be binding on the transferee, successors and assigns of either party as required.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  15. Notices
                </h3>

                <div className="space-y-3 ml-4">
                  <p>15.1. All notices under this EULA shall be in writing and be deemed duly given if sent by email to the party's last known contact email address. Time of delivery shall be the time of transmission.</p>
                  <p>15.2. This clause 15 shall not apply to the service of legal proceedings.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  16. Assignment
                </h3>

                <div className="space-y-3 ml-4">
                  <p>16.1. We may transfer our rights and obligations under this EULA to another party at any time. Your rights under this EULA will not be affected by such a transfer.</p>
                  <p>16.2. This EULA and the Licence granted to you under it are personal to you. Except where expressly permitted under this EULA, you may not transfer your rights and obligations under this EULA to another party without our prior written consent.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  17. No Waiver
                </h3>

                <p>No failure or delay by either party to this EULA in exercising any of its rights under this EULA shall be deemed to be a waiver of that right, and no waiver by either party to this EULA of a breach of any provision of this EULA shall be deemed to be a waiver of any subsequent breach of the same or any other provision.</p>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  18. Entire Agreement
                </h3>

                <div className="space-y-3 ml-4">
                  <p>18.1. This EULA and any other document specifically referred to herein contains the entire agreement between the parties with respect to its subject matter.</p>
                  <p>18.2. This EULA supersedes and extinguishes any and all previous agreements, representations, warranties, promises, assurances, and understandings between the parties relating to its subject matter.</p>
                </div>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  19. Severance
                </h3>

                <p>In the event that one or more of the provisions of this EULA is or are found to be unlawful, invalid, or otherwise unenforceable, that or those provision(s) shall be deemed severed from the remainder of this EULA. The remainder of this EULA shall be valid and enforceable.</p>

                <h3 className="text-lg font-semibold text-stratosphere-500 mt-8 mb-4">
                  20. Law and Jurisdiction
                </h3>

                <div className="space-y-3 ml-4">
                  <p>20.1. This EULA (including any non-contractual matters and obligations arising therefrom or associated therewith) shall be governed by, and construed in accordance with, the laws of England and Wales.</p>
                  <p>20.2. Any dispute, controversy, proceedings or claim between the parties relating to this EULA (including any non-contractual matters and obligations arising therefrom or associated therewith) shall fall within the jurisdiction of the courts of England and Wales.</p>
                </div>

                <div className="footer text-center mt-8 pt-6 border-t border-concrete-200">
                  <p className="text-xs text-grey-500">
                    ConnectGo Ltd - Company Number: 11200005<br />
                    8b Nevill Terrace, Tunbridge Wells, Kent, England, TN2 5QY<br />
                    Last Updated: February 2026.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-concrete-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere-500 mx-auto mb-4"></div>
          <p className="text-grey-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show success state if already signed
  if (eulaStatus?.hasSignedCurrent) {
    return (
      <div className="min-h-screen bg-concrete-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/reflecticon.PNG"
                  alt="LEVEL"
                  width={120}
                  height={30}
                  className="h-8 w-auto mx-auto"
                />
              </Link>
              
              <div className="bg-grass-50 border border-grass-200 rounded-lg p-6 mb-6">
                <CheckCircle className="h-12 w-12 text-grass-500 mx-auto mb-4" />
                <h1 className="text-2xl font-semibold text-stratosphere-500 mb-2">
                  Terms & Conditions Accepted
                </h1>
                <p className="text-grey-500">
                  You have already signed the current End User License Agreement (Version {eulaStatus.currentVersion}).
                </p>
                {eulaStatus.latestSignature && (
                  <p className="text-sm text-grey-400 mt-2">
                    Signed on {new Date(eulaStatus.latestSignature.signedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-stratosphere-500 text-white rounded-md hover:bg-stratosphere-900 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-grey-400 text-grey-600 rounded-md hover:bg-concrete-50 transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-concrete-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-stratosphere-500 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.back()}
                  className="text-white hover:text-concrete-100 transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              </div>
              <div className="flex items-center">
                <FileText className="h-8 w-8 mr-3" />
                <div>
                  <h1 className="text-2xl font-semibold">Terms & Conditions</h1>
                  <p className="text-stratosphere-100">
                    End User License Agreement - {eulaContent?.version || 'Current Version'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Alert for authentication requirement */}
              {!isAuthenticated && (
                <div className="bg-ochre-50 border border-ochre-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-ochre-500 mr-3" />
                    <div>
                      <p className="text-ochre-900 font-medium">Sign in required</p>
                      <p className="text-ochre-800 text-sm">
                        You must be signed in to accept the terms and conditions.{' '}
                        <Link href="/account/login" className="underline hover:no-underline">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EULA Summary */}
              <div className="prose max-w-none mb-8">
                <div className="bg-concrete-50 border border-concrete-200 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold text-stratosphere-500 mb-4">
                    END USER LICENCE AGREEMENT
                  </h2>
                  
                  <div className="text-sm text-grey-600 space-y-4">
                    <p>
                      <strong>PLEASE READ THIS LICENCE AGREEMENT CAREFULLY BEFORE CONTINUING.
                      IF YOU DO NOT ACCEPT THE TERMS OF THIS LICENCE, YOU MUST NOT USE THE PLATFORM.</strong>
                    </p>
                    
                    <p>
                      This End User Licence Agreement (<strong>EULA</strong>) is a legal agreement between:{' '}
                      (1) <strong>You</strong> (the End User);{' '}
                      (2) <strong>CONNECTGO LTD</strong>, incorporated and registered in England and Wales
                      with company number 11200005 whose registered office is at 8b Nevill Terrace,
                      Tunbridge Wells, Kent, England, TN2 5QY (<strong>Supplier</strong>); and{' '}
                      (3) <strong>WEARELEVEL LTD</strong>, incorporated and registered in England and Wales
                      with company number 11268835 whose registered office is at Maisonette 8b Nevill Terrace,
                      Tunbridge Wells, England, TN2 5QY (<strong>Platform Partner</strong>).
                    </p>
                    
                    <p>
                      This EULA covers the Value Scope platform, branded as REFLECT, in the form of a web-based application,
                      which makes impact measurements ethical, actionable, and investor-ready by providing
                      tools and insights that enable organisations to quantify, analyse, and communicate
                      their social impact effectively.
                    </p>
                    
                    <div className="bg-sky-50 border border-sky-100 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sky-900 font-medium flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Complete Terms Document
                          </p>
                          <p className="text-sky-800 text-sm mt-1">
                            View the complete End User License Agreement with detailed terms regarding
                            platform usage, intellectual property, limitations of liability, and your rights and obligations.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowEulaModal(true)}
                          className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors flex items-center text-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Read Full Document
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Form */}
              {isAuthenticated && !eulaStatus?.hasSignedCurrent && (
                <div className="border-t border-concrete-200 pt-8">
                  <h3 className="text-lg font-semibold text-stratosphere-500 mb-6">
                    Digital Signature
                  </h3>

                  {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-grass-50 text-grass-600 p-4 rounded-md mb-6 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-stratosphere-500 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-grey-400" />
                          </div>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-grey-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere-500 focus:border-stratosphere-500"
                            placeholder="Your full legal name"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-stratosphere-500 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-grey-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-grey-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere-500 focus:border-stratosphere-500 bg-concrete-50"
                            placeholder="your@email.com"
                            readOnly
                          />
                        </div>
                        <p className="text-xs text-grey-500 mt-1">Email is auto-filled from your account</p>
                      </div>

                      <div>
                        <label htmlFor="position" className="block text-sm font-medium text-stratosphere-500 mb-2">
                          Position/Title
                        </label>
                        <input
                          id="position"
                          name="position"
                          type="text"
                          value={formData.position}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border border-grey-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere-500 focus:border-stratosphere-500"
                          placeholder="Your job title"
                        />
                      </div>

                      <div>
                        <label htmlFor="organization" className="block text-sm font-medium text-stratosphere-500 mb-2">
                          Organization
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-grey-400" />
                          </div>
                          <input
                            id="organization"
                            name="organization"
                            type="text"
                            value={formData.organization}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-grey-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere-500 focus:border-stratosphere-500"
                            placeholder="Your organization name"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-concrete-50 border border-concrete-200 rounded-lg p-6">
                      <div className="flex items-start">
                        <input
                          id="acceptedTerms"
                          name="acceptedTerms"
                          type="checkbox"
                          required
                          checked={formData.acceptedTerms}
                          onChange={handleChange}
                          className="h-5 w-5 text-stratosphere-500 border-grey-400 rounded focus:ring-stratosphere-500 mt-0.5"
                        />
                        <label htmlFor="acceptedTerms" className="ml-3 block text-sm text-grey-600">
                          <span className="font-medium">I acknowledge and agree</span> that I have read,
                          understood, and agree to be bound by the complete End User License Agreement.
                          I understand that by checking this box and submitting this form, I am creating
                          a legally binding digital signature equivalent to a handwritten signature.
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6">
                      <p className="text-sm text-grey-500">
                        Last updated: {eulaContent?.lastUpdated || 'February 2026'}
                      </p>
                      
                      <button
                        type="submit"
                        disabled={isLoading || !formData.acceptedTerms}
                        className="px-8 py-3 bg-stratosphere-500 text-white rounded-md hover:bg-stratosphere-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stratosphere-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Signing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Sign Agreement
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EULA Modal */}
      <EulaModal />
    </>
  );
};

export default TermsAndConditionsPage;