import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

interface TimeRangeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (timeRange: TimeRange) => void;
  queryTitle?: string;
}

interface TimeRange {
  type: 'relative' | 'absolute';
  relative?: {
    value: number;
    unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  };
  absolute?: {
    startTime: string;
    endTime: string;
    startDate?: string;
    endDate?: string;
  };
  timezone: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  isOpen,
  onClose,
  onApply,
  queryTitle = "Execute Query"
}) => {
  const [selectedTab, setSelectedTab] = useState<'relative' | 'absolute'>('relative');
  const [relativeValue, setRelativeValue] = useState(15);
  const [relativeUnit, setRelativeUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months'>('minutes');
  const [startTime, setStartTime] = useState('15:56:03');
  const [endTime, setEndTime] = useState('16:11:03');
  const [selectedDate, setSelectedDate] = useState('2025-08-12');
  const [timezone, setTimezone] = useState('America/Los_Angeles');

  if (!isOpen) return null;

  const handleApply = () => {
    const timeRange: TimeRange = {
      type: selectedTab,
      timezone,
      ...(selectedTab === 'relative' 
        ? { relative: { value: relativeValue, unit: relativeUnit } }
        : { absolute: { startTime, endTime, startDate: selectedDate, endDate: selectedDate } }
      )
    };
    onApply(timeRange);
    onClose();
  };

  const timeOptions = {
    seconds: [1, 5, 10, 15, 30, 45],
    minutes: [1, 5, 10, 15, 30, 45],
    hours: [1, 2, 3, 6, 8, 12],
    days: [1, 2, 3, 4, 5, 6],
    weeks: [1, 2, 3, 4, 5, 6],
    months: [1, 2, 3, 4, 5, 6]
  };

  return (
    <div className="fixed top-0 left-0 w-100 h-100 bg-black-40 flex items-center justify-center z-999">
      <div className="bg-primary br3 shadow-2 w-90 mw6 border-theme" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
        {/* Header */}
        <div className="pa3 border-bottom border-theme flex justify-between items-center">
          <h3 className="ma0 f5 fw6 text-primary">{queryTitle}</h3>
          <button onClick={onClose} className="bn bg-transparent pointer f4" style={{ color: 'var(--text-secondary)' }}>
            <X className="w1 h1" />
          </button>
        </div>

        {/* Time Range Controls */}
        <div className="pa3">
          <div className="flex mb3">
            <div className="flex border-theme br2 overflow-hidden" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
              <button
                onClick={() => setSelectedTab('relative')}
                className={`pa2 f6 bn pointer ${selectedTab === 'relative' ? 'bg-blue white' : 'bg-primary text-secondary'}`}
              >
                <Clock className="w1 h1 mr1" />
                Relative
              </button>
              <button
                onClick={() => setSelectedTab('absolute')}
                className={`pa2 f6 bn pointer ${selectedTab === 'absolute' ? 'bg-blue white' : 'bg-primary text-secondary'}`}
              >
                <Calendar className="w1 h1 mr1" />
                Absolute
              </button>
            </div>
          </div>

          {selectedTab === 'relative' ? (
            <div>
              {Object.entries(timeOptions).map(([unit, values]) => (
                <div key={unit} className="mb3">
                  <div className="f6 fw5 text-primary mb2 ttc">{unit}</div>
                  <div className="flex flex-wrap gap2">
                    {values.map(value => (
                      <button
                        key={value}
                        onClick={() => {
                          setRelativeValue(value);
                          setRelativeUnit(unit as any);
                        }}
                        className={`pa2 br2 f6 pointer bn ${
                          relativeValue === value && relativeUnit === unit
                            ? 'bg-blue white'
                            : 'bg-tertiary text-primary hover-bg-secondary'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="mb3">
                <div className="f6 fw5 dark-gray mb2">Custom</div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={relativeValue}
                    onChange={(e) => setRelativeValue(Number(e.target.value))}
                    className="w3 pa2 ba b--light-gray br2 mr2"
                    min="1"
                  />
                  <select
                    value={relativeUnit}
                    onChange={(e) => setRelativeUnit(e.target.value as any)}
                    className="pa2 border-theme br2 bg-primary text-primary"
                    style={{ borderWidth: '1px', borderStyle: 'solid', outline: 'none' }}
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb3">
                <div className="f6 fw5 text-primary mb2">Date</div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-100 pa2 border-theme br2 bg-primary text-primary"
                  style={{ borderWidth: '1px', borderStyle: 'solid', outline: 'none' }}
                />
              </div>
              
              <div className="flex mb3">
                <div className="flex-1 mr2">
                  <div className="f6 fw5 text-primary mb2">Start time</div>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-100 pa2 border-theme br2 bg-primary text-primary"
                    style={{ borderWidth: '1px', borderStyle: 'solid', outline: 'none' }}
                    step="1"
                  />
                </div>
                <div className="flex-1 ml2">
                  <div className="f6 fw5 text-primary mb2">End time</div>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-100 pa2 border-theme br2 bg-primary text-primary"
                    style={{ borderWidth: '1px', borderStyle: 'solid', outline: 'none' }}
                    step="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Timezone */}
          <div className="mb3">
            <div className="f6 fw5 text-primary mb2">Timezone</div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-100 pa2 border-theme br2 bg-primary text-primary"
              style={{ borderWidth: '1px', borderStyle: 'solid', outline: 'none' }}
            >
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="America/New_York">America/New_York</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="pa3 border-top border-theme flex justify-end">
          <button
            onClick={onClose}
            className="pa2 mr2 border-theme bg-primary text-secondary br2 pointer f6"
            style={{ borderWidth: '1px', borderStyle: 'solid' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="pa2 bg-blue white br2 bn pointer f6"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSelector;
