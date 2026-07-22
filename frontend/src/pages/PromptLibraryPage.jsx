import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Copy,
  Check,
  Search,
  Code,
  PenTool,
  TrendingUp,
  Shield,
  Palette,
  Globe,
  Lightbulb,
  Bot,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { toast } from 'react-toastify'
import TiltCard from '../components/UI/TiltCard'

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: BookOpen },
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'analysis', label: 'Analysis', icon: TrendingUp },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'translate', label: 'Translate', icon: Globe },
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb },
  { id: 'ai', label: 'AI Prompting', icon: Bot },
]

const TEMPLATES = [
  {
    id: 1, category: 'coding', emoji: '🔍', title: 'Code Review',
    description: 'Thorough review with suggestions for improvements and bugs.',
    tags: ['review', 'quality', 'bugs'],
    prompt: `Please perform a thorough code review of the following code. Identify:\n1. Bugs and potential runtime errors\n2. Security vulnerabilities\n3. Performance bottlenecks\n4. Code style and readability improvements\n5. Missing edge case handling\n\nProvide concrete suggestions with corrected code examples where applicable.\n\n\`\`\`\n[PASTE YOUR CODE HERE]\n\`\`\``,
  },
  {
    id: 2, category: 'coding', emoji: '📝', title: 'Generate Unit Tests',
    description: 'Create comprehensive unit tests for your function or class.',
    tags: ['testing', 'TDD', 'pytest', 'jest'],
    prompt: `Write comprehensive unit tests for the following code. Include:\n- Happy path tests\n- Edge cases and boundary conditions\n- Error handling tests\n- Mocking dependencies where needed\n\nUse the appropriate test framework (pytest for Python, Jest for JavaScript).\n\n\`\`\`\n[PASTE YOUR CODE HERE]\n\`\`\``,
  },
  {
    id: 3, category: 'coding', emoji: '⚡', title: 'Optimize Performance',
    description: 'Analyze and optimize code for speed and memory efficiency.',
    tags: ['performance', 'optimization', 'algorithms'],
    prompt: `Analyze the following code for performance issues and provide an optimized version. Consider:\n- Time complexity improvements (Big O)\n- Memory optimization\n- Caching opportunities\n- Algorithmic improvements\n\nExplain why each optimization improves performance.\n\n\`\`\`\n[PASTE YOUR CODE HERE]\n\`\`\``,
  },
  {
    id: 4, category: 'writing', emoji: '✍️', title: 'Improve Writing',
    description: 'Enhance clarity, grammar, flow, and impact of any text.',
    tags: ['editing', 'grammar', 'clarity'],
    prompt: `Please improve the following text. Enhance grammar, clarity, conciseness, flow, and tone.\n\n---\n[PASTE YOUR TEXT HERE]\n---`,
  },
  {
    id: 5, category: 'analysis', emoji: '📊', title: 'SWOT Analysis',
    description: 'Structured strengths, weaknesses, opportunities, threats analysis.',
    tags: ['strategy', 'business', 'planning'],
    prompt: `Perform a detailed SWOT analysis for:\n\n**Subject:** [PRODUCT / COMPANY / IDEA]\n\nProvide 4-6 specific points for Strengths, Weaknesses, Opportunities, and Threats.`,
  },
  {
    id: 6, category: 'security', emoji: '🔐', title: 'Security Audit',
    description: 'Identify security vulnerabilities in your code or system.',
    tags: ['security', 'vulnerabilities', 'OWASP'],
    prompt: `Perform a security audit of the following code. Check for OWASP Top 10 vulnerabilities, authentication flaws, and sensitive data leaks.\n\n\`\`\`\n[PASTE CODE]\n\`\`\``,
  },
]

export default function PromptLibraryPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
  }, [activeCategory, search])

  const copyPrompt = (template) => {
    navigator.clipboard.writeText(template.prompt)
    setCopiedId(template.id)
    toast.success(`"${template.title}" copied!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const useInChat = (template) => {
    sessionStorage.setItem('inject_prompt', template.prompt)
    navigate('/chat')
    toast.info('Prompt injected into chat context!')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-accent-400" /> Prompt Library & Templates
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Curated collection of high-performance prompt templates — copy or inject into chat
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates by title, tag, or topic..."
          className="input-os pl-10 py-2.5 text-xs"
        />
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === id
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow border border-primary-400/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((template) => (
          <TiltCard key={template.id} maxTilt={6}>
            <div className="glass-card p-5 border border-white/10 flex flex-col justify-between space-y-4 h-full shadow-glow">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{template.emoji}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug">{template.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{template.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {template.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-primary-300 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button onClick={() => copyPrompt(template)} className="btn-os-ghost flex-1 text-xs py-2 gap-1 text-slate-300">
                  {copiedId === template.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
                <button onClick={() => useInChat(template)} className="btn-os-primary flex-1 text-xs py-2 gap-1 font-bold">
                  Use In Chat <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
