import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, AlertCircle, X, Edit2, Trash2, Bell, Calendar as CalendarIcon } from 'lucide-react';

// System Design: Event Data Model with Persistence
const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Chhat Puja (Pratihar Sashthi/Sandhya Arghya)",
    date: "2025-11-28",
    time: "08:30",
    duration: 120,
    color: "#16a34a",
    description: "Traditional Hindu festival",
    reminder: 30
  },
  {
    id: 2,
    title: "Advanced Java",
    date: "2025-11-02",
    time: "12:00",
    duration: 60,
    color: "#3b82f6",
    description: "Programming class",
    reminder: 15
  },
  {
    id: 3,
    title: "Async Programming",
    date: "2025-11-01",
    time: "08:30",
    duration: 90,
    color: "#3b82f6",
    description: "Advanced programming concepts",
    reminder: 15
  },
  {
    id: 4,
    title: "Dynamic Programming - I",
    date: "2025-11-01",
    time: "11:00",
    duration: 120,
    color: "#3b82f6",
    description: "Algorithm course",
    reminder: 15
  },
  {
    id: 5,
    title: "Async Programming - II",
    date: "2025-11-01",
    time: "17:00",
    duration: 90,
    color: "#3b82f6",
    description: "Advanced session",
    reminder: 15
  }
];

// Utility Functions
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const checkEventOverlap = (event1, event2) => {
  if (event1.date !== event2.date) return false;
  const start1 = parseTime(event1.time);
  const end1 = start1 + event1.duration;
  const start2 = parseTime(event2.time);
  const end2 = start2 + event2.duration;
  return start1 < end2 && start2 < end1;
};

// Event Creation/Edit Modal Component
const EventModal = ({ isOpen, onClose, onSave, event, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate || '',
    time: '09:00',
    duration: 60,
    color: '#3b82f6',
    description: '',
    reminder: 15
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [event, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: event?.id || Date.now(),
      duration: parseInt(formData.duration),
      reminder: parseInt(formData.reminder)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="icon-btn">
            <X className="icon" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Add title"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                min="15"
                step="15"
                required
              />
            </div>
            <div className="form-group">
              <label>Reminder (minutes before)</label>
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
              >
                <option value="0">No reminder</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">1 day</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {['#3b82f6', '#16a34a', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899'].map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add description"
              rows="3"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event Details Modal
const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-details" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event.title}</h2>
          <button onClick={onClose} className="icon-btn">
            <X className="icon" />
          </button>
        </div>
        <div className="event-details-body">
          <div className="detail-row">
            <CalendarIcon className="detail-icon" />
            <span>{event.date}</span>
          </div>
          <div className="detail-row">
            <Clock className="detail-icon" />
            <span>{event.time} ({event.duration} minutes)</span>
          </div>
          {event.reminder > 0 && (
            <div className="detail-row">
              <Bell className="detail-icon" />
              <span>Reminder {event.reminder} minutes before</span>
            </div>
          )}
          {event.description && (
            <div className="detail-row description">
              <p>{event.description}</p>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={() => onDelete(event.id)} className="btn-danger">
            <Trash2 className="icon-sm" />
            Delete
          </button>
          <button onClick={() => onEdit(event)} className="btn-primary">
            <Edit2 className="icon-sm" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, hasConflict, onClick }) => {
  const isAllDay = event.duration >= 1440;

  return (
    <div
      className="event-card"
      style={{ backgroundColor: event.color }}
      title={`${event.title} - ${event.time}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      {hasConflict && <AlertCircle className="icon-conflict" />}
      {!isAllDay && <Clock className="icon-clock" />}
      <span className="event-title">{isAllDay ? event.title : `${event.time} ${event.title}`}</span>
    </div>
  );
};

// Calendar Day Cell Component
const DayCell = ({ day, isCurrentMonth, isToday, events, conflicts, onDayClick, onEventClick }) => {
  if (!isCurrentMonth) {
    return <div className="day-cell empty"></div>;
  }

  return (
    <div
      className={`day-cell ${isToday ? 'today' : ''}`}
      onClick={() => onDayClick(day)}
    >
      <div className={`day-number ${isToday ? 'today-number' : ''}`}>
        {day}
        {isToday && <span className="today-badge">Today</span>}
      </div>
      <div className="events-container">
        {events.slice(0, 3).map(event => (
          <EventCard
            key={event.id}
            event={event}
            hasConflict={conflicts.has(event.id)}
            onClick={onEventClick}
          />
        ))}
        {events.length > 3 && (
          <div className="more-events">+{events.length - 3} more</div>
        )}
      </div>
    </div>
  );
};

// Main Calendar Component
function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load events from memory (simulating local storage)
  useEffect(() => {
    const savedEvents = events;
    // In real app: localStorage.getItem('calendar-events')
    if (savedEvents) {
      setEvents(savedEvents);
    }
  }, []);

  // Save events (simulating sync to cloud)
  useEffect(() => {
    // In real app: localStorage.setItem('calendar-events', JSON.stringify(events))
    console.log('Syncing events to cloud...', events);
  }, [events]);

  // Check for event reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      events.forEach(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const reminderTime = new Date(eventDateTime.getTime() - event.reminder * 60000);

        if (now >= reminderTime && now < eventDateTime) {
          const notificationKey = `${event.id}-${event.date}-${event.time}`;
          if (!notifications.includes(notificationKey)) {
            showNotification(event);
            setNotifications(prev => [...prev, notificationKey]);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately
    return () => clearInterval(interval);
  }, [events, notifications]);

  const showNotification = (event) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Event Reminder', {
        body: `${event.title} starts at ${event.time}`,
        icon: '📅'
      });
    } else {
      alert(`Reminder: ${event.title} starts at ${event.time}`);
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Event handlers
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(formatDate(year, month, new Date().getDate()));
    setIsModalOpen(true);
  };

  const handleDayClick = (day) => {
    setSelectedDate(formatDate(year, month, day));
    setIsModalOpen(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleSaveEvent = (eventData) => {
    if (selectedEvent) {
      setEvents(events.map(e => e.id === eventData.id ? eventData : e));
    } else {
      setEvents([...events, eventData]);
    }
    setIsModalOpen(false);
  };

  const handleEditEvent = (event) => {
    setIsDetailsOpen(false);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== eventId));
      setIsDetailsOpen(false);
    }
  };

  // Calendar grid calculation
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: formatDate(year, month - 1, prevMonthDays - i)
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: formatDate(year, month, day)
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: formatDate(year, month + 1, day)
      });
    }

    return days;
  }, [year, month]);

  // Event organization
  const { eventsByDate, conflicts } = useMemo(() => {
    const eventsByDate = new Map();
    const conflicts = new Set();

    events.forEach(event => {
      if (!eventsByDate.has(event.date)) {
        eventsByDate.set(event.date, []);
      }
      eventsByDate.get(event.date).push(event);
    });

    eventsByDate.forEach(events => {
      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          if (checkEventOverlap(events[i], events[j])) {
            conflicts.add(events[i].id);
            conflicts.add(events[j].id);
          }
        }
      }
    });

    return { eventsByDate, conflicts };
  }, [events]);

  const today = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-app">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo">
                <svg className="logo-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
              </div>
              <h1 className="title">Calendar</h1>
            </div>

            <button onClick={goToToday} className="today-btn">
              Today
            </button>

            <div className="nav-buttons">
              <button onClick={goToPreviousMonth} className="nav-btn">
                <ChevronLeft className="nav-icon" />
              </button>
              <button onClick={goToNextMonth} className="nav-btn">
                <ChevronRight className="nav-icon" />
              </button>
            </div>

            <h2 className="current-month">
              {monthNames[month]} {year}
            </h2>
          </div>

          <button onClick={handleCreateEvent} className="create-btn">
            <Plus className="create-icon" />
            Create
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-container">
        <div className="calendar-grid-wrapper">
          <div className="weekday-headers">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((dayInfo, index) => {
              const isToday = dayInfo.isCurrentMonth &&
                dayInfo.day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              const dayEvents = eventsByDate.get(dayInfo.date) || [];

              return (
                <DayCell
                  key={index}
                  day={dayInfo.day}
                  isCurrentMonth={dayInfo.isCurrentMonth}
                  isToday={isToday}
                  events={dayEvents}
                  conflicts={conflicts}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                />
              );
            })}
          </div>
        </div>

        <div className="legend">
          <div className="legend-item">
            <AlertCircle className="legend-icon conflict" />
            <span>Scheduling conflict detected</span>
          </div>
          <div className="legend-item">
            <Bell className="legend-icon" />
            <span>Reminders enabled</span>
          </div>
          <div className="legend-item">
            <span className="event-count">{events.length} events total</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
      />

      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}

export default App;