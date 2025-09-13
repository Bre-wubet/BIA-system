import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const ReportScheduler = ({ report, onSchedule, onCancel }) => {
  const [scheduleData, setScheduleData] = useState({
    frequency: report?.schedule_config?.frequency || 'daily',
    time: report?.schedule_config?.time || '09:00',
    dayOfWeek: report?.schedule_config?.dayOfWeek || 'monday',
    dayOfMonth: report?.schedule_config?.dayOfMonth || 1,
    recipients: report?.schedule_config?.recipients || '',
    format: report?.schedule_config?.format || 'pdf',
    timezone: report?.schedule_config?.timezone || 'UTC',
    enabled: report?.is_scheduled || false
  });

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'html', label: 'HTML' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(scheduleData);
  };

  const getNextRunTime = () => {
    if (!scheduleData.enabled) return 'Not scheduled';
    
    const now = new Date();
    const time = scheduleData.time.split(':');
    const hours = parseInt(time[0]);
    const minutes = parseInt(time[1]);
    
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun.toLocaleString();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable/Disable Schedule */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="enabled"
          checked={scheduleData.enabled}
          onChange={(e) => setScheduleData({...scheduleData, enabled: e.target.checked})}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
          Enable automatic scheduling
        </label>
      </div>

      {scheduleData.enabled && (
        <>
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              value={scheduleData.frequency}
              onChange={(e) => setScheduleData({...scheduleData, frequency: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {frequencies.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              value={scheduleData.time}
              onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Day of Week (for weekly) */}
          {scheduleData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week *
              </label>
              <select
                value={scheduleData.dayOfWeek}
                onChange={(e) => setScheduleData({...scheduleData, dayOfWeek: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {scheduleData.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Month *
              </label>
              <select
                value={scheduleData.dayOfMonth}
                onChange={(e) => setScheduleData({...scheduleData, dayOfMonth: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone *
            </label>
            <select
              value={scheduleData.timezone}
              onChange={(e) => setScheduleData({...scheduleData, timezone: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Recipients *
            </label>
            <textarea
              value={scheduleData.recipients}
              onChange={(e) => setScheduleData({...scheduleData, recipients: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="email1@company.com, email2@company.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple email addresses with commas
            </p>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format *
            </label>
            <select
              value={scheduleData.format}
              onChange={(e) => setScheduleData({...scheduleData, format: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          {/* Next Run Preview */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Schedule Preview</h4>
            <div className="text-sm text-blue-800">
              <div><strong>Frequency:</strong> {frequencies.find(f => f.value === scheduleData.frequency)?.label}</div>
              <div><strong>Time:</strong> {scheduleData.time} ({scheduleData.timezone})</div>
              {scheduleData.frequency === 'weekly' && (
                <div><strong>Day:</strong> {daysOfWeek.find(d => d.value === scheduleData.dayOfWeek)?.label}</div>
              )}
              {scheduleData.frequency === 'monthly' && (
                <div><strong>Day of Month:</strong> {scheduleData.dayOfMonth}</div>
              )}
              <div><strong>Next Run:</strong> {getNextRunTime()}</div>
              <div><strong>Recipients:</strong> {scheduleData.recipients || 'None specified'}</div>
            </div>
          </div>
        </>
      )}

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
          type="submit"
          variant="primary"
        >
          {report?.is_scheduled ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
};

export default ReportScheduler;
