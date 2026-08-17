import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [textResult, setTextResult] = useState(null);
  const [csvResults, setCsvResults] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [audioResult, setAudioResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Text Analysis
  const analyzeText = async () => {
    if (!textInput.trim()) {
      alert('Please enter text to analyze');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      });
      const data = await response.json();
      console.log('Text Analysis Response:', data); // DEBUG
      setTextResult(data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // CSV Analysis
  const analyzeCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Get analysis results
      const analysisRes = await fetch('http://localhost:8000/analyze-csv', {
        method: 'POST',
        body: formData
      });
      const analysisData = await analysisRes.json();
      console.log('CSV Analysis Response:', analysisData); // DEBUG
      setCsvResults(analysisData);

      // Get visualization
      const chartFormData = new FormData();
      chartFormData.append('file', file);
      const chartRes = await fetch('http://localhost:8000/visualize-csv', {
        method: 'POST',
        body: chartFormData
      });
      const chartBlob = await chartRes.blob();
      setChartUrl(URL.createObjectURL(chartBlob));
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Audio Analysis
  const analyzeAudio = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:8000/analyze-audio', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log('Audio Analysis Response:', data); // DEBUG
      setAudioResult(data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Component to render aspects
  const AspectsList = ({ aspects }) => {
    if (!aspects || aspects.length === 0) {
      return <p className="no-aspects">No aspects detected</p>;
    }
    return (
      <div className="aspects-section">
        <h4>🎯 Aspects Detected:</h4>
        <div className="aspects-container">
          {aspects.map((aspect, idx) => (
            <div key={idx} className="aspect-card">
              <div className="aspect-header">
                <span className="aspect-name">{aspect.aspect}</span>
                <span className={`aspect-sentiment sentiment-${aspect.sentiment?.toLowerCase()}`}>
                  {aspect.sentiment}
                </span>
              </div>
              <div className="aspect-keywords">
                <strong>Keywords:</strong>
                <div className="keywords-list">
                  {aspect.keywords && aspect.keywords.length > 0
                    ? aspect.keywords.map((kw, i) => (
                        <span key={i} className="keyword-tag">{kw}</span>
                      ))
                    : <span className="no-keywords">No keywords</span>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🔍 Multi-Modal Sentiment Analysis</h1>
        <p>Analyze text, CSV files, and audio transcriptions</p>
      </header>

      <div className="tabs">
        <button className={activeTab === 'text' ? 'tab active' : 'tab'} onClick={() => setActiveTab('text')}>📝 Text</button>
        <button className={activeTab === 'csv' ? 'tab active' : 'tab'} onClick={() => setActiveTab('csv')}>📊 CSV File</button>
        <button className={activeTab === 'audio' ? 'tab active' : 'tab'} onClick={() => setActiveTab('audio')}>🎤 Audio</button>
      </div>

      <div className="content">
        {activeTab === 'text' && (
          <div className="tab-content">
            <h2>Single Text Analysis</h2>
            <textarea
              placeholder="Enter text to analyze..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
            />
            <button onClick={analyzeText} disabled={loading} className="btn-primary">
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>

            {textResult && (
              <div className="result-card">
                <h3>Analysis Result</h3>
                <div className="result-details">
                  <div className="detail-row">
                    <span className="label">Input:</span>
                    <span className="value">{textResult.input_text}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sentiment:</span>
                    <span className={`value sentiment-${textResult.parsed_result?.overall_sentiment?.toLowerCase()}`}>
                      {textResult.parsed_result?.overall_sentiment || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Emotion:</span>
                    <span className="value">{textResult.parsed_result?.emotion || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sarcasm:</span>
                    <span className="value">{textResult.parsed_result?.sarcasm || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Confidence:</span>
                    <span className="value">{((textResult.confidence || 0) * 100).toFixed(2)}%</span>
                  </div>
                </div>

                {/* ASPECTS DISPLAY - NEW */}
                <AspectsList aspects={textResult.parsed_result?.aspects} />

                {textResult.explainability && textResult.explainability.length > 0 && (
                  <div className="explainability-section">
                    <h4>💡 Why This Analysis?</h4>
                    <ul className="explainability-list">
                      {textResult.explainability.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="tab-content">
            <h2>Batch CSV Analysis</h2>
            <div className="upload-section">
              <label className="file-upload">
                <input type="file" accept=".csv" onChange={analyzeCSV} disabled={loading} />
                <span>{loading ? 'Analyzing...' : '📁 Upload CSV File'}</span>
              </label>
            </div>

            {chartUrl && (
              <div className="visualization-section">
                <h3>📊 Sentiment Distribution</h3>
                <div className="chart-container">
                  <img src={chartUrl} alt="Sentiment Chart" className="sentiment-chart" />
                </div>
              </div>
            )}

            {csvResults && (
              <>
                <div className="results-summary">
                  <p><strong>Total:</strong> {csvResults.total} | <strong>Successful:</strong> {csvResults.successful} | <strong>Failed:</strong> {csvResults.failed}</p>
                </div>

                <div className="results-list">
                  {csvResults.results.map((result, idx) => (
                    <div key={idx} className="result-card">
                      <h4>Review {idx + 1}</h4>
                      <p className="review-text">{result.input_text}</p>
                      <div className="result-details">
                        <div className="detail-row">
                          <span className="label">Sentiment:</span>
                          <span className={`value sentiment-${result.parsed_result?.overall_sentiment?.toLowerCase()}`}>
                            {result.parsed_result?.overall_sentiment || 'N/A'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Emotion:</span>
                          <span className="value">{result.parsed_result?.emotion || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Sarcasm:</span>
                          <span className="value">{result.parsed_result?.sarcasm || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Confidence:</span>
                          <span className="value">{((result.confidence || 0) * 100).toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* ASPECTS DISPLAY - NEW */}
                      <AspectsList aspects={result.parsed_result?.aspects} />

                      {result.explainability && result.explainability.length > 0 && (
                        <details className="explainability-details">
                          <summary>💡 View Explanation</summary>
                          <ul className="explainability-list">
                            {result.explainability.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="tab-content">
            <h2>Audio Transcription & Analysis</h2>
            <div className="upload-section">
              <label className="file-upload">
                <input type="file" accept=".mp3,.wav,.m4a,.ogg,.flac" onChange={analyzeAudio} disabled={loading} />
                <span>{loading ? 'Analyzing...' : '🎤 Upload Audio File'}</span>
              </label>
            </div>

            {audioResult && (
              <div className="result-card">
                <h3>Analysis Result</h3>
                <div className="result-details">
                  <div className="detail-row">
                    <span className="label">Transcription:</span>
                    <span className="value">{audioResult.transcription}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sentiment:</span>
                    <span className={`value sentiment-${audioResult.parsed_analysis?.overall_sentiment?.toLowerCase()}`}>
                      {audioResult.parsed_analysis?.overall_sentiment || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Emotion:</span>
                    <span className="value">{audioResult.parsed_analysis?.emotion || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sarcasm:</span>
                    <span className="value">{audioResult.parsed_analysis?.sarcasm || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Confidence:</span>
                    <span className="value">{((audioResult.confidence || 0) * 100).toFixed(2)}%</span>
                  </div>
                </div>

                {/* ASPECTS DISPLAY - NEW */}
                <AspectsList aspects={audioResult.parsed_analysis?.aspects} />

                {audioResult.explainability && audioResult.explainability.length > 0 && (
                  <div className="explainability-section">
                    <h4>💡 Why This Analysis?</h4>
                    <ul className="explainability-list">
                      {audioResult.explainability.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
