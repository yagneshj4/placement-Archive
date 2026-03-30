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
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-white text-3xl">◆</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Ask the Archive</h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
            Skip searching manually. Our AI engine directly reads thousands of VRSEC placement experiences to give you exact, grounded answers.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleAsk} className="mb-10 max-w-3xl mx-auto">
          <div className="relative mb-6">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What does Amazon ask in interviews? How do I prepare for system design?..."
              disabled={loading}
              className="w-full px-6 py-5 pr-16 bg-white border border-gray-200 rounded-[1.5rem] text-[15px] font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 shadow-lg transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:-translate-y-[1px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
          </div>

          {/* Example questions */}
          {!answer && !loading && (
            <div className="mb-8 flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Example questions</p>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExampleClick(q)}
                    disabled={loading}
                    className="text-xs font-bold px-4 py-2 bg-white border border-gray-200 hover:border-gray-900 text-gray-600 hover:text-gray-900 shadow-sm rounded-full transition-all disabled:opacity-50 hover:-translate-y-[1px]"
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
          <div className="max-w-3xl mx-auto mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <h3 className="font-black text-red-900 text-sm mb-1 tracking-wide">Query Failed</h3>
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20 bg-white rounded-[1.5rem] max-w-3xl mx-auto border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Loader2 className="w-6 h-6 animate-spin text-gray-900" strokeWidth={3} />
            </div>
            <p className="text-gray-900 font-black tracking-wide text-lg">Synthesizing Experiences...</p>
            <p className="text-gray-400 font-semibold text-sm mt-1">Cross-referencing database with AI</p>
          </div>
        )}

        {/* Answer section */}
        {answer && !loading && (
          <div className="max-w-3xl mx-auto mb-12">
            
            {/* Answer card */}
            <div className="bg-white border border-gray-200 rounded-[1.5rem] p-8 mb-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-900" />
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shadow-md">
                   <span className="text-white text-xs">◆</span>
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">AI Synthesis</h2>
              </div>
              
              <p className="text-gray-800 leading-[1.8] mb-6 font-medium text-[15px] whitespace-pre-wrap">{answer}</p>
              
              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                {sources.length > 0 && (
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                    Grounded in {sources.length} student experience{sources.length !== 1 ? 's' : ''}
                  </p>
                )}

                {/* Timing info */}
                {timing && (
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {timing.cached ? (
                      <div className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-2.5 py-1 rounded border border-teal-100">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>Cached 0ms</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                          <Search className="w-3.5 h-3.5" />
                          <span>RAG: {timing.retrieval_ms}ms</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                          <Clock className="w-3.5 h-3.5" />
                          <span>LLM: {timing.llm_ms}ms</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1">Verified Sources</h3>
                <div className="space-y-3">
                  {sources.map((source, i) => (
                    <div key={i} className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-extrabold text-[13px] text-gray-900 leading-snug">{source.citation}</p>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mt-2">
                            {Math.round(source.similarity * 100)}% Match Relevance
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {source.company && (
                            <span className="inline-block px-3 py-1 bg-gray-900 text-white text-[10px] uppercase tracking-widest rounded-md font-black shadow-sm">
                              {source.company}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        {source.role && (
                          <p className="bg-gray-50 px-3 py-1 rounded shadow-inner border border-gray-100">
                            Role: <span className="text-gray-900">{source.role}</span>
                          </p>
                        )}
                        {source.roundType && (
                          <p className="bg-gray-50 px-3 py-1 rounded shadow-inner border border-gray-100">
                            Round: <span className="text-gray-900">{source.roundType.replace(/_/g, ' ')}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New question button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setQuery('')
                  setAnswer(null)
                  setSources([])
                }}
                className="text-[11px] uppercase tracking-widest font-black px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white hover:shadow-xl transition-all"
              >
                Ask another question
              </button>
            </div>
          </div>
        )}

        {/* Recent history (if any) */}
        {history.length > 0 && !answer && (
          <div className="max-w-3xl mx-auto mt-16 pt-10 border-t border-gray-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">Recent queries</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setQuery(item.query)
                    setAnswer(item.answer)
                    setSources(item.sources)
                  }}
                  className="w-full text-left px-5 py-4 bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md rounded-2xl transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 truncate">{item.query}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex-shrink-0 bg-gray-50 px-2 py-1 rounded">
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
          <div className="text-center py-20 bg-white border border-gray-100 rounded-[2rem] max-w-3xl mx-auto shadow-sm mt-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
              <Search className="w-6 h-6 text-gray-300" strokeWidth={3} />
            </div>
            <p className="text-gray-500 font-bold text-sm">No questions asked yet.</p>
            <p className="text-gray-400 font-medium text-xs mt-1">Start typing above to search the archive.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
