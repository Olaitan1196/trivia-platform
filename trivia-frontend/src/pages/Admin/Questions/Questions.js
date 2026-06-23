import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import './Questions.css';

function Questions() {
  const [formData, setFormData] = useState({
    subject: 'sports',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctOptionIndex: '0',
    timeLimitSeconds: '12',
    difficulty: 'medium',
  });

  const [csvFile, setCsvFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        subject: formData.subject,
        questionText: formData.questionText,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        correctOptionIndex: Number(formData.correctOptionIndex),
        timeLimitSeconds: Number(formData.timeLimitSeconds),
        difficulty: formData.difficulty,
      };

      const response = await axios.post('http://localhost:5000/api/questions/add', payload, { headers });

      setMessage(response.data.message);
      setFormData({
        subject: 'sports',
        questionText: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctOptionIndex: '0',
        timeLimitSeconds: '12',
        difficulty: 'medium',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!csvFile) {
      setError('Please select a CSV file first');
      return;
    }

    setBulkSubmitting(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const questions = results.data.map((row) => ({
            subject: row.subject,
            questionText: row.questionText,
            options: [row.option1, row.option2, row.option3, row.option4],
            correctOptionIndex: Number(row.correctOptionIndex),
            timeLimitSeconds: Number(row.timeLimitSeconds) || 12,
            difficulty: row.difficulty || 'medium',
          }));

          const response = await axios.post(
            'http://localhost:5000/api/questions/add-bulk',
            { questions },
            { headers }
          );

          setMessage(response.data.message);
          setCsvFile(null);
        } catch (err) {
          setError(err.response?.data?.message || 'Bulk upload failed');
        } finally {
          setBulkSubmitting(false);
        }
      },
      error: () => {
        setError('Failed to read CSV file');
        setBulkSubmitting(false);
      },
    });
  };

  return (
    <div className="questions-page">
      <h2>Questions Management</h2>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="forms-grid">
        <form className="question-form" onSubmit={handleSingleSubmit}>
          <h3>Add Single Question</h3>

          <label>Subject</label>
          <select name="subject" value={formData.subject} onChange={handleChange} required>
            <option value="sports">Sports</option>
            <option value="academics">Academics</option>
            <option value="language">Language</option>
          </select>

          <label>Question Text</label>
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleChange}
            required
          />

          <label>Option 1</label>
          <input type="text" name="option1" value={formData.option1} onChange={handleChange} required />

          <label>Option 2</label>
          <input type="text" name="option2" value={formData.option2} onChange={handleChange} required />

          <label>Option 3</label>
          <input type="text" name="option3" value={formData.option3} onChange={handleChange} required />

          <label>Option 4</label>
          <input type="text" name="option4" value={formData.option4} onChange={handleChange} required />

          <label>Correct Option (0 = first, 1 = second, 2 = third, 3 = fourth)</label>
          <select name="correctOptionIndex" value={formData.correctOptionIndex} onChange={handleChange} required>
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>

          <label>Time Limit (seconds)</label>
          <input
            type="number"
            name="timeLimitSeconds"
            value={formData.timeLimitSeconds}
            onChange={handleChange}
            required
          />

          <label>Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Question'}
          </button>
        </form>

        <form className="bulk-form" onSubmit={handleBulkSubmit}>
          <h3>Bulk Upload via CSV</h3>

          <p className="bulk-instructions">
            CSV columns required: subject, questionText, option1, option2, option3, option4, correctOptionIndex, timeLimitSeconds, difficulty
          </p>

          <input type="file" accept=".csv" onChange={handleFileChange} />

          <button type="submit" disabled={bulkSubmitting}>
            {bulkSubmitting ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Questions;