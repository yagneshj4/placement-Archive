import { useState } from 'react'
import axios from '../api/axios'
import PageWrapper from '../components/layout/PageWrapper'
import { AlertCircle, Loader2, CheckCircle, Clock, Search } from 'lucide-react'

const EXAMPLE_QUESTIONS = [
  'What does Amazon ask in coding interviews?',
  'How do I prepare for system design rounds?',
  'What are common HR interview questions?',
  'Which companies have aptitude tests?',
  'What topics should I focus on for Goldman Sachs?',
]

export default function QandA() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [answer, setAnswer] = useState(null)
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [timing, setTiming] = useState(null)

  const handleAsk = async e => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setAnswer(null)
    setSources([])

    try {
      const response = await axios.post('/ai/qa', {
        query: query.trim(),
        filters,
        n_results: 5,
        use_cache: true,
      })

      if (response.data.success) {
        setAnswer(response.data.data.answer)
        setSources(response.data.data.sources || [])
        setTiming(response.data.data.timing || {})
        
        // Add to history
        setHistory(prev => [{
          id: Date.now(),
          query: query.trim(),
          answer: response.data.data.answer,
          sources: response.data.data.sources,
          timestamp: new Date(),
        }, ...prev.slice(0, 9)])
      } else {
        setError(response.data.message || 'Failed to get answer')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to AI service')
      console.error('RAG query error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = question => {
    setQuery(question)
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask AI</h1>
          <p className="text-gray-600">
            Ask questions about placement interviews. Our AI searches through student experiences and provides grounded answers.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleAsk} className="mb-8">
          <div className="relative mb-4">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What does Amazon ask in interviews? How do I prepare for system design?.."
              disabled={loading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Example questions */}
          {!answer && !loading && (
            <div className="mb-6">
              <p className="text-xs text-gray-600 mb-2 font-medium">Example questions:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExampleClick(q)}
                    disabled={loading}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 text-sm mb-1">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-gray-600">Searching experiences and generating answer...</p>
          </div>
        )}

        {/* Answer section */}
        {answer && !loading && (
          <div className="mb-8">
            {/* Timing info */}
            {timing && (
              <div className="mb-4 flex gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Total: {timing.total_ms}ms</span>
                </div>
                {timing.cached ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Cached response</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <span>Search: {timing.retrieval_ms}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Generate: {timing.llm_ms}ms</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Answer card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Answer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{answer}</p>
              {sources.length > 0 && (
                <p className="text-xs text-gray-500">
                  Grounded in {sources.length} student experience{sources.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Sources</h3>
                <div className="space-y-3">
                  {sources.map((source, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{source.citation}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Match relevance: {Math.round(source.similarity * 100)}%
                          </p>
                        </div>
                        <div className="text-right">
                          {source.company && (
                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                              {source.company}
                            </span>
                          )}
                        </div>
                      </div>
                      {source.role && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Role:</span> {source.role}
                        </p>
                      )}
                      {source.roundType && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Round:</span> {source.roundType.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New question button */}
            <button
              onClick={() => {
                setQuery('')
                setAnswer(null)
                setSources([])
              }}
              className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Ask another question
            </button>
          </div>
        )}

        {/* Recent history (if any) */}
        {history.length > 0 && !answer && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent questions</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setQuery(item.query)
                    setAnswer(item.answer)
                    setSources(item.sources)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition text-sm text-gray-700 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <span>{item.query}</span>
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!answer && !loading && history.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No questions asked yet. Try asking one above!</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
