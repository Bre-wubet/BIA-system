import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

import { MdContentCopy, MdEmail, MdLink, MdPublic, MdLock } from 'react-icons/md';

const ReportSharing = ({ report, onShare, onCancel }) => {
  const [shareData, setShareData] = useState({
    isPublic: report?.is_public || false,
    allowDownload: true,
    allowView: true,
    password: '',
    expiresAt: '',
    recipients: '',
    message: ''
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onShare(shareData);
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const reportId = report?.id || 'new';
    const link = `${baseUrl}/reports/shared/${reportId}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show success message
      alert('Link copied to clipboard!');
    });
  };

  const shareOptions = [
    {
      type: 'public',
      title: 'Public Link',
      description: 'Anyone with the link can view this report',
      icon: MdPublic,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      type: 'password',
      title: 'Password Protected',
      description: 'Requires a password to view',
      icon: MdLock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      type: 'email',
      title: 'Email Recipients',
      description: 'Send directly to specific people',
      icon: MdEmail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Share Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Sharing Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = 
              (option.type === 'public' && shareData.isPublic) ||
              (option.type === 'password' && shareData.password) ||
              (option.type === 'email' && shareData.recipients);
            
            return (
              <div
                key={option.type}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  if (option.type === 'public') {
                    setShareData({...shareData, isPublic: !shareData.isPublic});
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${option.bgColor}`}>
                    <Icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{option.title}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Public Sharing */}
      {shareData.isPublic && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Public Link Settings</h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowDownload"
                checked={shareData.allowDownload}
                onChange={(e) => setShareData({...shareData, allowDownload: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowDownload" className="ml-2 block text-sm text-gray-900">
                Allow download
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowView"
                checked={shareData.allowView}
                onChange={(e) => setShareData({...shareData, allowView: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowView" className="ml-2 block text-sm text-gray-900">
                Allow viewing
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={shareData.expiresAt}
              onChange={(e) => setShareData({...shareData, expiresAt: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={generateShareLink}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <MdLink className="w-4 h-4" />
              <span>Generate Link</span>
            </Button>
            {generatedLink && (
              <Button
                onClick={() => copyToClipboard(generatedLink)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <MdContentCopy className="w-4 h-4" />
                <span>Copy Link</span>
              </Button>
            )}
          </div>

          {generatedLink && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Share this link:</p>
              <code className="text-sm bg-white p-2 rounded border block break-all">
                {generatedLink}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Password Protection */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Password Protection</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={shareData.password}
              onChange={(e) => setShareData({...shareData, password: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <MdLock className="w-4 h-4 text-gray-400" />
              ) : (
                <MdPublic className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Sharing */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Email Recipients</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Addresses
          </label>
          <textarea
            value={shareData.recipients}
            onChange={(e) => setShareData({...shareData, recipients: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="email1@company.com, email2@company.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple email addresses with commas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={shareData.message}
            onChange={(e) => setShareData({...shareData, message: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add a personal message..."
          />
        </div>
      </div>

      {/* Share Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Sharing Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div><strong>Report:</strong> {report?.name}</div>
          <div><strong>Public:</strong> {shareData.isPublic ? 'Yes' : 'No'}</div>
          {shareData.password && <div><strong>Password Protected:</strong> Yes</div>}
          {shareData.recipients && <div><strong>Email Recipients:</strong> {shareData.recipients.split(',').length} people</div>}
          {shareData.expiresAt && <div><strong>Expires:</strong> {new Date(shareData.expiresAt).toLocaleDateString()}</div>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
        >
          Share Report
        </Button>
      </div>
    </div>
  );
};

export default ReportSharing;
